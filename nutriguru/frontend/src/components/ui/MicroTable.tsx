interface NutrientRow {
  name: string
  amount: number
  unit: string
  rdaPct: number
}

interface Props {
  nutrients: NutrientRow[]
}

export default function MicroTable({ nutrients }: Props) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-xs text-text-muted border-b border-border">
          <th className="text-left pb-1.5 font-medium">Nutrient</th>
          <th className="text-right pb-1.5 font-medium">Amount</th>
          <th className="text-right pb-1.5 font-medium w-24">% RDA</th>
        </tr>
      </thead>
      <tbody>
        {nutrients.map((n) => (
          <tr key={n.name} className="border-b border-border/50 last:border-0">
            <td className="py-1.5 text-text-primary">{n.name}</td>
            <td className="text-right py-1.5 text-text-secondary">{n.amount}{n.unit}</td>
            <td className="text-right py-1.5">
              <div className="flex items-center justify-end gap-2">
                <div className="w-16 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${n.rdaPct >= 75 ? 'bg-success' : n.rdaPct >= 50 ? 'bg-warning' : 'bg-danger'}`}
                    style={{ width: `${Math.min(n.rdaPct, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-text-muted w-8">{n.rdaPct}%</span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
