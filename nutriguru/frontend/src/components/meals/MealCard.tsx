import { Clock, Lightbulb, Star, ArrowRightLeft, Shield } from 'lucide-react'

interface Ingredient {
  item: string
  quantity: number
  unit: string
  notes?: string
}

interface SwapOption {
  ingredient: string
  swap: string
  reason: string
}

export interface MealData {
  meal_type: string
  dish_name: string
  cuisine_region: string
  serves: number
  prep_time_min: number
  cook_time_min: number
  ingredients: Ingredient[]
  steps: string[]
  cooking_tip: string
  macros: Record<string, number>
  micros: Record<string, number>
  health_rationale: Record<string, string>
  confidence_score: number
  confidence_basis: string
  expert_tips: string[]
  swap_options: SwapOption[]
  allergen_flags: string[]
}

const MEAL_COLORS: Record<string, string> = {
  Breakfast: 'bg-amber-100 text-amber-800',
  Lunch: 'bg-emerald-100 text-emerald-800',
  Dinner: 'bg-indigo-100 text-indigo-800',
}

export default function MealCard({ meal }: { meal: MealData }) {
  const macros = meal.macros || {}
  const maxMacro = Math.max(macros.protein_g || 0, macros.carbs_g || 0, macros.fat_g || 0, macros.fibre_g || 0, 1)

  return (
    <div className="bg-surface-0 rounded-xl border border-border overflow-hidden">
      {/* Section A: Header */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-1">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${MEAL_COLORS[meal.meal_type] || 'bg-gray-100 text-gray-700'}`}>
            {meal.meal_type}
          </span>
          <span className="text-xs text-text-muted">{meal.cuisine_region}</span>
        </div>
        <h3 className="text-lg font-bold mt-1">{meal.dish_name}</h3>
        <div className="flex items-center gap-4 mt-2 text-xs text-text-secondary">
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Prep: {meal.prep_time_min}min</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Cook: {meal.cook_time_min}min</span>
        </div>
      </div>

      {/* Section B: Recipe */}
      <div className="px-5 py-4 border-b border-border">
        <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Ingredients</h4>
        <table className="w-full text-sm mb-4">
          <thead><tr className="text-xs text-text-muted border-b border-border">
            <th className="text-left pb-1.5 font-medium">Item</th>
            <th className="text-right pb-1.5 font-medium">Qty</th>
            <th className="text-left pb-1.5 pl-2 font-medium">Unit</th>
          </tr></thead>
          <tbody>
            {(meal.ingredients || []).map((ing, i) => (
              <tr key={i} className="border-b border-border/50 last:border-0">
                <td className="py-1.5">{ing.item}{ing.notes && <span className="text-text-muted text-xs ml-1">({ing.notes})</span>}</td>
                <td className="text-right py-1.5">{ing.quantity}</td>
                <td className="pl-2 py-1.5 text-text-muted">{ing.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Steps</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm text-text-primary">
          {(meal.steps || []).map((s, i) => <li key={i}>{s.replace(/^Step \d+:\s*/i, '')}</li>)}
        </ol>

        {meal.cooking_tip && (
          <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <span className="text-xs text-amber-800">{meal.cooking_tip}</span>
          </div>
        )}
      </div>

      {/* Section C: Macros */}
      <div className="px-5 py-4 border-b border-border">
        <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Nutrition</h4>
        <div className="space-y-2">
          {[
            { key: 'protein_g', label: 'Protein', color: 'bg-info' },
            { key: 'carbs_g', label: 'Carbs', color: 'bg-warning' },
            { key: 'fat_g', label: 'Fat', color: 'bg-danger' },
            { key: 'fibre_g', label: 'Fibre', color: 'bg-success' },
          ].map(({ key, label, color }) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-xs text-text-secondary w-14">{label}</span>
              <div className="flex-1 h-3 bg-surface-2 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${((macros[key] || 0) / maxMacro) * 100}%` }} />
              </div>
              <span className="text-xs font-medium w-10 text-right">{(macros[key] || 0).toFixed(0)}g</span>
            </div>
          ))}
          <div className="text-center text-sm font-semibold mt-2 text-primary">
            {(macros.calories_kcal || 0).toFixed(0)} kcal
          </div>
        </div>
      </div>

      {/* Section D: Health Rationale */}
      {meal.health_rationale && (
        <div className="px-5 py-4 border-b border-border space-y-2">
          {meal.health_rationale.weight_loss_benefit && (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-600 uppercase">Weight Loss</span>
              <p className="text-xs text-emerald-800 mt-0.5">{meal.health_rationale.weight_loss_benefit}</p>
            </div>
          )}
          {meal.health_rationale.anti_ageing_benefit && (
            <div className="p-2.5 rounded-lg bg-violet-50 border border-violet-200">
              <span className="text-[10px] font-bold text-violet-600 uppercase">Anti-Ageing</span>
              <p className="text-xs text-violet-800 mt-0.5">{meal.health_rationale.anti_ageing_benefit}</p>
            </div>
          )}
          {meal.health_rationale.ayurvedic_note && (
            <div className="p-2.5 rounded-lg bg-orange-50 border border-orange-200">
              <span className="text-[10px] font-bold text-orange-600 uppercase">Ayurvedic</span>
              <p className="text-xs text-orange-800 mt-0.5">{meal.health_rationale.ayurvedic_note}</p>
            </div>
          )}
        </div>
      )}

      {/* Section E: Confidence */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-text-secondary flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> AI Confidence
          </span>
          <span className="text-sm font-bold">{((meal.confidence_score || 0) * 100).toFixed(0)}%</span>
        </div>
        <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-primary" style={{ width: `${(meal.confidence_score || 0) * 100}%` }} />
        </div>
        {meal.confidence_basis && <p className="text-[10px] text-text-muted mt-1">{meal.confidence_basis}</p>}
      </div>

      {/* Section F: Tips & Swaps */}
      <div className="px-5 py-4">
        {meal.expert_tips?.length > 0 && (
          <div className="mb-3">
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Expert Tips</h4>
            {meal.expert_tips.map((t, i) => (
              <div key={i} className="flex items-start gap-1.5 text-xs text-text-primary mb-1">
                <Star className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        )}
        {meal.swap_options?.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Swap Options</h4>
            {meal.swap_options.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-xs mb-1.5">
                <span className="font-medium">{s.ingredient}</span>
                <ArrowRightLeft className="w-3 h-3 text-text-muted" />
                <span className="text-primary font-medium">{s.swap}</span>
                <span className="text-text-muted">({s.reason})</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
