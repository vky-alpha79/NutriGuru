import { Download } from 'lucide-react'
import ChatPanel from '../components/chat/ChatPanel'
import MealCard from '../components/meals/MealCard'
import DailySummary from '../components/meals/DailySummary'
import { usePlanStore } from '../stores/usePlanStore'
import { useProfileStore } from '../stores/useProfileStore'
import { useGeneratePlan, useExportPlan } from '../hooks/usePlan'
import { useLogProgress } from '../hooks/useProgress'
import { useState } from 'react'

export default function DietChatPage() {
  const { breakfast, lunch, dinner, dailySummary, setPlan, loading, setLoading } = usePlanStore()
  const { challengeId, weight_kg } = useProfileStore()
  const [dayNumber, setDayNumber] = useState(1)
  const generatePlan = useGeneratePlan()
  const exportPlan = useExportPlan()
  const logProgress = useLogProgress()
  const hasPlan = breakfast && lunch && dinner
  const handleMealGenerated = (data: any) => {
    if (data.breakfast && data.lunch && data.dinner) {
      setPlan(data)
    }
  }

  const handleGeneratePlan = async () => {
    if (!challengeId) return
    setLoading(true)
    try {
      const data = await generatePlan.mutateAsync({
        challenge_id: challengeId,
        day_number: dayNumber,
      })
      setPlan(data)
    } finally {
      setLoading(false)
    }
  }

  const handleExportPdf = async () => {
    if (!challengeId) return
    const blob = await exportPlan.mutateAsync({ challenge_id: challengeId })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `nutriguru_day_${dayNumber}.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }

  const handleLogToday = async () => {
    if (!challengeId || !hasPlan || !dailySummary) return
    await logProgress.mutateAsync({
      challenge_id: challengeId,
      entry_date: new Date().toISOString().slice(0, 10),
      actual_weight_kg: weight_kg,
      calories_consumed: dailySummary.total_calories_kcal,
      meals_completed: {
        breakfast: !!breakfast,
        lunch: !!lunch,
        dinner: !!dinner,
      },
    })
  }

  return (
    <div className="flex flex-col lg:flex-row gap-5 h-[calc(100vh-6.5rem)]">
      <div className="lg:w-2/5 min-w-0 lg:min-w-[320px] h-[50vh] lg:h-full">
        <ChatPanel onMealGenerated={handleMealGenerated} />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Meal Plan</h2>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={21}
              value={dayNumber}
              onChange={(e) => setDayNumber(parseInt(e.target.value || '1', 10))}
              className="w-20 px-2 py-1.5 rounded-lg border border-border bg-surface-0 text-sm"
            />
            <button
              onClick={handleGeneratePlan}
              disabled={!challengeId || loading || generatePlan.isPending}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark disabled:opacity-40 transition-colors"
            >
              {generatePlan.isPending ? 'Generating...' : 'Generate Plan'}
            </button>
            {hasPlan && (
              <button
                onClick={handleExportPdf}
                disabled={exportPlan.isPending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark disabled:opacity-40 transition-colors"
              >
                <Download className="w-4 h-4" /> {exportPlan.isPending ? 'Exporting...' : 'Download PDF'}
              </button>
            )}
            {hasPlan && (
              <button
                onClick={handleLogToday}
                disabled={logProgress.isPending}
                className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-surface-1 disabled:opacity-40 transition-colors"
              >
                {logProgress.isPending ? 'Saving...' : 'Log Today'}
              </button>
            )}
          </div>
        </div>
        {(generatePlan.error || exportPlan.error || logProgress.error) && (
          <div className="mb-3 p-3 rounded-lg bg-danger/10 text-danger text-sm">
            {(generatePlan.error as any)?.response?.data?.detail ||
              (exportPlan.error as any)?.response?.data?.detail ||
              (logProgress.error as any)?.response?.data?.detail ||
              'Operation failed'}
          </div>
        )}

        {hasPlan ? (
          <div className="space-y-4">
            {dailySummary && <DailySummary summary={dailySummary} />}
            <MealCard meal={breakfast} />
            <MealCard meal={lunch} />
            <MealCard meal={dinner} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 bg-surface-0 rounded-xl border border-border">
            <div className="text-center">
              <p className="text-text-secondary text-sm">No meal plan generated yet</p>
              <p className="text-text-muted text-xs mt-1">
                Select a day and click Generate Plan to create your daily meals
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
