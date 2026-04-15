from datetime import date
from pydantic import BaseModel, Field


class ProgressLogRequest(BaseModel):
    challenge_id: str
    entry_date: date
    actual_weight_kg: float = Field(gt=0)
    calories_consumed: float = Field(ge=0)
    meals_completed: dict = Field(default_factory=dict)


class ProgressLogResponse(BaseModel):
    id: str
    challenge_id: str
    entry_date: date
    actual_weight_kg: float
    calories_consumed: float
    meals_completed: dict
