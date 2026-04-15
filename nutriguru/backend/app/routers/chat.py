import asyncio
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import APIRouter, Depends

from app.db.database import get_db
from app.middleware.auth import get_current_user
from app.models.plan import Challenge
from app.models.user import User
from app.schemas.chat import ChatRequest, ChatResponse, SecurityInfo
from app.services.llm_router import route_llm_request
from app.services.lakera_guard import (
    screen_input_only,
    screen_holistic,
    handle_pii_detection,
    progressive_response,
    get_current_mode,
)
from app.services.audit import log_audit_event
from app.prompts.system_prompt import SYSTEM_PROMPT

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(
    req: ChatRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user_id = user["sub"]
    mode = await get_current_mode()

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    user_record = await db.get(User, uuid.UUID(user_id))
    current_challenge = None
    if user_record:
        challenge_result = await db.execute(
            select(Challenge)
            .where(Challenge.user_id == user_record.id)
            .order_by(Challenge.created_at.desc())
            .limit(1)
        )
        current_challenge = challenge_result.scalar_one_or_none()
        profile_context = (
            "User profile context for personalization:\n"
            f"Name: {user_record.name}\n"
            f"Age: {user_record.age}, Sex: {user_record.sex}\n"
            f"Weight: {user_record.weight_kg}kg, Height: {user_record.height_cm}cm, BMI: {user_record.bmi:.1f}\n"
            f"Activity: {user_record.activity_type}\n"
            f"Dietary Preference: {user_record.dietary_pref}\n"
            f"Cuisine Preference: {user_record.cuisine_pref}\n"
        )
        if current_challenge:
            profile_context += (
                f"Current challenge: {current_challenge.start_date} to {current_challenge.end_date}\n"
                f"Calorie target: {current_challenge.daily_calorie_target:.0f} kcal/day\n"
                f"Protein target: {current_challenge.protein_target_g:.0f} g/day\n"
                f"Difficulty: {current_challenge.difficulty}\n"
            )
        messages.append({"role": "system", "content": profile_context})

    for msg in req.history:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": req.message})

    input_task = asyncio.create_task(
        screen_input_only(messages, req.message, user_id, req.session_id)
    )
    llm_task = asyncio.create_task(route_llm_request(messages))

    input_result = await input_task
    if input_result.get("flagged"):
        llm_task.cancel()
        pr = await progressive_response(input_result, "input")
        await log_audit_event(
            user_id=user_id,
            session_id=req.session_id,
            scan_type="input",
            result=input_result,
            action=pr["action"],
            mode=mode.value,
        )
        return ChatResponse(
            reply=pr["message"],
            active_model="blocked",
            security=SecurityInfo(
                flagged=True, action=pr["action"], scan_type="input", lakera_mode=mode.value
            ),
        )

    llm_response, active_model = await llm_task

    pii_cleaned = await handle_pii_detection(
        input_result, llm_response, direction="output"
    )

    holistic_result = await screen_holistic(
        messages, pii_cleaned, user_id, req.session_id, ""
    )

    if holistic_result.get("flagged"):
        pr = await progressive_response(holistic_result, "holistic")
        await log_audit_event(
            user_id=user_id,
            session_id=req.session_id,
            scan_type="holistic",
            result=holistic_result,
            action=pr["action"],
            mode=mode.value,
            active_model=active_model,
        )
        return ChatResponse(
            reply=pr.get("message", "I can only help with nutrition topics."),
            active_model=active_model,
            security=SecurityInfo(
                flagged=True, action=pr["action"], scan_type="holistic", lakera_mode=mode.value
            ),
        )

    await log_audit_event(
        user_id=user_id,
        session_id=req.session_id,
        scan_type="holistic",
        result=holistic_result,
        action="allow",
        mode=mode.value,
        active_model=active_model,
    )

    return ChatResponse(
        reply=pii_cleaned,
        active_model=active_model,
        security=SecurityInfo(
            flagged=False, action="allow", scan_type="holistic", lakera_mode=mode.value
        ),
    )
