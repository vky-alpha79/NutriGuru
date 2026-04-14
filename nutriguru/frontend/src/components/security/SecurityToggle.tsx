import { Shield, ShieldAlert, ShieldOff } from 'lucide-react'

interface Props {
  mode: string
  onModeChange: (mode: 'enforce' | 'graduated' | 'monitor') => void
  userRole: string
}

const MODES = [
  { value: 'enforce' as const, label: 'SECURE', icon: Shield, desc: 'Full enforcement — all flagged content blocked', color: 'border-success bg-success/5 text-success' },
  { value: 'monitor' as const, label: 'MONITOR', icon: ShieldAlert, desc: 'Scanning but not blocking (calibration)', color: 'border-warning bg-warning/5 text-warning' },
]

export default function SecurityToggle({ mode, onModeChange, userRole }: Props) {
  const canModify = userRole === 'admin' || userRole === 'operator'

  return (
    <div className="bg-surface-0 rounded-xl border border-border p-5">
      <h3 className="text-sm font-bold mb-3">Security Mode</h3>
      <div className="space-y-2">
        {MODES.map((m) => (
          <button
            key={m.value}
            onClick={() => canModify && onModeChange(m.value)}
            disabled={!canModify}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
              mode === m.value ? m.color : 'border-border bg-surface-0 text-text-secondary'
            } ${canModify ? 'cursor-pointer hover:shadow-sm' : 'cursor-not-allowed opacity-70'}`}
          >
            <m.icon className="w-5 h-5" />
            <div className="text-left">
              <div className="text-sm font-bold">{m.label}</div>
              <div className="text-[10px] opacity-70">{m.desc}</div>
            </div>
          </button>
        ))}
      </div>
      {!canModify && (
        <p className="text-[10px] text-text-muted mt-2">Admin or operator access required to change mode</p>
      )}
    </div>
  )
}
