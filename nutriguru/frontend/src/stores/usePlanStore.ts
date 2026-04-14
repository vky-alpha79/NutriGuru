import { create } from 'zustand'

export interface MealData {
  meal_type: string
  dish_name: string
  cuisine_region: string
  serves: number
  prep_time_min: number
  cook_time_min: number
  ingredients: { item: string; quantity: number; unit: string; notes?: string }[]
  steps: string[]
  cooking_tip: string
  macros: Record<string, number>
  micros: Record<string, number>
  health_rationale: Record<string, string>
  confidence_score: number
  confidence_basis: string
  expert_tips: string[]
  swap_options: { ingredient: string; swap: string; reason: string }[]
  allergen_flags: string[]
}

export interface DailySummary {
  total_calories_kcal: number
  total_protein_g: number
  total_carbs_g: number
  total_fat_g: number
  total_fibre_g: number
  deficit_achieved_kcal: number
  macro_split_pct: { protein: number; carbs: number; fat: number }
  hydration_target_litres: number
  supplements_note: string
  overall_confidence: number
  day_theme: string
}

interface PlanState {
  currentDay: number
  breakfast: MealData | null
  lunch: MealData | null
  dinner: MealData | null
  dailySummary: DailySummary | null
  modelUsed: string
  loading: boolean
  setPlan: (data: {
    day_number: number
    breakfast: MealData
    lunch: MealData
    dinner: MealData
    daily_summary: DailySummary
    model_used: string
  }) => void
  setLoading: (v: boolean) => void
  reset: () => void
}

export const usePlanStore = create<PlanState>((set) => ({
  currentDay: 1,
  breakfast: null,
  lunch: null,
  dinner: null,
  dailySummary: null,
  modelUsed: '',
  loading: false,

  setPlan: (data) =>
    set({
      currentDay: data.day_number,
      breakfast: data.breakfast,
      lunch: data.lunch,
      dinner: data.dinner,
      dailySummary: data.daily_summary,
      modelUsed: data.model_used,
      loading: false,
    }),

  setLoading: (v) => set({ loading: v }),

  reset: () =>
    set({
      currentDay: 1,
      breakfast: null,
      lunch: null,
      dinner: null,
      dailySummary: null,
      modelUsed: '',
      loading: false,
    }),
}))
