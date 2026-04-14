import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface Props {
  label: string
  value: string
  sublabel?: string
  icon: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  trendLabel?: string
}

export default function MetricCard({ label, value, sublabel, icon: Icon, trend, trendLabel }: Props) {
  return (
    <div className="bg-surface-0 rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-text-muted uppercase tracking-wider">{label}</span>
        <Icon className="w-4 h-4 text-text-muted" />
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {(sublabel || trendLabel) && (
        <div className="flex items-center gap-1 mt-1">
          {trend === 'up' && <TrendingUp className="w-3 h-3 text-success" />}
          {trend === 'down' && <TrendingDown className="w-3 h-3 text-danger" />}
          {trend === 'neutral' && <Minus className="w-3 h-3 text-text-muted" />}
          <span className={`text-[10px] font-medium ${
            trend === 'up' ? 'text-success' : trend === 'down' ? 'text-danger' : 'text-text-muted'
          }`}>
            {trendLabel || sublabel}
          </span>
        </div>
      )}
    </div>
  )
}
