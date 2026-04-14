import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'

interface DataPoint {
  date: string
  calories: number
}

interface Props {
  data: DataPoint[]
  target: number
}

export default function CalorieBarChart({ data, target }: Props) {
  return (
    <div className="bg-surface-0 rounded-xl border border-border p-5">
      <h3 className="text-sm font-bold mb-4">Daily Caloric Intake</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--color-text-muted)" />
          <YAxis tick={{ fontSize: 10 }} stroke="var(--color-text-muted)" />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--color-border)' }} />
          <ReferenceLine y={target} stroke="var(--color-danger)" strokeDasharray="4 4" label={{ value: 'Target', fontSize: 10 }} />
          <Bar dataKey="calories" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
