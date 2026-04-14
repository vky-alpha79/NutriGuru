import json
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.middleware.auth import get_current_user
from app.schemas.plan import (
    PlanGenerateRequest,
    PlanGenerateResponse,
    PlanExportRequest,
    PlanExportResponse,
)
from app.models.plan import Challenge, MealPlan
from app.models.user import User
from app.services.llm_router import route_llm_request
from app.services.lakera_guard import screen_holistic, get_current_mode
from app.services.audit import log_audit_event
from app.prompts.system_prompt import SYSTEM_PROMPT
from app.prompts.meal_plan_prompt import MEAL_PLAN_TEMPLATE

router = APIRouter()


@router.post("/plan/generate", response_model=PlanGenerateResponse)
async def generate_plan(
    req: PlanGenerateRequest,
    user_info: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user_id = user_info["sub"]

    challenge = await db.get(Challenge, uuid.UUID(req.challenge_id))
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    user = await db.get(User, challenge.user_id)
    if not user or str(user.id) != user_id:
        raise HTTPException(status_code=403, detail="Not your challenge")

    prompt_text = MEAL_PLAN_TEMPLATE.format(
        name=user.name,
        age=user.age,
        sex=user.sex,
        weight_kg=user.weight_kg,
        height_cm=user.height_cm,
        bmi=user.bmi,
        activity_type=user.activity_type,
        tdee=user.tdee,
        daily_calorie_target=challenge.daily_calorie_target,
        target_deficit_kcal=1000,
        dietary_pref=user.dietary_pref,
        cuisine_pref=user.cuisine_pref,
        challenge_start=challenge.start_date.strftime("%d/%m/%Y"),
        challenge_end=challenge.end_date.strftime("%d/%m/%Y"),
        difficulty=challenge.difficulty,
        day_number=req.day_number,
        protein_g=challenge.protein_target_g,
        hydration=user.weight_kg * 0.035,
    )

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": prompt_text},
    ]

    llm_response, active_model = await route_llm_request(messages)

    mode = await get_current_mode()
    holistic = await screen_holistic(messages, llm_response, user_id, "", "")

    if holistic.get("flagged"):
        await log_audit_event(
            user_id=user_id,
            session_id="",
            scan_type="holistic",
            result=holistic,
            action="block",
            mode=mode.value,
            active_model=active_model,
        )
        raise HTTPException(status_code=422, detail="Generated content was flagged by security")

    try:
        plan_data = json.loads(llm_response)
    except json.JSONDecodeError:
        start = llm_response.find("{")
        end = llm_response.rfind("}") + 1
        if start >= 0 and end > start:
            plan_data = json.loads(llm_response[start:end])
        else:
            raise HTTPException(status_code=500, detail="Failed to parse meal plan")

    meal_plan = MealPlan(
        challenge_id=challenge.id,
        day_number=req.day_number,
        breakfast=plan_data.get("breakfast", {}),
        lunch=plan_data.get("lunch", {}),
        dinner=plan_data.get("dinner", {}),
        daily_summary=plan_data.get("daily_summary", {}),
        model_used=active_model,
    )
    db.add(meal_plan)
    await db.flush()

    return PlanGenerateResponse(
        day_number=req.day_number,
        breakfast=plan_data["breakfast"],
        lunch=plan_data["lunch"],
        dinner=plan_data["dinner"],
        daily_summary=plan_data["daily_summary"],
        model_used=active_model,
    )


@router.post("/plan/export")
async def export_plan(
    req: PlanExportRequest,
    user_info: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from fastapi.responses import Response
    from app.services.pdf_generator import generate_pdf

    challenge = await db.get(Challenge, uuid.UUID(req.challenge_id))
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    user = await db.get(User, challenge.user_id)
    if not user or str(user.id) != user_info["sub"]:
        raise HTTPException(status_code=403, detail="Not your challenge")

    result = await db.execute(
        select(MealPlan)
        .where(MealPlan.challenge_id == challenge.id)
        .order_by(MealPlan.day_number)
    )
    plans = result.scalars().all()

    if not plans:
        raise HTTPException(status_code=404, detail="No meal plans generated yet")

    pdf_bytes = generate_pdf(user, challenge, list(plans))
    safe_name = user.name.replace(" ", "_").lower()
    filename = f"nutriguru_{safe_name}_{challenge.start_date.isoformat()}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
