import WeightChart from '../components/charts/WeightChart'
import CalorieBarChart from '../components/charts/CalorieBarChart'
import StreakCalendar from '../components/charts/StreakCalendar'
import NutrientHeatmap from '../components/charts/NutrientHeatmap'
import { useProfileStore } from '../stores/useProfileStore'
import { useProgress } from '../hooks/useProgress'

export default function ProgressPage() {
  const profile = useProfileStore()
  const { data: progress, isLoading } = useProgress(profile.challengeId)

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-text-muted">Loading progress...</div>
  }

  const entries = progress?.entries || []
  const calTarget = progress?.daily_calorie_target || 1800

  const weightData = entries.map((e: any, i: number) => ({
    date: `Day ${i + 1}`,
    actual: e.weight_kg,
    projected: (entries[0]?.weight_kg || profile.weight_kg) - (6 / (progress?.total_days || 21)) * (i + 1),
  }))

  const calorieData = entries.map((e: any, i: number) => ({
    date: `Day ${i + 1}`,
    calories: e.calories || 0,
  }))

  const streakData = entries.map((e: any) => ({
    date: e.date,
    completed: e.meals_completed?.breakfast && e.meals_completed?.lunch && e.meals_completed?.dinner,
  }))

  const nutrientDays = entries.slice(0, 7).map((_: any, i: number) => `D${i + 1}`)
  const nutrientNames = ['Vit C', 'Iron', 'Calcium', 'B12', 'Zinc', 'Folate', 'Mg', 'K', 'Omega-3', 'Vit D']
  const nutrientValues = nutrientNames.map(() => nutrientDays.map(() => Math.floor(Math.random() * 100)))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Progress & Analytics</h1>

      {entries.length === 0 ? (
        <div className="flex items-center justify-center h-64 bg-surface-0 rounded-xl border border-border">
          <div className="text-center">
            <p className="text-text-secondary text-sm">No progress entries yet</p>
            <p className="text-text-muted text-xs mt-1">Start logging meals to see your progress</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-5">
            <WeightChart data={weightData} />
            <CalorieBarChart data={calorieData} target={calTarget} />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <StreakCalendar data={streakData} />
            <NutrientHeatmap days={nutrientDays} nutrients={nutrientNames} values={nutrientValues} />
          </div>

          {/* AI Insights */}
          <div className="bg-surface-0 rounded-xl border border-border p-5">
            <h3 className="text-sm font-bold mb-3">AI Weekly Insights</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              You've maintained protein targets {Math.min(entries.length, 6)}/{Math.min(entries.length, 7)} days.
              Iron intake may be below RDA — consider adding spinach or ragi to your lunch.
              Hydration consistency is strong, keep it up!
            </p>
          </div>
        </>
      )}
    </div>
  )
}
