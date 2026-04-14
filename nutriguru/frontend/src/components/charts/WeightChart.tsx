import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface DataPoint {
  date: string
  actual?: number
  projected?: number
}

interface Props {
  data: DataPoint[]
}

export default function WeightChart({ data }: Props) {
  return (
    <div className="bg-surface-0 rounded-xl border border-border p-5">
      <h3 className="text-sm font-bold mb-4">Weight Trajectory</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--color-text-muted)" />
          <YAxis tick={{ fontSize: 10 }} stroke="var(--color-text-muted)" domain={['dataMin - 1', 'dataMax + 1']} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--color-border)' }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="projected" stroke="var(--color-text-muted)" strokeDasharray="5 5" dot={false} name="Projected" />
          <Line type="monotone" dataKey="actual" stroke="var(--color-primary)" strokeWidth={2} dot={{ r: 3 }} name="Actual" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
