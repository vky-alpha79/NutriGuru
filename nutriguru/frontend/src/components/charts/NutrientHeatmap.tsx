interface Props {
  days: string[]
  nutrients: string[]
  values: number[][]
}

function getHeatColor(pct: number): string {
  if (pct >= 90) return 'bg-success'
  if (pct >= 70) return 'bg-success/60'
  if (pct >= 50) return 'bg-warning'
  if (pct >= 25) return 'bg-warning/60'
  return 'bg-danger/40'
}

export default function NutrientHeatmap({ days, nutrients, values }: Props) {
  return (
    <div className="bg-surface-0 rounded-xl border border-border p-5">
      <h3 className="text-sm font-bold mb-4">Nutrient Coverage (% RDA)</h3>
      <div className="overflow-x-auto">
        <table className="text-[10px]">
          <thead>
            <tr>
              <th className="text-left pr-2 pb-1 font-medium text-text-muted" />
              {days.map((d) => (
                <th key={d} className="px-1 pb-1 font-medium text-text-muted text-center">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {nutrients.map((nutrient, ni) => (
              <tr key={nutrient}>
                <td className="pr-2 py-0.5 text-text-secondary whitespace-nowrap">{nutrient}</td>
                {(values[ni] || []).map((val, di) => (
                  <td key={di} className="px-1 py-0.5">
                    <div
                      className={`w-5 h-5 rounded-sm ${getHeatColor(val)} flex items-center justify-center text-white font-bold`}
                      title={`${nutrient}: ${val}%`}
                    >
                      {val > 0 ? '' : ''}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-2 mt-3 text-[10px] text-text-muted">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-danger/40" /> &lt;25%</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-warning/60" /> 25-49%</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-warning" /> 50-69%</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-success/60" /> 70-89%</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-success" /> 90%+</span>
      </div>
    </div>
  )
}
