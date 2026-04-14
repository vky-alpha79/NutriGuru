import { Download } from 'lucide-react'
import ChatPanel from '../components/chat/ChatPanel'
import MealCard from '../components/meals/MealCard'
import DailySummary from '../components/meals/DailySummary'
import { usePlanStore } from '../stores/usePlanStore'

export default function DietChatPage() {
  const { breakfast, lunch, dinner, dailySummary, setPlan } = usePlanStore()
  const hasPlan = breakfast && lunch && dinner

  const handleMealGenerated = (data: any) => {
    if (data.breakfast && data.lunch && data.dinner) {
      setPlan(data)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-5 h-[calc(100vh-6.5rem)]">
      <div className="lg:w-2/5 min-w-0 lg:min-w-[320px] h-[50vh] lg:h-full">
        <ChatPanel onMealGenerated={handleMealGenerated} />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Meal Plan</h2>
          {hasPlan && (
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors">
              <Download className="w-4 h-4" /> Download PDF
            </button>
          )}
        </div>

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
              <p className="text-text-muted text-xs mt-1">Ask NutriGuru to generate your daily plan</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
