from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas.onboard import OnboardRequest, OnboardResponse
from app.services.nutrition import compute_all_metrics, validate_safety
from app.models.user import User
from app.models.plan import Challenge
from app.middleware.auth import create_access_token, hash_password

router = APIRouter()


@router.post("/onboard", response_model=OnboardResponse)
async def onboard_user(req: OnboardRequest, db: AsyncSession = Depends(get_db)):
    p = req.personal
    l = req.lifestyle
    c = req.challenge

    metrics = compute_all_metrics(
        weight_kg=p.weight_kg,
        height_cm=p.height_cm,
        age=p.age,
        sex=p.sex,
        activity_type=l.activity_type,
    )
    warnings = validate_safety(
        bmi=metrics.bmi,
        age=p.age,
        tdee=metrics.tdee,
        daily_calorie_target=metrics.daily_calorie_target,
        sex=p.sex,
    )

    user = User(
        name=p.name,
        age=p.age,
        sex=p.sex,
        weight_kg=p.weight_kg,
        height_cm=p.height_cm,
        bmi=metrics.bmi,
        bmr=metrics.bmr,
        tdee=metrics.tdee,
        activity_type=l.activity_type,
        dietary_pref=l.dietary_pref,
        cuisine_pref=l.cuisine_pref,
        password_hash=hash_password(req.password),
    )
    db.add(user)
    await db.flush()

    challenge = Challenge(
        user_id=user.id,
        start_date=c.challenge_start,
        end_date=c.challenge_end,
        difficulty=c.difficulty,
        daily_calorie_target=metrics.daily_calorie_target,
        protein_target_g=metrics.protein_g,
        fat_target_g=metrics.fat_g,
        carbs_target_g=metrics.carbs_g,
    )
    db.add(challenge)
    await db.flush()

    token = create_access_token(str(user.id), user.role)

    return OnboardResponse(
        user_id=str(user.id),
        challenge_id=str(challenge.id),
        token=token,
        metrics=metrics,
        warnings=warnings,
    )
