import { ShieldAlert, X } from 'lucide-react'
import { useState } from 'react'

interface Props {
  message: string
  severity: 'high' | 'medium' | 'low'
}

export default function ThreatAlert({ message, severity }: Props) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  const colors = {
    high: 'bg-danger/10 border-danger/30 text-danger',
    medium: 'bg-warning/10 border-warning/30 text-warning',
    low: 'bg-info/10 border-info/30 text-info',
  }

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${colors[severity]}`}>
      <ShieldAlert className="w-4 h-4 shrink-0" />
      <span className="text-sm flex-1">{message}</span>
      <button onClick={() => setDismissed(true)} className="hover:opacity-70">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
