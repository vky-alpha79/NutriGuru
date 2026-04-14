from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from weasyprint import HTML

from app.models.user import User
from app.models.plan import Challenge, MealPlan

NAVY = "#1A1A2E"
ORANGE = "#FF6B35"
SURFACE = "#F8F9FB"
BORDER = "#E4E8EE"
TEXT_SEC = "#6B7280"
SUCCESS = "#10B981"
DANGER = "#EF4444"

BASE_CSS = f"""
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@page {{
    size: A4;
    margin: 20mm;
}}
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
body {{
    font-family: 'Inter', 'Nunito Sans', system-ui, sans-serif;
    font-size: 11pt;
    color: {NAVY};
    line-height: 1.5;
}}
h1 {{ font-size: 28pt; font-weight: 700; color: {NAVY}; }}
h2 {{ font-size: 16pt; font-weight: 600; color: {NAVY}; margin-bottom: 10px; }}
h3 {{ font-size: 13pt; font-weight: 600; color: {ORANGE}; margin-bottom: 6px; }}
.page-break {{ page-break-before: always; }}
.cover {{
    text-align: center;
    padding-top: 100px;
}}
.cover .logo {{
    font-size: 40pt;
    font-weight: 700;
    color: {ORANGE};
    margin-bottom: 6px;
}}
.cover .subtitle {{
    font-size: 14pt;
    color: {TEXT_SEC};
    margin-bottom: 40px;
}}
.cover .meta {{ font-size: 11pt; color: {TEXT_SEC}; margin: 6px 0; }}
.badge {{
    display: inline-block;
    padding: 4px 14px;
    border-radius: 20px;
    font-weight: 600;
    font-size: 10pt;
    color: #fff;
    background: {ORANGE};
}}
.metrics-grid {{
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 14px;
    margin-top: 16px;
}}
.metric-card {{
    background: {SURFACE};
    border: 1px solid {BORDER};
    border-radius: 10px;
    padding: 14px;
    text-align: center;
}}
.metric-card .label {{ font-size: 9pt; color: {TEXT_SEC}; }}
.metric-card .value {{ font-size: 18pt; font-weight: 700; color: {NAVY}; }}
table {{
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    font-size: 10pt;
}}
th {{
    background: {NAVY};
    color: #fff;
    padding: 6px 10px;
    text-align: left;
}}
td {{
    padding: 5px 10px;
    border-bottom: 1px solid {BORDER};
}}
tr:nth-child(even) td {{ background: {SURFACE}; }}
.meal-card {{
    border: 1px solid {BORDER};
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 18px;
}}
.meal-header {{
    background: {NAVY};
    color: #fff;
    padding: 10px 16px;
    border-radius: 8px;
    margin-bottom: 12px;
}}
.meal-header .dish {{ font-size: 14pt; font-weight: 600; }}
.meal-header .region {{ font-size: 9pt; opacity: 0.8; }}
.steps ol {{ padding-left: 18px; margin-top: 6px; }}
.steps li {{ margin-bottom: 4px; }}
.rationale {{ background: {SURFACE}; padding: 10px; border-radius: 8px; margin-top: 10px; }}
.rationale p {{ margin: 4px 0; font-size: 10pt; }}
.confidence {{
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
}}
.confidence-bar {{
    flex: 1;
    height: 10px;
    background: {BORDER};
    border-radius: 5px;
    overflow: hidden;
}}
.confidence-fill {{ height: 100%; background: {SUCCESS}; border-radius: 5px; }}
.tips {{ margin-top: 10px; }}
.tips li {{ list-style: none; padding-left: 12px; position: relative; margin-bottom: 3px; }}
.tips li::before {{ content: '\\2726'; position: absolute; left: 0; color: {ORANGE}; }}
.swaps {{ margin-top: 8px; }}
.swaps .swap {{ font-size: 10pt; color: {TEXT_SEC}; margin-bottom: 2px; }}
.disclaimer {{
    border-top: 2px solid {DANGER};
    padding-top: 18px;
    margin-top: 40px;
    font-size: 9pt;
    color: {TEXT_SEC};
    line-height: 1.7;
}}
.disclaimer h2 {{ color: {DANGER}; }}
"""


