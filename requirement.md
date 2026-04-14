# NutriGuru — Diet Recommendation Bot
## Complete Build Specification & Structured Prompt Document

**Version:** 2.0  
**Project:** NutriGuru — Anti-Ageing Diet Recommender (India Geo)  
**Lakera Project:** Diet Recommendation Bot (`project-1344722930`)  
**Classification:** Internal Engineering Reference  

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [System Prompt & Role Definition](#2-system-prompt--role-definition)
3. [User Onboarding — Structured Input Schema](#3-user-onboarding--structured-input-schema)
4. [Meal Plan Generation Prompt](#4-meal-plan-generation-prompt)
5. [PDF Output Specification](#5-pdf-output-specification)
6. [Model Routing & Fallback Chain](#6-model-routing--fallback-chain)
7. [Lakera Guard — Full Integration Spec](#7-lakera-guard--full-integration-spec)
8. [Enterprise UI/UX Specification](#8-enterprise-uiux-specification)
9. [Tech Stack & Architecture](#9-tech-stack--architecture)
10. [API Reference Summary](#10-api-reference-summary)

---

## 1. Product Overview

### 1.1 Mission Statement

NutriGuru is an AI-powered, enterprise-grade diet recommendation chatbot tailored for the Indian market. It combines evidence-based nutrition science with anti-ageing longevity research to generate personalised, culturally authentic 3-meal-per-day diet plans with a primary objective of sustainable fat loss combined with cellular health optimisation.

### 1.2 Core Objectives

| Objective | Target |
|-----------|--------|
| Weight Loss Goal | 6 kg in 21 days |
| Caloric Deficit | ~1,000 kcal/day (safe upper bound) |
| Minimum Caloric Floor | 1,200 kcal/day (women) / 1,500 kcal/day (men) |
| Protein Target | ≥ 1.2 g/kg body weight/day |
| Cultural Alignment | North Indian / South Indian / West Indian cuisine |
| Dietary Scope | Vegetarian, Non-Vegetarian, Eggetarian, Vegan |
| Security Posture | Lakera Guard enabled by default (all use cases) |

### 1.3 User Persona

Indian adults aged 25–55, urban professionals, health-conscious, moderate digital literacy. Primary interface: web browser. Secondary: mobile-responsive web.

---

## 2. System Prompt & Role Definition

```
SYSTEM ROLE DEFINITION
──────────────────────

You are NutriGuru, an expert Indian diet and longevity coach AI built by a team of 
registered dietitians, Ayurvedic practitioners, and anti-ageing researchers.

Your specialisation:
  - Designing culturally authentic Indian meal plans (North/South/West regional cuisine)
  - Evidence-based fat loss through sustainable caloric deficit
  - Anti-ageing nutrition: telomere-protective foods, NAD+ precursors, antioxidant density
  - INDIA GEO: all portions, ingredients, and cooking methods must be locally available 
    and culturally resonant for Indian households

Tone and communication style:
  - Warm, motivational, coach-like — never clinical or robotic
  - Address user by first name throughout the conversation
  - Use simple language; avoid jargon unless explaining nutrients
  - Always frame restrictions as empowerment ("Here's what fuels you") not deprivation

Hard safety constraints (NEVER violate):
  - Caloric floor: 1,200 kcal/day (women), 1,500 kcal/day (men) — absolute minimum
  - Never recommend fasting >16 hours without explicit medical clearance flag
  - For BMI > 35, always include physician consultation advisory
  - For age > 60 or age < 18, escalate with additional caution messaging
  - Rate of loss >1 kg/week must surface a medical disclaimer
  - 6 kg in 21 days = ~285g fat/day loss = ~1,000 kcal deficit — flag this as aggressive 
    and require user acknowledgement before proceeding

Scope enforcement (HARD BOUNDARY):
  - Respond ONLY to diet, nutrition, wellness, and meal planning queries
  - Politely decline all off-topic requests: "I'm your nutrition coach — for other topics, 
    please use a general assistant."
  - Never provide medical diagnoses, medication advice, or clinical treatment plans
  - Never generate harmful, political, or legally sensitive content

Knowledge base references:
  - ICMR Dietary Guidelines for Indians (2024)
  - National Institute of Nutrition (NIN) RDA tables — Indian standards
  - WHO anti-ageing nutrition guidelines
  - Ayurvedic principles for Vata/Pitta/Kapha balance (contextual, non-prescriptive)
```

---

## 3. User Onboarding — Structured Input Schema

### 3.1 Input Collection Flow

Collect all fields using a step-by-step wizard UI (one field group per screen). Validate each field inline before enabling the "Next" button.

```json
REQUIRED USER INPUTS
{
  "personal": {
    "name":           { "type": "string",  "min": 2, "max": 50, "label": "Full Name" },
    "age":            { "type": "integer", "min": 10, "max": 90, "label": "Age" },
    "sex":            { "type": "enum",    "values": ["Male", "Female", "Other"] },
    "weight_kg":      { "type": "float",   "min": 30.0, "max": 200.0, "unit": "kg" },
    "height_cm":      { "type": "float",   "min": 100.0, "max": 250.0, "unit": "cm" }
  },
  "lifestyle": {
    "activity_type":  { 
      "type": "enum", 
      "values": ["Sedentary", "Lightly Active", "Moderately Active", "Very Active", "Athlete"],
      "descriptions": {
        "Sedentary":         "Desk job, no exercise",
        "Lightly Active":    "Light exercise 1–3 days/week",
        "Moderately Active": "Moderate exercise 3–5 days/week",
        "Very Active":       "Hard exercise 6–7 days/week",
        "Athlete":           "Twice daily training / physical job"
      }
    },
    "dietary_pref":   { "type": "enum", "values": ["Vegetarian", "Non-Vegetarian", "Eggetarian", "Vegan"] },
    "cuisine_pref":   { "type": "enum", "values": ["North Indian", "South Indian", "West Indian", "Mixed"] }
  },
  "challenge": {
    "challenge_start": { "type": "date", "format": "DD/MM/YYYY", "min": "today" },
    "challenge_end":   { "type": "date", "format": "DD/MM/YYYY", "auto_suggest": "start + 21 days" },
    "difficulty":      { "type": "enum", "values": ["Low", "Medium", "High"],
      "descriptions": {
        "Low":    "Simple 5-step recipes, ≤6 ingredients, common pantry items",
        "Medium": "Moderate prep, ≤8 steps, ≤10 ingredients",
        "High":   "Advanced techniques, full meal prep, complex flavour profiles"
      }
    }
  }
}
```

### 3.2 Server-Side Computed Fields

These must be calculated server-side. Never ask the user for these values.

```python
# BMI
bmi = weight_kg / (height_cm / 100) ** 2

# BMR — Mifflin-St Jeor (most accurate for Indian population)
if sex == "Male":
    bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
else:
    bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161

# Activity Multipliers
activity_multipliers = {
    "Sedentary":         1.2,
    "Lightly Active":    1.375,
    "Moderately Active": 1.55,
    "Very Active":       1.725,
    "Athlete":           1.9
}
tdee = bmr * activity_multipliers[activity_type]

# Deficit Calculation
# 6 kg / 21 days = 285g fat/day ≈ 1,000 kcal/day deficit
target_deficit_kcal = 1000

# Caloric floor enforcement
caloric_floor = 1200 if sex in ["Female", "Other"] else 1500
daily_calorie_target = max(tdee - target_deficit_kcal, caloric_floor)

# Macro splits (default — adjust by difficulty and dietary preference)
protein_g   = max(weight_kg * 1.2, (daily_calorie_target * 0.30) / 4)
fat_g       = (daily_calorie_target * 0.25) / 9
carbs_g     = (daily_calorie_target - (protein_g * 4) - (fat_g * 9)) / 4
fibre_g_min = 25  # ICMR minimum
```

### 3.3 Validation Rules

| Field | Validation | Error Message |
|-------|-----------|---------------|
| `challenge_end` | Must be ≥ `challenge_start + 7` | "Challenge must be at least 7 days" |
| `weight_kg` | Decimal, 1 decimal place max | "Enter weight in kg, e.g. 72.5" |
| `age < 18` | Show parental advisory | "Dietary plans for minors require guardian consent" |
| `bmi > 35` | Show obesity advisory | "We recommend consulting a physician before starting" |
| `tdee - 1000 < floor` | Auto-cap at floor | "Target deficit adjusted to safe limit for your profile" |

---

## 4. Meal Plan Generation Prompt

### 4.1 Prompt Template

```
MEAL PLAN GENERATION
────────────────────

User Profile:
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
Generate a complete daily diet plan for Day 1 of the challenge.
Include exactly 3 meals: Breakfast, Lunch, and Dinner.

For each meal, return the following JSON structure exactly:

{
  "meal_type": "Breakfast | Lunch | Dinner",
  "dish_name": "string — authentic Indian dish name",
  "cuisine_region": "North Indian | South Indian | West Indian",
  "serves": 1,
  "prep_time_min": integer,
  "cook_time_min": integer,
  "recipe": {
    "ingredients": [
      { "item": "string", "quantity": float, "unit": "g | ml | tsp | tbsp | piece", 
        "notes": "optional — e.g. 'soaked overnight'" }
    ],
    "steps": [
      "Step 1: ...",
      "Step 2: ..."
    ],
    "cooking_tip": "string — 1 Indian kitchen hack to enhance nutrition or save time"
  },
  "macros": {
    "calories_kcal": float,
    "protein_g":     float,
    "carbs_g":       float,
    "fat_g":         float,
    "fibre_g":       float,
    "sugar_g":       float,
    "sodium_mg":     float
  },
  "micros": {
    "vitamin_c_mg":  float,
    "vitamin_d_iu":  float,
    "iron_mg":       float,
    "calcium_mg":    float,
    "zinc_mg":       float,
    "b12_mcg":       float,
    "folate_mcg":    float,
    "magnesium_mg":  float,
    "potassium_mg":  float,
    "omega3_mg":     float
  },
  "rda_coverage": {
    "vitamin_c_pct": float,
    "iron_pct":      float,
    "calcium_pct":   float,
    "protein_pct":   float
  },
  "health_rationale": {
    "weight_loss_benefit":   "string — specific mechanism (e.g. high fibre → GLP-1 response)",
    "anti_ageing_benefit":   "string — specific mechanism (e.g. polyphenols → NF-κB inhibition)",
    "ayurvedic_note":        "string — optional, relevant only when applicable"
  },
  "confidence_score": float,  // 0.0 to 1.0 — model confidence in nutritional accuracy
  "confidence_basis": "string — brief reason for score (e.g. 'USDA + NIN validated ingredients')",
  "expert_tips": [
    "string — actionable tip 1",
    "string — actionable tip 2"
  ],
  "swap_options": [
    {
      "ingredient": "string — original ingredient",
      "swap":       "string — alternative",
      "reason":     "string — why swap is valid"
    }
  ],
  "allergen_flags": ["gluten", "dairy", "nuts", "soy"]  // only include if present
}

GENERATION CONSTRAINTS:
  - Cuisine MUST match {cuisine_pref} — do not substitute other cuisines
  - Dietary MUST match {dietary_pref} — zero exceptions
  - Total daily calories across 3 meals = {daily_calorie_target} ± 50 kcal
  - Protein across 3 meals ≥ {protein_g:.0f}g total
  - Fibre across 3 meals ≥ 25g total
  - Include ≥1 antioxidant-rich ingredient per meal (annotate in health_rationale)
  - Include ≥1 probiotic or prebiotic source across the day
  - Difficulty {difficulty}:
      Low    → ≤5 steps, ≤6 ingredients, no specialised equipment
      Medium → ≤8 steps, ≤10 ingredients, standard Indian kitchen equipment
      High   → advanced techniques permitted, meal-prep strategies encouraged
  - All ingredients must be available in Indian grocery stores (tier-2 city availability)
  - NO imported superfoods by default unless explicitly in cuisine profile
  - Meal timing suggestions:
      Breakfast: 7:00–9:00 AM
      Lunch:     12:30–2:00 PM  
      Dinner:    7:00–8:30 PM (cut-off: 3 hours before sleep)
```

### 4.2 Daily Plan Summary Block

```
After generating 3 meals, also output a DAILY_SUMMARY block:

{
  "daily_summary": {
    "total_calories_kcal": float,
    "total_protein_g":     float,
    "total_carbs_g":       float,
    "total_fat_g":         float,
    "total_fibre_g":       float,
    "deficit_achieved_kcal": float,
    "macro_split_pct": {
      "protein": float,
      "carbs":   float,
      "fat":     float
    },
    "hydration_target_litres": float,  // 35 ml/kg body weight
    "supplements_note": "string — only if dietary gaps exist (e.g. B12 for vegans)",
    "overall_confidence": float,
    "day_theme": "string — e.g. 'High Protein South Indian Day'"
  }
}
```

---

## 5. PDF Output Specification

### 5.1 Document Structure

```
PAGE 1 — COVER PAGE
  ┌─────────────────────────────────────────────┐
  │  [NutriGuru Logo]                           │
  │  Your 21-Day Anti-Ageing Fat Loss Plan       │
  │                                             │
  │  Prepared for: {name}                       │
  │  Challenge: {start_date} → {end_date}       │
  │  Goal: Lose 6 kg in 21 Days                 │
  │  Difficulty: [LOW / MEDIUM / HIGH badge]    │
  │                                             │
  │  Daily Calorie Target: {target} kcal        │
  │  Cuisine Style: {cuisine_pref}              │
  │  Dietary Type: {dietary_pref}               │
  └─────────────────────────────────────────────┘

PAGE 2 — PROFILE & METRICS DASHBOARD
  • BMI gauge chart (underweight / normal / overweight / obese)
  • TDEE breakdown (BMR + Activity + Deficit)
  • Daily macro target pie chart (Protein / Carbs / Fat %)
  • 21-day projected weight trajectory (line chart)
  • Hydration target, fibre target, protein target summary cards

PAGES 3 to N — DAILY MEAL CARDS
  (One page per meal type, or Day 1 template if generating single day)

  ┌─ SECTION A: MEAL HEADER ──────────────────────┐
  │  Meal Type: BREAKFAST / LUNCH / DINNER         │
  │  Dish: {dish_name}  |  Region: {cuisine_region}│
  │  Prep: Xmin  Cook: Xmin  |  {dietary_pref} ✓   │
  └───────────────────────────────────────────────┘

  ┌─ SECTION B: RECIPE ───────────────────────────┐
  │  INGREDIENTS TABLE                             │
  │  ┌──────────────────┬──────────┬─────────┐    │
  │  │ Ingredient       │ Quantity │ Unit    │    │
  │  ├──────────────────┼──────────┼─────────┤    │
  │  │ ...              │ ...      │ ...     │    │
  │  └──────────────────┴──────────┴─────────┘    │
  │                                                │
  │  COOKING STEPS (numbered list)                 │
  │  1. ...                                        │
  │  2. ...                                        │
  │                                                │
  │  💡 Kitchen Tip: {cooking_tip}                 │
  └───────────────────────────────────────────────┘

  ┌─ SECTION C: MACRO & MICRO NUTRIENTS ──────────┐
  │  MACROS (horizontal stacked bar chart)         │
  │  Protein [██████  ] Xg  | Carbs [████    ] Xg  │
  │  Fat     [███     ] Xg  | Fibre [██      ] Xg  │
  │                                                │
  │  MICROS TABLE (with % RDA column)              │
  │  ┌───────────────┬────────┬────────┐           │
  │  │ Nutrient      │ Amount │ % RDA  │           │
  │  ├───────────────┼────────┼────────┤           │
  │  │ Vitamin C     │ Xmg    │  XX%   │           │
  │  │ Iron          │ Xmg    │  XX%   │           │
  │  │ Calcium       │ Xmg    │  XX%   │           │
  │  │ B12           │ Xmcg   │  XX%   │           │
  │  │ Omega-3       │ Xmg    │  XX%   │           │
  │  └───────────────┴────────┴────────┘           │
  └───────────────────────────────────────────────┘

  ┌─ SECTION D: HEALTH & ANTI-AGEING RATIONALE ───┐
  │  WEIGHT LOSS MECHANISM                         │
  │  → {weight_loss_benefit}                       │
  │                                                │
  │  ANTI-AGEING BENEFIT                           │
  │  → {anti_ageing_benefit}                       │
  │                                                │
  │  AYURVEDIC NOTE (if applicable)                │
  │  → {ayurvedic_note}                            │
  └───────────────────────────────────────────────┘

  ┌─ SECTION E: CONFIDENCE ───────────────────────┐
  │  AI Confidence Score                           │
  │  [████████░░] 82%                              │
  │  Basis: {confidence_basis}                     │
  └───────────────────────────────────────────────┘

  ┌─ SECTION F: EXPERT TIPS & SWAPS ─────────────┐
  │  ✦ Tip 1: {expert_tip_1}                      │
  │  ✦ Tip 2: {expert_tip_2}                      │
  │                                                │
  │  INGREDIENT SWAPS                              │
  │  {ingredient} → {swap} ({reason})              │
  └───────────────────────────────────────────────┘

LAST PAGE — MEDICAL DISCLAIMER
  This AI-generated meal plan is for informational and motivational purposes only.
  It does not constitute medical advice, clinical diagnosis, or personalised 
  dietetic consultation. Consult a FSSAI-registered Dietitian or qualified 
  Physician before beginning any caloric restriction programme.
  
  NOT recommended without physician clearance for:
  • Pregnant or breastfeeding women
  • Diagnosed Type 1 or Type 2 diabetes
  • Active cardiovascular, renal, or hepatic conditions
  • Individuals currently on prescription medication
  • Individuals with a BMI below 18.5
  
  Generated by NutriGuru AI | {generation_timestamp} | Model: {active_model}
```

### 5.2 PDF Technical Spec

| Property | Value |
|----------|-------|
| Page Size | A4 (210 × 297 mm) |
| Margins | 20mm all sides |
| Primary Font | Inter / Nunito Sans |
| Header Colour | `#1A1A2E` (Lakera navy) |
| Accent Colour | `#FF6B35` (Lakera orange) |
| Chart Library | Chart.js (server-side render via canvas) or pdfmake |
| Generation | react-pdf or pdfmake (Node.js backend) |
| File Naming | `nutriguru_{name}_{date}.pdf` |

---

## 6. Model Routing & Fallback Chain

### 6.1 Configuration

```yaml
models:
  primary:
    provider: ollama-cloud
    model: nemotron-cascade-2
    endpoint: "ollama run nemotron-cascade-2"
    timeout_sec: 30
    health_check: true

  fallback_1:
    provider: anthropic
    model: claude-sonnet-4-6
    api_key_env: ANTHROPIC_API_KEY
    timeout_sec: 20

  fallback_2:
    provider: ollama-local
    model: gemma4
    endpoint: "http://localhost:11434/api/generate"
    timeout_sec: 15

shared_params:
  temperature: 0.3        # Deterministic nutritional output
  max_tokens: 4096
  top_p: 0.9
  stream: false           # Disable streaming for Lakera output scanning compatibility
```

### 6.2 Routing Logic

```
REQUEST FLOW:
  1. Health check PRIMARY
     ├─ OK   → Send to Nemotron Cascade 2
     │          ├─ Response OK → Lakera output scan → Return to user
     │          └─ Timeout / Error → Try FALLBACK_1
     │
     └─ DOWN → Try FALLBACK_1
               ├─ Response OK → Lakera output scan → Return to user  
               └─ Error → Try FALLBACK_2
                          ├─ Response OK → Lakera output scan → Return to user
                          └─ Error → Surface error to user with:
                                     "Service temporarily unavailable.
                                      Please retry in 2 minutes."
                                     [Retry CTA button]

UI INDICATOR: Model status badge in header → shows active model
  Nemotron ● green  |  Claude ● amber  |  Gemma ● red (degraded)
```

### 6.3 Streaming Consideration

> ⚠️ **IMPORTANT**: Do NOT enable streaming (`stream: true`) when Lakera output scanning is active. Lakera Guard requires the complete response to perform accurate output screening. Use streaming only when secure mode is manually disabled by the operator.

---

## 7. Lakera Guard — Full Integration Spec

> This section covers **all** use cases from Lakera's official integration documentation. Implementation must satisfy every pattern before production deployment.

### 7.1 API Configuration

```yaml
lakera:
  project_name: "Diet Recommendation bot"
  project_id: "project-1344722930"
  api_key_env: LAKERA_GUARD_API_KEY
  base_url: "https://api.lakera.ai/v2"
  region_url: "https://ap-southeast-1.api.lakera.ai"  # Singapore — closest to India
  endpoint_guard: "/guard"
  endpoint_results: "/guard/results"
  endpoint_policies: "/policies"
  endpoint_projects: "/projects"
  dev_info: true  # Enable in staging; set false in production
```

### 7.2 USE CASE 1 — Holistic Post-LLM Screening (Primary Pattern)

**What:** Single API call screening the FULL interaction (input + output together) AFTER the LLM responds but BEFORE showing content to the user.

**Why:** Lakera's recommended approach — highest accuracy, minimum latency overhead, complete context for threat detection.

```python
# PRIMARY SCREENING PATTERN — call this after every LLM response
async def screen_holistic(conversation_history: list, llm_response: str, 
                           user_id: str, session_id: str, user_ip: str) -> dict:
    """
    Screens the complete interaction holistically.
    conversation_history includes all prior messages.
    llm_response is appended as the final assistant message.
    """
    messages = conversation_history.copy()
    messages.append({"role": "assistant", "content": llm_response})

    payload = {
        "messages": messages,
        "project_id": "project-1344722930",
        "breakdown": True,           # Get detector-level breakdown for audit logs
        "metadata": {
            "user_id": user_id,
            "session_id": session_id,
            "user_ip": user_ip,
            "app": "nutriguru",
            "timestamp": datetime.utcnow().isoformat()
        }
    }

    response = await httpx_client.post(
        "https://ap-southeast-1.api.lakera.ai/v2/guard",
        json=payload,
        headers={"Authorization": f"Bearer {LAKERA_GUARD_API_KEY}"}
    )
    return response.json()

# RESPONSE HANDLING
result = await screen_holistic(...)
if result["flagged"]:
    # Do NOT show LLM response to user
    # Log to audit trail with breakdown details
    return safe_error_message(result)
else:
    return llm_response
```

### 7.3 USE CASE 2 — Additional Input Screening (Pre-LLM)

**What:** Optionally screen user input BEFORE sending to LLM.

**Why:** Prevents LLM costs on flagged inputs; prevents sensitive data (PII, diet history) from reaching third-party LLM providers (Anthropic fallback).

```python
async def screen_input_only(conversation_history: list, user_message: str,
                             user_id: str, session_id: str) -> dict:
    """
    Additional pre-LLM input scan.
    Run in PARALLEL with LLM call (Lakera typically completes before LLM responds).
    """
    messages = conversation_history.copy()
    messages.append({"role": "user", "content": user_message})

    payload = {
        "messages": messages,
        "project_id": "project-1344722930",
        "breakdown": True,
        "metadata": {
            "user_id": user_id,
            "session_id": session_id,
            "scan_type": "input_pre_llm"
        }
    }

    response = await httpx_client.post(
        "https://ap-southeast-1.api.lakera.ai/v2/guard",
        json=payload,
        headers={"Authorization": f"Bearer {LAKERA_GUARD_API_KEY}"}
    )
    return response.json()

# PARALLEL EXECUTION PATTERN
async def process_message(user_message: str, history: list, ...):
    # Fire both in parallel — Lakera usually finishes before LLM
    lakera_task = asyncio.create_task(screen_input_only(history, user_message, ...))
    llm_task    = asyncio.create_task(call_llm(history, user_message))

    input_result = await lakera_task

    if input_result["flagged"]:
        llm_task.cancel()
        return safe_error_message(input_result)
    
    llm_response = await llm_task
    # Then proceed to USE CASE 1 holistic scan
    return await screen_holistic(history + [user_message], llm_response, ...)
```

### 7.4 USE CASE 3 — RAG / Reference Document Screening

**What:** Screen any external documents, knowledge base content, or RAG context injected into the prompt.

**Why:** Documents can contain indirect prompt injection attacks (e.g. a user uploads a PDF with hidden instructions). Screen at ingestion time (batch) AND at runtime for dynamic content.

```python
# BATCH DOCUMENT SCREENING — run at upload/ingestion time
async def screen_document_batch(document_content: str, doc_id: str) -> dict:
    """
    Screen static documents (knowledge base, user-uploaded PDFs, recipe databases)
    when they are first ingested — not at runtime per query.
    """
    payload = {
        "messages": [
            {"role": "user", "content": document_content}
        ],
        "project_id": "project-1344722930",
        "metadata": {
            "doc_id": doc_id,
            "scan_type": "batch_document_ingestion"
        }
    }
    response = await httpx_client.post(
        "https://ap-southeast-1.api.lakera.ai/v2/guard",
        json=payload,
        headers={"Authorization": f"Bearer {LAKERA_GUARD_API_KEY}"}
    )
    result = response.json()
    if result["flagged"]:
        # Quarantine document — do not add to knowledge base
        await quarantine_document(doc_id, result)
    return result

# RUNTIME RAG SCREENING — include reference docs in the messages array
def build_rag_messages(system_prompt: str, reference_docs: list[str],
                        user_question: str, assistant_response: str) -> list:
    """
    Structure for Lakera RAG screening — reference docs as user messages.
    """
    messages = [
        {"role": "system", "content": system_prompt}
    ]
    for doc in reference_docs:
        messages.append({"role": "user", "content": f"Context: {doc}"})
    
    messages.append({"role": "user",      "content": user_question})
    messages.append({"role": "assistant", "content": assistant_response})
    return messages
```

### 7.5 USE CASE 4 — Agent & Tool Call Screening

**What:** Screen EACH STEP of agentic workflows — tool inputs, tool outputs, and agent decisions.

**Why:** NutriGuru may evolve to use agents (e.g. fetching current food prices, calling nutrition APIs, generating PDF). Each tool call is a potential injection vector.

```python
# AGENT LOOP SCREENING PATTERN
async def screen_agent_step(messages: list, tool_name: str,
                             tool_input: str, tool_output: str) -> dict:
    """
    Include tool use messages in screening.
    Screen before acting on tool output.
    """
    agent_messages = messages.copy()
    agent_messages.append({
        "role": "user",
        "content": f"[Tool: {tool_name}] Input: {tool_input}"
    })
    agent_messages.append({
        "role": "assistant",
        "content": f"[Tool Result]: {tool_output}"
    })

    payload = {
        "messages": agent_messages,
        "project_id": "project-1344722930",
        "breakdown": True,
        "metadata": {
            "tool_name": tool_name,
            "scan_type": "agent_tool_call"
        }
    }
    return await lakera_post(payload)

# Block suspicious tool actions BEFORE executing them
# Validate tool outputs BEFORE passing back to agent loop
```

### 7.6 USE CASE 5 — PII Masking & Data Leakage Prevention

**What:** Detect and mask PII in user inputs before they reach third-party LLM providers. Block PII in LLM outputs.

**Why:** Users may share sensitive health data (blood reports, medical conditions, phone numbers). Must not leak to Anthropic API or Nemotron.

```python
async def handle_pii_detection(scan_result: dict, content: str, 
                                direction: str) -> str:
    """
    direction: "input" (user→LLM) or "output" (LLM→user)
    """
    if not scan_result["flagged"]:
        return content

    breakdown = scan_result.get("breakdown", {})
    pii_detected = breakdown.get("pii", {}).get("flagged", False)
    
    if pii_detected and direction == "input":
        # Warn user, mask before sending to LLM
        await notify_user("Sensitive personal information detected. 
                           Masking before processing.")
        return mask_pii(content)  # Use regex/NER to mask PHI

    if pii_detected and direction == "output":
        # Hard block — LLM should not output PII
        await log_security_event("PII_OUTPUT_BLOCKED", scan_result)
        return "I cannot include personal identifying information in responses."

    return content  # Other flags handled by caller
```

### 7.7 USE CASE 6 — Progressive Response Handling

**What:** Different threat levels trigger different responses, not just binary block/pass.

```python
async def progressive_response(scan_result: dict, context: str) -> dict:
    """
    3-tier response based on threat confidence.
    """
    if not scan_result["flagged"]:
        return {"action": "allow", "message": None}

    breakdown = scan_result.get("breakdown", {})

    # HIGH confidence threat — hard block
    high_confidence_detectors = [
        "prompt_injection", "jailbreak", "harmful_content"
    ]
    if any(breakdown.get(d, {}).get("flagged") for d in high_confidence_detectors):
        await log_security_event("HIGH_THREAT_BLOCKED", scan_result)
        return {
            "action": "block",
            "message": "I can't process that request. Please ask me about your diet plan.",
            "show_threat_detail": False  # Do NOT expose attack detection to potential bad actors
        }

    # MEDIUM confidence — warn + offer override
    medium_confidence_detectors = ["off_topic", "policy_violation"]
    if any(breakdown.get(d, {}).get("flagged") for d in medium_confidence_detectors):
        return {
            "action": "warn",
            "message": "This seems outside my nutrition expertise. Continue anyway?",
            "allow_override": True
        }

    # LOW confidence — log only, allow through
    await log_to_audit_trail("LOW_CONFIDENCE_FLAG", scan_result)
    return {"action": "allow", "message": None, "flagged_for_review": True}
```

### 7.8 USE CASE 7 — Monitoring & Compliance Mode (Analyze-First Rollout)

**What:** Shadow mode where Lakera scans but does NOT block. Used for initial deployment to calibrate policies and reduce false positives.

```python
class LakeraMode(Enum):
    MONITOR_ONLY   = "monitor"   # Log flags, never block (calibration phase)
    GRADUATED      = "graduated" # Block only HIGH confidence threats
    FULL_ENFORCE   = "enforce"   # Block all flagged content (production default)

async def screen_with_mode(payload: dict, mode: LakeraMode) -> dict:
    result = await lakera_post(payload)
    
    if mode == LakeraMode.MONITOR_ONLY:
        # Always allow — log everything for policy calibration
        await log_to_audit_trail("MONITOR_SCAN", result)
        return {"action": "allow", "monitoring_flagged": result["flagged"]}
    
    elif mode == LakeraMode.GRADUATED:
        if result["flagged"] and is_high_confidence(result):
            return await progressive_response(result, "high")
        return {"action": "allow"}
    
    else:  # FULL_ENFORCE
        return await progressive_response(result, "full")

# Rollout recommendation:
# Week 1-2: MONITOR_ONLY (collect ~6000 interactions for calibration)
# Week 3:   GRADUATED (block high-confidence only)
# Week 4+:  FULL_ENFORCE (after policy tuning with Lakera support)
```

### 7.9 USE CASE 8 — Audit Trail & Compliance Reporting

**What:** Full audit logging of all Lakera scan events with metadata for compliance reporting.

```python
# AUDIT LOG SCHEMA
audit_event = {
    "event_id":      str(uuid4()),
    "timestamp":     datetime.utcnow().isoformat(),
    "request_uuid":  scan_result["metadata"]["request_uuid"],  # from Lakera response
    "project_id":    "project-1344722930",
    "user_id":       user_id,
    "session_id":    session_id,
    "scan_type":     "holistic | input | output | document | agent_tool",
    "flagged":       scan_result["flagged"],
    "breakdown":     scan_result.get("breakdown", {}),
    "action_taken":  "allow | block | warn | mask",
    "secure_mode":   True,
    "active_model":  active_model_name,
    "message_count": len(messages)
}

# Use Lakera Guard Results endpoint for historical analysis
async def fetch_audit_results(start_date: str, end_date: str) -> dict:
    response = await httpx_client.get(
        "https://ap-southeast-1.api.lakera.ai/v2/guard/results",
        params={
            "project_id": "project-1344722930",
            "start_date": start_date,
            "end_date":   end_date
        },
        headers={"Authorization": f"Bearer {LAKERA_GUARD_API_KEY}"}
    )
    return response.json()
```

### 7.10 USE CASE 9 — Secure Mode UI Toggle

**What:** Enterprise operator toggle to switch between FULL_ENFORCE and MONITOR_ONLY modes. NOT a user-facing security disable — this is an operator control.

```
UI COMPONENT SPEC
─────────────────
Position: Top-right header (persistent, always visible)
Component: Toggle switch + mode badge

States:
  ● SECURE (green)   → FULL_ENFORCE mode | Lakera scanning all interactions
  ● MONITOR (amber)  → MONITOR_ONLY mode | Scanning but not blocking (calibration)
  ○ DISABLED (red)   → Scanning off | Show persistent red banner:
                        "⚠ Security scanning disabled. Not recommended for production."

Access Control:
  - Only ADMIN role can toggle to DISABLED
  - OPERATOR role can toggle between SECURE and MONITOR
  - USER role cannot access toggle

Audit:
  - Every toggle event logged with: timestamp, operator_id, previous_state, new_state
  - Toggle to DISABLED requires confirmation dialog + reason field
```

### 7.11 Conversation History Pattern

```python
# CRITICAL: Always pass clean conversation history
# System prompt in role: "system" — prevents false positive flags
# Screen LAST interaction only (Guard uses prior messages as context)

def build_messages_for_guard(system_prompt: str, history: list,
                              latest_user: str, latest_assistant: str) -> list:
    """
    Correct message structure for Lakera Guard.
    Guard screens the LAST user+assistant pair.
    Prior messages = context (already screened in previous calls).
    """
    messages = [{"role": "system", "content": system_prompt}]
    
    # Include prior screened history (as context, not re-screened)
    for turn in history:
        messages.append(turn)
    
    # Latest interaction — THIS is what Guard screens
    messages.append({"role": "user",      "content": latest_user})
    messages.append({"role": "assistant", "content": latest_assistant})
    
    return messages
```

---

## 8. Enterprise UI/UX Specification

> Design reference: WHOOP app aesthetic — dark precision panels, glowing metric rings, data-dense but visually clean. Adapted to light theme with Lakera brand colours.

### 8.1 Design Tokens

```css
/* PRIMARY PALETTE — Lakera Brand */
--color-primary:      #FF6B35;   /* Lakera orange — CTAs, active states */
--color-primary-dark: #E5541F;   /* Hover on primary */
--color-navy:         #1A1A2E;   /* Page background, sidebar */
--color-navy-light:   #16213E;   /* Card backgrounds in dark sections */
--color-teal:         #0F3460;   /* Secondary accent */

/* LIGHT THEME SURFACES */
--color-surface-0:    #FFFFFF;   /* Cards, panels */
--color-surface-1:    #F8F9FB;   /* Page background */
--color-surface-2:    #F0F2F5;   /* Input backgrounds, subtle areas */
--color-border:       #E4E8EE;   /* Card borders */
--color-border-focus: #FF6B35;   /* Focus ring */

/* TYPOGRAPHY */
--color-text-primary:   #1A1A2E;
--color-text-secondary: #6B7280;
--color-text-muted:     #9CA3AF;

/* STATUS COLOURS */
--color-success: #10B981;
--color-warning: #F59E0B;
--color-danger:  #EF4444;
--color-info:    #3B82F6;

/* SPACING SCALE */
--space-xs:  4px;
--space-sm:  8px;
--space-md:  16px;
--space-lg:  24px;
--space-xl:  40px;
--space-2xl: 64px;

/* TYPOGRAPHY SCALE */
--font-family: 'Inter', 'Nunito Sans', system-ui, sans-serif;
--text-xs:   11px;
--text-sm:   13px;
--text-base: 15px;
--text-lg:   17px;
--text-xl:   20px;
--text-2xl:  26px;
--text-hero: 40px;

/* BORDER RADIUS */
--radius-sm:   6px;
--radius-md:   10px;
--radius-lg:   16px;
--radius-xl:   24px;
--radius-full: 9999px;
```

### 8.2 Layout Architecture

```
┌───────────────────────────────────────────────────────────────┐
│  TOPBAR (64px fixed)                                           │
│  [🌿 NutriGuru]  [Breadcrumb]        [Model Badge] [Security] │
│                                      [User Avatar] [Settings] │
├─────────────────┬─────────────────────────────────────────────┤
│  SIDEBAR        │  MAIN CONTENT AREA                          │
│  (240px fixed)  │                                             │
│                 │                                             │
│  ◉ Dashboard    │  Active Page Content                        │
│  ● My Plan      │                                             │
│  ● Diet Chat    │                                             │
│  ● Progress     │                                             │
│  ● Analytics    │                                             │
│  ─────────────  │                                             │
│  ● Settings     │                                             │
│  ● Security     │                                             │
│  ● Export       │                                             │
│                 │                                             │
│  ─────────────  │                                             │
│  Model Status   │                                             │
│  ● Nemotron ▲   │                                             │
└─────────────────┴─────────────────────────────────────────────┘
```

### 8.3 Page Specifications

#### PAGE: Dashboard (Home)

```
HERO SECTION — WHOOP-style metric rings
  ┌────────────────────────────────────────────────────┐
  │  Welcome back, {name}          Day 7 of 21         │
  │                                                    │
  │  [Ring: Calories]  [Ring: Protein]  [Ring: Steps]  │
  │   1,450 / 1,800     89g / 120g       6,200 steps   │
  │     80%               74%              62%          │
  └────────────────────────────────────────────────────┘

METRIC CARDS ROW (4 cards)
  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
  │ Weight Lost  │ │ Days Left    │ │ Streak       │ │ Avg Deficit  │
  │  2.4 kg      │ │  14 days     │ │  7 days 🔥   │ │  -980 kcal   │
  │  ▲ on track  │ │              │ │              │ │  ✓ target    │
  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘

TODAY'S MEALS PANEL
  Breakfast ✓  |  Lunch ✓  |  Dinner ○
  [View Plan]  [Mark Complete]

PROGRESS CHART
  Line chart: projected vs actual weight over 21 days

SECURITY STATUS WIDGET
  ┌────────────────────────────────────┐
  │  🛡 Lakera Guard      ● SECURE     │
  │  Scanned today: 47 interactions    │
  │  Threats blocked: 0                │
  │  [View Security Log]               │
  └────────────────────────────────────┘
```

#### PAGE: Diet Chat

```
LAYOUT: Two-panel
  Left (40%): Chat interface
  Right (60%): Live meal card / plan preview

CHAT PANEL
  ┌────────────────────────────────────┐
  │  NutriGuru Chat                    │
  │  ─────────────────────────────── │
  │                                    │
  │  [Assistant bubble]                │
  │  Good morning {name}! Your         │
  │  breakfast today is Moong Dal      │
  │  Chilla with Mint Chutney. 🌿      │
  │                                    │
  │  [User bubble]                     │
  │  Can I swap paneer for tofu?       │
  │                                    │
  │  ─────────────────────────────── │
  │  [🔒] [Input field...]  [Send ↗]   │
  │  Secure mode ● ON                  │
  └────────────────────────────────────┘

LIVE PLAN PANEL
  → Real-time meal card rendered as user chats
  → Updates instantly as plan is refined
  → [Download PDF] button persistent
```

#### PAGE: Progress & Analytics

```
CHARTS:
  1. Weight trajectory (actual vs projected) — line chart
  2. Daily caloric intake vs target — bar chart
  3. Macro split over time — stacked area chart
  4. Nutrient coverage heatmap (7-day × 10 nutrients grid)
  5. Meal completion streak calendar (GitHub-style contribution graph)

INSIGHTS PANEL:
  AI-generated weekly summary from model
  "You've maintained protein targets 6/7 days.
   Iron intake is 18% below RDA — consider adding
   spinach or ragi to your lunch."
```

#### PAGE: Security Console (Admin)

```
HEADER METRICS:
  Total Scans | Threats Blocked | False Positives | Scan Latency (avg)

SECURITY MODE CONTROL:
  [SECURE ●] [MONITOR ◌] [DISABLED ○]
  Current mode: SECURE (FULL_ENFORCE)

LAKERA SCAN LOG TABLE:
  ┌──────────────┬────────────┬──────────┬────────────┬────────┐
  │ Timestamp    │ Scan Type  │ Flagged  │ Action     │ Model  │
  ├──────────────┼────────────┼──────────┼────────────┼────────┤
  │ 14:32:01     │ Holistic   │ No       │ Allow      │ Nemo   │
  │ 14:28:44     │ Input      │ Yes ⚠    │ Block      │ Nemo   │
  │ 14:25:11     │ Document   │ No       │ Allow      │ —      │
  └──────────────┴────────────┴──────────┴────────────┴────────┘

POLICY STATUS:
  Policy Health: ✓ Valid | Last checked: 2 min ago
  [Check Policy] [Lint Policy] [View Policy Config]
```

### 8.4 Component Library

```
COMPONENTS TO BUILD:
  ✦ MetricRing      — WHOOP-style circular progress (SVG, animated)
  ✦ MetricCard      — stat card with label, value, trend indicator
  ✦ MealCard        — full meal display card with all 6 sections
  ✦ MacroBar        — horizontal stacked bar (Protein/Carbs/Fat)
  ✦ MicroTable      — nutrients table with RDA% progress bars
  ✦ ConfidenceMeter — circular ring with percentage label
  ✦ SecurityBadge   — model status + Lakera mode indicator
  ✦ ChatBubble      — user and assistant message styles
  ✦ StepWizard      — multi-step onboarding form with progress bar
  ✦ DifficultyBadge — LOW / MEDIUM / HIGH pill with colour coding
  ✦ ModelBadge      — active model chip (Nemotron / Claude / Gemma)
  ✦ ScanLogRow      — audit table row with expandable breakdown
  ✦ ThreatAlert     — inline blocked content notification
  ✦ WeightChart     — recharts LineChart with projected vs actual
  ✦ NutrientHeatmap — 7×10 grid for weekly micro coverage
  ✦ StreakCalendar  — GitHub-style daily completion graph
```

---

## 9. Tech Stack & Architecture

### 9.1 Frontend

```yaml
framework:   React 18 + TypeScript
styling:     Tailwind CSS (custom design tokens above)
charts:      Recharts (dashboard), Chart.js (PDF server-side)
pdf:         react-pdf / @react-pdf/renderer
state:       Zustand (global) + React Query (API cache)
routing:     React Router v6
icons:       Lucide React
animations:  Framer Motion (metric ring enter animations)
```

### 9.2 Backend

```yaml
framework:     FastAPI (Python 3.11+)
llm_client:    ollama-python + anthropic SDK + httpx
lakera_client: httpx (async, persistent session)
pdf_gen:       pdfmake (Node.js sidecar) or WeasyPrint (Python)
database:      PostgreSQL (user profiles, audit logs, plans)
cache:         Redis (session state, model health cache)
queue:         Celery + Redis (async PDF generation)
auth:          JWT + refresh tokens
```

### 9.3 Request Flow

```
User Input
    │
    ▼
[Input Scan — Lakera USE CASE 2]  ←── parallel with LLM
    │   flagged? → block + log
    ▼
[LLM Call — Model Routing Chain]
    │
    ▼
[Holistic Scan — Lakera USE CASE 1]  ←── primary guardrail
    │   flagged? → block + log + progressive response
    ▼
[PII Check — Lakera USE CASE 5]
    │   PII in output? → mask or block
    ▼
[Audit Log — Lakera USE CASE 8]
    │
    ▼
Return to User
```

---

## 10. API Reference Summary

### 10.1 NutriGuru Internal APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/onboard` | POST | Submit user profile, get computed metrics |
| `/api/v1/plan/generate` | POST | Generate meal plan for a given day |
| `/api/v1/plan/export` | POST | Trigger PDF generation, returns download URL |
| `/api/v1/chat` | POST | Send chat message, returns scanned response |
| `/api/v1/security/status` | GET | Current Lakera mode and scan stats |
| `/api/v1/security/logs` | GET | Paginated audit log |
| `/api/v1/security/mode` | PUT | Toggle Lakera enforcement mode (admin only) |
| `/api/v1/models/health` | GET | Model chain health status |
| `/api/v1/progress` | GET | User progress metrics |

### 10.2 Lakera Guard Endpoints Used

| Endpoint | Used In | Purpose |
|----------|---------|---------|
| `POST /v2/guard` | UC 1,2,3,4,5 | Content screening |
| `GET /v2/guard/results` | UC 8 | Historical audit / compliance |
| `GET /policies/health` | UC 7 | Policy validity check |
| `POST /policies/lint` | UC 7 | Policy file validation |
| `GET /projects` | Admin | Project configuration |

### 10.3 Environment Variables

```bash
# Model APIs
ANTHROPIC_API_KEY=sk-ant-...
OLLAMA_CLOUD_ENDPOINT=https://...
OLLAMA_LOCAL_ENDPOINT=http://localhost:11434

# Lakera
LAKERA_GUARD_API_KEY=lk-...
LAKERA_PROJECT_ID=project-1344722930
LAKERA_REGION=ap-southeast-1

# App
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
APP_ENV=production  # switches dev_info off in Lakera calls

# Defaults
LAKERA_DEFAULT_MODE=FULL_ENFORCE
SECURE_MODE_DEFAULT=true
```

---

*Document generated for NutriGuru v2.0 | April 2026*  
*Lakera Guard integration covers all patterns from docs.lakera.ai/docs/integration and docs.lakera.ai/docs/api/guard*