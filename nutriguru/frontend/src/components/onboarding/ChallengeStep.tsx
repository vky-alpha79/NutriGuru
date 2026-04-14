import { useState, useEffect } from 'react'
import { DIFFICULTIES } from '../../lib/constants'

interface Props {
  onValidChange: (valid: boolean) => void
  startDate: string
  endDate: string
  difficulty: string
  onStartChange: (v: string) => void
  onEndChange: (v: string) => void
  onDifficultyChange: (v: string) => void
}

export default function ChallengeStep({
  onValidChange, startDate, endDate, difficulty,
  onStartChange, onEndChange, onDifficultyChange,
}: Props) {
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (startDate && !endDate) {
      const d = new Date(startDate)
      d.setDate(d.getDate() + 21)
      onEndChange(d.toISOString().split('T')[0])
    }
  }, [startDate])

  useEffect(() => {
    if (startDate && endDate) {
      const diff = (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
      if (diff < 7) {
        setError('Challenge must be at least 7 days')
        onValidChange(false)
      } else {
        setError('')
        onValidChange(true)
      }
    } else {
      onValidChange(false)
    }
  }, [startDate, endDate])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Start Date</label>
          <input
            type="date"
            value={startDate}
            min={today}
            onChange={(e) => onStartChange(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-surface-2 border border-border focus:border-border-focus focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">End Date</label>
          <input
            type="date"
            value={endDate}
            min={startDate || today}
            onChange={(e) => onEndChange(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-surface-2 border border-border focus:border-border-focus focus:outline-none transition-colors"
          />
          {error && <p className="text-danger text-xs mt-1">{error}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">Difficulty Level</label>
        <div className="space-y-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => onDifficultyChange(d.value)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                difficulty === d.value
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border bg-surface-0 hover:border-text-muted'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                  d.value === 'Low' ? 'bg-success/10 text-success'
                    : d.value === 'Medium' ? 'bg-warning/10 text-warning'
                    : 'bg-danger/10 text-danger'
                }`}>
                  {d.value.toUpperCase()}
                </span>
                <span className="font-medium text-sm">{d.label}</span>
              </div>
              <span className="block text-xs text-text-muted mt-1">{d.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
