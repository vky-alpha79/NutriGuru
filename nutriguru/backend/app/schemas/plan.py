from typing import Optional
from pydantic import BaseModel, Field


class PlanGenerateRequest(BaseModel):
    challenge_id: str
    day_number: int = Field(ge=1, le=90)


class MealMacros(BaseModel):
    calories_kcal: float
    protein_g: float
    carbs_g: float
    fat_g: float
    fibre_g: float
    sugar_g: float = 0
    sodium_mg: float = 0


class MealMicros(BaseModel):
    vitamin_c_mg: float = 0
    vitamin_d_iu: float = 0
    iron_mg: float = 0
    calcium_mg: float = 0
    zinc_mg: float = 0
    b12_mcg: float = 0
    folate_mcg: float = 0
    magnesium_mg: float = 0
    potassium_mg: float = 0
    omega3_mg: float = 0


class Ingredient(BaseModel):
    item: str
    quantity: float
    unit: str
    notes: Optional[str] = None


class SwapOption(BaseModel):
    ingredient: str
    swap: str
    reason: str


class MealData(BaseModel):
    meal_type: str
    dish_name: str
    cuisine_region: str
    serves: int = 1
    prep_time_min: int
    cook_time_min: int
    ingredients: list[Ingredient]
    steps: list[str]
    cooking_tip: str
    macros: MealMacros
    micros: MealMicros
    health_rationale: dict
    confidence_score: float
    confidence_basis: str
    expert_tips: list[str]
    swap_options: list[SwapOption]
    allergen_flags: list[str] = []


class DailySummary(BaseModel):
    total_calories_kcal: float
    total_protein_g: float
    total_carbs_g: float
    total_fat_g: float
    total_fibre_g: float
    deficit_achieved_kcal: float
    macro_split_pct: dict
    hydration_target_litres: float
    supplements_note: str = ""
    overall_confidence: float
    day_theme: str


class PlanGenerateResponse(BaseModel):
    day_number: int
    breakfast: MealData
    lunch: MealData
    dinner: MealData
    daily_summary: DailySummary
    model_used: str


class PlanExportRequest(BaseModel):
    challenge_id: str


class PlanExportResponse(BaseModel):
    job_id: str
    status: str
    download_url: Optional[str] = None
