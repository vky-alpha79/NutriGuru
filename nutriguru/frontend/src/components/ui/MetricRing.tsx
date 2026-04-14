import { motion } from 'framer-motion'

interface Props {
  label: string
  value: number
  max: number
  unit: string
  color?: string
  size?: number
}

export default function MetricRing({ label, value, max, unit, color = 'var(--color-primary)', size = 120 }: Props) {
  const pct = Math.min((value / max) * 100, 100)
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-surface-2)" strokeWidth={6} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke={color} strokeWidth={6} strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>
        <div className="absolute text-center">
          <div className="text-xl font-bold">{value.toLocaleString()}</div>
          <div className="text-[10px] text-text-muted">/ {max.toLocaleString()}</div>
        </div>
      </div>
      <div className="text-center">
        <div className="text-xs font-medium text-text-secondary">{label}</div>
        <div className="text-[10px] text-text-muted">{Math.round(pct)}% · {unit}</div>
      </div>
    </motion.div>
  )
}
