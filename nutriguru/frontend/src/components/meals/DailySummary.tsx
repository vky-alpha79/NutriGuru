import { Droplets, Flame, Beef, TrendingDown } from 'lucide-react'

export interface DailySummaryData {
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

export default function DailySummary({ summary }: { summary: DailySummaryData }) {
  const metrics = [
    { label: 'Calories', value: `${summary.total_calories_kcal.toFixed(0)}`, unit: 'kcal', icon: Flame, color: 'text-primary' },
    { label: 'Protein', value: `${summary.total_protein_g.toFixed(0)}`, unit: 'g', icon: Beef, color: 'text-info' },
    { label: 'Deficit', value: `${summary.deficit_achieved_kcal.toFixed(0)}`, unit: 'kcal', icon: TrendingDown, color: 'text-success' },
    { label: 'Hydration', value: `${summary.hydration_target_litres.toFixed(1)}`, unit: 'L', icon: Droplets, color: 'text-info' },
  ]

  return (
    <div className="bg-surface-0 rounded-xl border border-border p-5">
      <h3 className="text-sm font-bold text-primary mb-1">{summary.day_theme}</h3>
      <p className="text-xs text-text-muted mb-4">Daily Summary</p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {metrics.map((m) => (
          <div key={m.label} className="p-3 rounded-lg bg-surface-1 border border-border">
            <div className="flex items-center gap-1.5 mb-1">
              <m.icon className={`w-3.5 h-3.5 ${m.color}`} />
              <span className="text-[10px] font-medium text-text-muted uppercase">{m.label}</span>
            </div>
            <span className="text-lg font-bold">{m.value}</span>
            <span className="text-xs text-text-muted ml-0.5">{m.unit}</span>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <h4 className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-2">Macro Split</h4>
        <div className="flex h-4 rounded-full overflow-hidden">
          <div className="bg-info" style={{ width: `${summary.macro_split_pct.protein}%` }} title={`Protein ${summary.macro_split_pct.protein}%`} />
          <div className="bg-warning" style={{ width: `${summary.macro_split_pct.carbs}%` }} title={`Carbs ${summary.macro_split_pct.carbs}%`} />
          <div className="bg-danger" style={{ width: `${summary.macro_split_pct.fat}%` }} title={`Fat ${summary.macro_split_pct.fat}%`} />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-text-muted">
          <span>Protein {summary.macro_split_pct.protein.toFixed(0)}%</span>
          <span>Carbs {summary.macro_split_pct.carbs.toFixed(0)}%</span>
          <span>Fat {summary.macro_split_pct.fat.toFixed(0)}%</span>
        </div>
      </div>

      {summary.supplements_note && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 mb-3">
          {summary.supplements_note}
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-text-secondary">Overall Confidence</span>
          <span className="text-xs font-bold">{(summary.overall_confidence * 100).toFixed(0)}%</span>
        </div>
        <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-primary" style={{ width: `${summary.overall_confidence * 100}%` }} />
        </div>
      </div>
    </div>
  )
}
