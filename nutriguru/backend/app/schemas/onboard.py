from datetime import date
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class PersonalInfo(BaseModel):
    name: str = Field(min_length=2, max_length=50)
    age: int = Field(ge=10, le=90)
    sex: str = Field(pattern="^(Male|Female|Other)$")
    weight_kg: float = Field(ge=30.0, le=200.0)
    height_cm: float = Field(ge=100.0, le=250.0)


class LifestyleInfo(BaseModel):
    activity_type: str = Field(pattern="^(Sedentary|Lightly Active|Moderately Active|Very Active|Athlete)$")
    dietary_pref: str = Field(pattern="^(Vegetarian|Non-Vegetarian|Eggetarian|Vegan)$")
    cuisine_pref: str = Field(pattern="^(North Indian|South Indian|West Indian|Mixed)$")


class ChallengeInfo(BaseModel):
    challenge_start: date
    challenge_end: date
    difficulty: str = Field(pattern="^(Low|Medium|High)$")

    @field_validator("challenge_end")
    @classmethod
    def validate_end_date(cls, v, info):
        start = info.data.get("challenge_start")
        if start and (v - start).days < 7:
            raise ValueError("Challenge must be at least 7 days")
        return v


class OnboardRequest(BaseModel):
    personal: PersonalInfo
    lifestyle: LifestyleInfo
    challenge: ChallengeInfo
    password: str = Field(min_length=6, max_length=128)

    @field_validator("password")
    @classmethod
    def validate_password_bytes(cls, v: str) -> str:
        # bcrypt supports up to 72 bytes.
        if len(v.encode("utf-8")) > 72:
            raise ValueError("Password must be 72 bytes or less")
        return v


class SafetyWarning(BaseModel):
    code: str
    message: str
    severity: str  # "info" | "warning" | "critical"


class ComputedMetrics(BaseModel):
    bmi: float
    bmr: float
    tdee: float
    daily_calorie_target: float
    target_deficit_kcal: float
    protein_g: float
    fat_g: float
    carbs_g: float
    fibre_g_min: float
    hydration_litres: float


class OnboardResponse(BaseModel):
    user_id: str
    challenge_id: str
    token: str
    metrics: ComputedMetrics
    warnings: list[SafetyWarning]
