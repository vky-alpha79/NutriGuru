MEAL_PLAN_TEMPLATE = """User Profile:
  Name:             {name}
  Age:              {age} | Sex: {sex}
  Weight:           {weight_kg} kg | Height: {height_cm} cm | BMI: {bmi:.1f}
  Activity Level:   {activity_type}
  TDEE:             {tdee:.0f} kcal/day
  Daily Target:     {daily_calorie_target:.0f} kcal/day (deficit: {target_deficit_kcal} kcal)
  Dietary Pref:     {dietary_pref}
  Cuisine Pref:     {cuisine_pref}
  Challenge:        {challenge_start} to {challenge_end} ({difficulty} difficulty)

INSTRUCTION:
Generate a complete daily diet plan for Day {day_number} of the challenge.
Include exactly 3 meals: Breakfast, Lunch, and Dinner.

For each meal, return the following JSON structure exactly:
{{
  "meal_type": "Breakfast | Lunch | Dinner",
  "dish_name": "string — authentic Indian dish name",
  "cuisine_region": "{cuisine_pref}",
  "serves": 1,
  "prep_time_min": integer,
  "cook_time_min": integer,
  "recipe": {{
    "ingredients": [
      {{ "item": "string", "quantity": float, "unit": "g | ml | tsp | tbsp | piece",
        "notes": "optional" }}
    ],
    "steps": ["Step 1: ...", "Step 2: ..."],
    "cooking_tip": "string — 1 Indian kitchen hack"
  }},
  "macros": {{
    "calories_kcal": float, "protein_g": float, "carbs_g": float,
    "fat_g": float, "fibre_g": float, "sugar_g": float, "sodium_mg": float
  }},
  "micros": {{
    "vitamin_c_mg": float, "vitamin_d_iu": float, "iron_mg": float,
    "calcium_mg": float, "zinc_mg": float, "b12_mcg": float,
    "folate_mcg": float, "magnesium_mg": float, "potassium_mg": float,
    "omega3_mg": float
  }},
  "health_rationale": {{
    "weight_loss_benefit": "string",
    "anti_ageing_benefit": "string",
    "ayurvedic_note": "string"
  }},
  "confidence_score": float,
  "confidence_basis": "string",
  "expert_tips": ["string", "string"],
  "swap_options": [{{ "ingredient": "string", "swap": "string", "reason": "string" }}],
  "allergen_flags": []
}}

Return a JSON object with keys: "breakfast", "lunch", "dinner", "daily_summary".

The daily_summary must include:
{{
  "total_calories_kcal": float,
  "total_protein_g": float, "total_carbs_g": float, "total_fat_g": float,
  "total_fibre_g": float, "deficit_achieved_kcal": float,
  "macro_split_pct": {{ "protein": float, "carbs": float, "fat": float }},
  "hydration_target_litres": {hydration:.1f},
  "supplements_note": "string",
  "overall_confidence": float,
  "day_theme": "string"
}}

CONSTRAINTS:
  - Cuisine MUST match {cuisine_pref}
  - Dietary MUST match {dietary_pref}
  - Total daily calories = {daily_calorie_target:.0f} ± 50 kcal
  - Protein ≥ {protein_g:.0f}g total
  - Fibre ≥ 25g total
  - ≥1 antioxidant-rich ingredient per meal
  - ≥1 probiotic or prebiotic source across the day
  - Difficulty {difficulty}
  - All ingredients available in Indian grocery stores
  - Return ONLY valid JSON, no markdown."""
