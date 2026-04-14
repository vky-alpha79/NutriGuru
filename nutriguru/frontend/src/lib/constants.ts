export const ACTIVITY_TYPES = [
  { value: 'Sedentary', label: 'Sedentary', description: 'Desk job, no exercise' },
  { value: 'Lightly Active', label: 'Lightly Active', description: 'Light exercise 1-3 days/week' },
  { value: 'Moderately Active', label: 'Moderately Active', description: 'Moderate exercise 3-5 days/week' },
  { value: 'Very Active', label: 'Very Active', description: 'Hard exercise 6-7 days/week' },
  { value: 'Athlete', label: 'Athlete', description: 'Twice daily training / physical job' },
] as const

export const DIETARY_PREFS = ['Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan'] as const
export const CUISINE_PREFS = ['North Indian', 'South Indian', 'West Indian', 'Mixed'] as const
export const DIFFICULTIES = [
  { value: 'Low', label: 'Low', description: 'Simple 5-step recipes, 6 or fewer ingredients' },
  { value: 'Medium', label: 'Medium', description: 'Moderate prep, up to 10 ingredients' },
  { value: 'High', label: 'High', description: 'Advanced techniques, full meal prep' },
] as const

export const SEX_OPTIONS = ['Male', 'Female', 'Other'] as const
