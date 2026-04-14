import { Shield } from 'lucide-react'

interface Props {
  mode: 'enforce' | 'graduated' | 'monitor' | string
}

const MODE_CONFIG: Record<string, { label: string; dotColor: string; textColor: string }> = {
  enforce: { label: 'SECURE', dotColor: 'bg-success', textColor: 'text-success' },
  graduated: { label: 'GRADUATED', dotColor: 'bg-warning', textColor: 'text-warning' },
  monitor: { label: 'MONITOR', dotColor: 'bg-warning', textColor: 'text-warning' },
}

export default function SecurityBadge({ mode }: Props) {
  const cfg = MODE_CONFIG[mode] || { label: 'DISABLED', dotColor: 'bg-danger', textColor: 'text-danger' }

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-1 border border-border">
      <Shield className={`w-3.5 h-3.5 ${cfg.textColor}`} />
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
      <span className={`text-[10px] font-bold tracking-wider ${cfg.textColor}`}>{cfg.label}</span>
    </div>
  )
}