def _esc(val: Any) -> str:
    """Escape HTML entities."""
    return str(val).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def _cover_page(user: User, challenge: Challenge) -> str:
    return f"""
    <div class="cover">
        <div class="logo">NutriGuru</div>
        <div class="subtitle">Your 21-Day Anti-Ageing Fat Loss Plan</div>
        <p class="meta">Prepared for: <strong>{_esc(user.name)}</strong></p>
        <p class="meta">Challenge: {challenge.start_date.strftime('%d/%m/%Y')}
            &rarr; {challenge.end_date.strftime('%d/%m/%Y')}</p>
        <p class="meta">Goal: Lose 6 kg in 21 Days</p>
        <p class="meta">Difficulty: <span class="badge">{_esc(challenge.difficulty)}</span></p>
        <p class="meta">Daily Calorie Target: <strong>{challenge.daily_calorie_target:.0f} kcal</strong></p>
        <p class="meta">Cuisine: {_esc(user.cuisine_pref)} &middot; {_esc(user.dietary_pref)}</p>
    </div>
    """


def _metrics_page(user: User, challenge: Challenge) -> str:
    deficit = user.tdee - challenge.daily_calorie_target
    protein_pct = round((challenge.protein_target_g * 4) / challenge.daily_calorie_target * 100)
    fat_pct = round((challenge.fat_target_g * 9) / challenge.daily_calorie_target * 100)
    carbs_pct = 100 - protein_pct - fat_pct

    return f"""
    <div class="page-break"></div>
    <h2>Profile &amp; Metrics Dashboard</h2>
    <div class="metrics-grid">
        <div class="metric-card">
            <div class="label">BMI</div>
            <div class="value">{user.bmi:.1f}</div>
        </div>
        <div class="metric-card">
            <div class="label">BMR</div>
            <div class="value">{user.bmr:.0f} kcal</div>
        </div>
        <div class="metric-card">
            <div class="label">TDEE</div>
            <div class="value">{user.tdee:.0f} kcal</div>
        </div>
        <div class="metric-card">
            <div class="label">Daily Target</div>
            <div class="value">{challenge.daily_calorie_target:.0f} kcal</div>
        </div>
        <div class="metric-card">
            <div class="label">Deficit</div>
            <div class="value">{deficit:.0f} kcal</div>
        </div>
        <div class="metric-card">
            <div class="label">Hydration</div>
            <div class="value">{user.weight_kg * 0.035:.1f} L</div>
        </div>
    </div>

    <h3 style="margin-top:20px;">Macro Targets</h3>
    <table>
        <tr><th>Macro</th><th>Grams/day</th><th>% of Calories</th></tr>
        <tr><td>Protein</td><td>{challenge.protein_target_g:.0f} g</td><td>{protein_pct}%</td></tr>
        <tr><td>Fat</td><td>{challenge.fat_target_g:.0f} g</td><td>{fat_pct}%</td></tr>
        <tr><td>Carbs</td><td>{challenge.carbs_target_g:.0f} g</td><td>{carbs_pct}%</td></tr>
        <tr><td>Fibre (min)</td><td>{challenge.fibre_target_g:.0f} g</td><td>&mdash;</td></tr>
    </table>
    """


