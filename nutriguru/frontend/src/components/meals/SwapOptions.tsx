import { ArrowRight } from 'lucide-react'

interface SwapOptionsProps {
  swaps: { ingredient: string; swap: string; reason: string }[]
}

export default function SwapOptions({ swaps }: SwapOptionsProps) {
  if (swaps.length === 0) return null

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-text-secondary">
            <th className="pb-2 pr-4 font-medium">Original</th>
            <th className="pb-2 pr-4 font-medium" />
            <th className="pb-2 pr-4 font-medium">Swap</th>
            <th className="pb-2 font-medium">Reason</th>
          </tr>
        </thead>
        <tbody>
          {swaps.map((s, i) => (
            <tr key={i} className="border-b border-border/50 last:border-0">
              <td className="py-2 pr-4 font-medium text-text-primary">{s.ingredient}</td>
              <td className="py-2 pr-4">
                <ArrowRight className="h-4 w-4 text-text-muted" />
              </td>
              <td className="py-2 pr-4 text-primary font-medium">{s.swap}</td>
              <td className="py-2 text-text-secondary">{s.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
