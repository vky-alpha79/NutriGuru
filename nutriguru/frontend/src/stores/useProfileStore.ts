import { create } from 'zustand'

interface Metrics {
  bmi: number
  bmr: number
  tdee: number
  daily_calorie_target: number
  target_deficit_kcal: number
  protein_g: number
  fat_g: number
  carbs_g: number
  fibre_g_min: number
  hydration_litres: number
}

interface Warning {
  code: string
  message: string
  severity: string
}

interface ProfileState {
  name: string
  age: number
  sex: string
  weight_kg: number
  height_cm: number
  activity_type: string
  dietary_pref: string
  cuisine_pref: string
  challengeId: string | null
  metrics: Metrics | null
  warnings: Warning[]
  setProfile: (data: Partial<ProfileState>) => void
  setMetrics: (metrics: Metrics, warnings: Warning[]) => void
  setChallengeId: (id: string) => void
}

export const useProfileStore = create<ProfileState>((set) => ({
  name: '',
  age: 30,
  sex: 'Male',
  weight_kg: 70,
  height_cm: 170,
  activity_type: 'Sedentary',
  dietary_pref: 'Vegetarian',
  cuisine_pref: 'North Indian',
  challengeId: localStorage.getItem('nutriguru_challenge_id'),
  metrics: null,
  warnings: [],

  setProfile: (data) => set((s) => ({ ...s, ...data })),
  setMetrics: (metrics, warnings) => set({ metrics, warnings }),
  setChallengeId: (id) => {
    localStorage.setItem('nutriguru_challenge_id', id)
    set({ challengeId: id })
  },
}))