def _meal_card(meal: dict, meal_type: str) -> str:
    name = _esc(meal.get("dish_name", meal_type))
    region = _esc(meal.get("cuisine_region", ""))
    prep = meal.get("prep_time_min", "?")
    cook = meal.get("cook_time_min", "?")
    recipe = meal.get("recipe", {})
    macros = meal.get("macros", {})
    rationale = meal.get("health_rationale", {})
    confidence = meal.get("confidence_score", 0)
    tips = meal.get("expert_tips", [])
    swaps = meal.get("swap_options", [])

    ingredients_html = ""
    for ing in recipe.get("ingredients", []):
        ingredients_html += (
            f"<tr><td>{_esc(ing.get('item', ''))}</td>"
            f"<td>{ing.get('quantity', '')}</td>"
            f"<td>{_esc(ing.get('unit', ''))}</td></tr>"
        )

    steps_html = ""
    for step in recipe.get("steps", []):
        steps_html += f"<li>{_esc(step)}</li>"

    macros_html = ""
    for key in ("calories_kcal", "protein_g", "carbs_g", "fat_g", "fibre_g"):
        label = key.replace("_", " ").replace("kcal", "(kcal)").replace(" g", " (g)")
        macros_html += f"<tr><td>{label.title()}</td><td>{macros.get(key, 0):.1f}</td></tr>"

    tips_html = "".join(f"<li>{_esc(t)}</li>" for t in tips)
    swaps_html = "".join(
        f'<div class="swap">{_esc(s.get("ingredient",""))} &rarr; {_esc(s.get("swap",""))} '
        f'<em>({_esc(s.get("reason",""))})</em></div>'
        for s in swaps
    )

    pct = int(confidence * 100)
    confidence_color = SUCCESS if pct >= 70 else ORANGE

    return f"""
    <div class="meal-card">
        <div class="meal-header">
            <div class="dish">{meal_type}: {name}</div>
            <div class="region">{region} &middot; Prep {prep} min &middot; Cook {cook} min</div>
        </div>

        <h3>Ingredients</h3>
        <table>
            <tr><th>Ingredient</th><th>Qty</th><th>Unit</th></tr>
            {ingredients_html}
        </table>

        <div class="steps">
            <h3>Steps</h3>
            <ol>{steps_html}</ol>
        </div>

        <h3>Macros</h3>
        <table>
            <tr><th>Nutrient</th><th>Amount</th></tr>
            {macros_html}
        </table>

        <div class="rationale">
            <p><strong>Weight Loss:</strong> {_esc(rationale.get('weight_loss_benefit', ''))}</p>
            <p><strong>Anti-Ageing:</strong> {_esc(rationale.get('anti_ageing_benefit', ''))}</p>
            <p><strong>Ayurvedic Note:</strong> {_esc(rationale.get('ayurvedic_note', ''))}</p>
        </div>

        <div class="confidence">
            <span>Confidence: {pct}%</span>
            <div class="confidence-bar">
                <div class="confidence-fill" style="width:{pct}%;background:{confidence_color};"></div>
            </div>
        </div>

        <div class="tips">
            <h3>Expert Tips</h3>
            <ul>{tips_html}</ul>
        </div>

        <div class="swaps">
            <h3>Swap Options</h3>
            {swaps_html}
        </div>
    </div>
    """


def _disclaimer_page() -> str:
    ts = datetime.now(timezone.utc).strftime("%d %B %Y, %H:%M UTC")
    return f"""
    <div class="page-break"></div>
    <div class="disclaimer">
        <h2>Medical Disclaimer</h2>
        <p>
            This AI-generated meal plan is for informational and motivational purposes only.
            It does not constitute medical advice, clinical diagnosis, or personalised
            dietetic consultation. Consult a FSSAI-registered Dietitian or qualified
            Physician before beginning any caloric restriction programme.
        </p>
        <p style="margin-top:10px;"><strong>NOT recommended without physician clearance for:</strong></p>
        <ul style="padding-left:18px;margin-top:6px;">
            <li>Pregnant or breastfeeding women</li>
            <li>Diagnosed Type 1 or Type 2 diabetes</li>
            <li>Active cardiovascular, renal, or hepatic conditions</li>
            <li>Individuals currently on prescription medication</li>
            <li>Individuals with a BMI below 18.5</li>
        </ul>
        <p style="margin-top:16px;">Generated by NutriGuru AI &middot; {ts}</p>
    </div>
    """


def generate_pdf(
    user: User,
    challenge: Challenge,
    meal_plans: list[MealPlan],
) -> bytes:
    """Build a complete multi-page PDF and return raw bytes."""
    body_parts: list[str] = [
        _cover_page(user, challenge),
        _metrics_page(user, challenge),
    ]

    for plan in meal_plans:
        body_parts.append(f'<div class="page-break"><h2>Day {plan.day_number}</h2></div>')
        for meal_type, meal_data in [
            ("Breakfast", plan.breakfast),
            ("Lunch", plan.lunch),
            ("Dinner", plan.dinner),
        ]:
            body_parts.append(_meal_card(meal_data, meal_type))

    body_parts.append(_disclaimer_page())

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>{BASE_CSS}</style>
</head>
<body>
{''.join(body_parts)}
</body>
</html>"""

    return HTML(string=html).write_pdf()
