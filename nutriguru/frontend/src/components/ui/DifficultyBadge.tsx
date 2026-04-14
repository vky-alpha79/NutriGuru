interface Props {
  level: 'Low' | 'Medium' | 'High' | string
}

const COLORS: Record<string, string> = {
  Low: 'bg-success/10 text-success',
  Medium: 'bg-warning/10 text-warning',
  High: 'bg-danger/10 text-danger',
}

export default function DifficultyBadge({ level }: Props) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${COLORS[level] || 'bg-surface-2 text-text-muted'}`}>
      {level.toUpperCase()}
    </span>
  )
}
