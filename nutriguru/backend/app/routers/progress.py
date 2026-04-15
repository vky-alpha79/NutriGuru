import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.middleware.auth import get_current_user
from app.models.plan import Challenge, ProgressEntry
from app.schemas.progress import ProgressLogRequest, ProgressLogResponse

router = APIRouter()


@router.get("/progress")
async def get_progress(
    challenge_id: str = Query(...),
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    challenge = await db.get(Challenge, uuid.UUID(challenge_id))
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    if str(challenge.user_id) != user["sub"]:
        raise HTTPException(status_code=403, detail="Not your challenge")

    result = await db.execute(
        select(ProgressEntry)
        .where(ProgressEntry.challenge_id == challenge.id)
        .order_by(ProgressEntry.entry_date)
    )
    entries = result.scalars().all()

    total_days = (challenge.end_date - challenge.start_date).days
    days_elapsed = max(0, (date.today() - challenge.start_date).days)

    start_weight = entries[0].actual_weight_kg if entries else 0
    current_weight = entries[-1].actual_weight_kg if entries else 0
    weight_lost = start_weight - current_weight if entries else 0

    streak = 0
    for e in reversed(entries):
        completed = e.meals_completed or {}
        if all(completed.get(m) for m in ["breakfast", "lunch", "dinner"]):
            streak += 1
        else:
            break

    return {
        "challenge_id": str(challenge.id),
        "total_days": total_days,
        "days_elapsed": days_elapsed,
        "days_remaining": max(0, total_days - days_elapsed),
        "weight_lost_kg": round(weight_lost, 1),
        "current_weight_kg": current_weight,
        "streak_days": streak,
        "daily_calorie_target": challenge.daily_calorie_target,
        "entries": [
            {
                "date": e.entry_date.isoformat(),
                "weight_kg": e.actual_weight_kg,
                "calories": e.calories_consumed,
                "meals_completed": e.meals_completed,
            }
            for e in entries
        ],
    }


@router.post("/progress", response_model=ProgressLogResponse)
async def log_progress(
    payload: ProgressLogRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    challenge = await db.get(Challenge, uuid.UUID(payload.challenge_id))
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    if str(challenge.user_id) != user["sub"]:
        raise HTTPException(status_code=403, detail="Not your challenge")

    existing_result = await db.execute(
        select(ProgressEntry).where(
            ProgressEntry.challenge_id == challenge.id,
            ProgressEntry.entry_date == payload.entry_date,
        )
    )
    entry = existing_result.scalar_one_or_none()
    if entry:
        entry.actual_weight_kg = payload.actual_weight_kg
        entry.calories_consumed = payload.calories_consumed
        entry.meals_completed = payload.meals_completed
    else:
        entry = ProgressEntry(
            challenge_id=challenge.id,
            entry_date=payload.entry_date,
            actual_weight_kg=payload.actual_weight_kg,
            calories_consumed=payload.calories_consumed,
            meals_completed=payload.meals_completed,
        )
        db.add(entry)
    await db.flush()
    return ProgressLogResponse(
        id=str(entry.id),
        challenge_id=str(entry.challenge_id),
        entry_date=entry.entry_date,
        actual_weight_kg=entry.actual_weight_kg,
        calories_consumed=entry.calories_consumed,
        meals_completed=entry.meals_completed or {},
    )
