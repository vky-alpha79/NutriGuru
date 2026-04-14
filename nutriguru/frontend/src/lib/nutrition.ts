export function computeBmi(weightKg: number, heightCm: number): number {
  return weightKg / (heightCm / 100) ** 2
}

export function computeBmr(weightKg: number, heightCm: number, age: number, sex: string): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return sex === 'Male' ? base + 5 : base - 161
}

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  Sedentary: 1.2,
  'Lightly Active': 1.375,
  'Moderately Active': 1.55,
  'Very Active': 1.725,
  Athlete: 1.9,
}

export function computeTdee(bmr: number, activityType: string): number {
  return bmr * (ACTIVITY_MULTIPLIERS[activityType] || 1.2)
}

export function computePreview(
  weightKg: number, heightCm: number, age: number, sex: string, activityType: string
) {
  const bmi = computeBmi(weightKg, heightCm)
  const bmr = computeBmr(weightKg, heightCm, age, sex)
  const tdee = computeTdee(bmr, activityType)
  const floor = sex === 'Male' ? 1500 : 1200
  const target = Math.max(tdee - 1000, floor)

  return { bmi: +bmi.toFixed(1), bmr: +bmr.toFixed(0), tdee: +tdee.toFixed(0), target: +target.toFixed(0) }
}
