from app.schemas.onboard import ComputedMetrics, SafetyWarning

ACTIVITY_MULTIPLIERS: dict[str, float] = {
    "Sedentary": 1.2,
    "Lightly Active": 1.375,
    "Moderately Active": 1.55,
    "Very Active": 1.725,
    "Athlete": 1.9,
}

TARGET_DEFICIT_KCAL = 1000
FIBRE_G_MIN = 25
# 1 kg fat ≈ 7700 kcal; 7700 / 7 = 1100 kcal/day deficit threshold
AGGRESSIVE_LOSS_KCAL_PER_DAY = 1100


def compute_bmi(weight_kg: float, height_cm: float) -> float:
    height_m = height_cm / 100
    return round(weight_kg / (height_m ** 2), 2)


def compute_bmr(weight_kg: float, height_cm: float, age: int, sex: str) -> float:
    base = (10 * weight_kg) + (6.25 * height_cm) - (5 * age)
    if sex == "Male":
        return round(base + 5, 2)
    return round(base - 161, 2)


def compute_tdee(bmr: float, activity_type: str) -> float:
    multiplier = ACTIVITY_MULTIPLIERS.get(activity_type, 1.2)
    return round(bmr * multiplier, 2)


def compute_all_metrics(
    weight_kg: float,
    height_cm: float,
    age: int,
    sex: str,
    activity_type: str,
) -> ComputedMetrics:
    bmi = compute_bmi(weight_kg, height_cm)
    bmr = compute_bmr(weight_kg, height_cm, age, sex)
    tdee = compute_tdee(bmr, activity_type)

    caloric_floor = 1200 if sex in ("Female", "Other") else 1500
    daily_calorie_target = max(tdee - TARGET_DEFICIT_KCAL, caloric_floor)

    protein_g = max(weight_kg * 1.2, (daily_calorie_target * 0.30) / 4)
    fat_g = (daily_calorie_target * 0.25) / 9
    carbs_g = (daily_calorie_target - (protein_g * 4) - (fat_g * 9)) / 4
    hydration_litres = weight_kg * 0.035

    return ComputedMetrics(
        bmi=round(bmi, 2),
        bmr=round(bmr, 2),
        tdee=round(tdee, 2),
        daily_calorie_target=round(daily_calorie_target, 2),
        target_deficit_kcal=round(tdee - daily_calorie_target, 2),
        protein_g=round(protein_g, 2),
        fat_g=round(fat_g, 2),
        carbs_g=round(carbs_g, 2),
        fibre_g_min=FIBRE_G_MIN,
        hydration_litres=round(hydration_litres, 3),
    )


def validate_safety(
    bmi: float,
    age: int,
    tdee: float,
    daily_calorie_target: float,
    sex: str,
) -> list[SafetyWarning]:
    warnings: list[SafetyWarning] = []

    if age < 18:
        warnings.append(SafetyWarning(
            code="minor_advisory",
            message="Dietary plans for minors require guardian consent",
            severity="warning",
        ))

    if age > 60:
        warnings.append(SafetyWarning(
            code="senior_advisory",
            message="Additional caution advised for seniors",
            severity="warning",
        ))

    if bmi > 35:
        warnings.append(SafetyWarning(
            code="obesity_advisory",
            message="We recommend consulting a physician before starting",
            severity="critical",
        ))

    caloric_floor = 1200 if sex in ("Female", "Other") else 1500
    if tdee - TARGET_DEFICIT_KCAL < caloric_floor:
        warnings.append(SafetyWarning(
            code="deficit_capped",
            message="Target deficit adjusted to safe limit for your profile",
            severity="info",
        ))

    actual_deficit = tdee - daily_calorie_target
    if actual_deficit > AGGRESSIVE_LOSS_KCAL_PER_DAY:
        warnings.append(SafetyWarning(
            code="aggressive_loss",
            message="Rate of loss exceeds 1 kg/week — medical disclaimer applies",
            severity="warning",
        ))

    return warnings
