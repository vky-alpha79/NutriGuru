interface Props {
  protein: number
  carbs: number
  fat: number
}

export default function MacroBar({ protein, carbs, fat }: Props) {
  const total = protein + carbs + fat || 1

  return (
    <div>
      <div className="flex h-3 rounded-full overflow-hidden">
        <div className="bg-info" style={{ width: `${(protein / total) * 100}%` }} />
        <div className="bg-warning" style={{ width: `${(carbs / total) * 100}%` }} />
        <div className="bg-danger" style={{ width: `${(fat / total) * 100}%` }} />
      </div>
      <div className="flex justify-between mt-1.5 text-[10px] text-text-muted">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-info" />Protein {protein.toFixed(0)}g</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-warning" />Carbs {carbs.toFixed(0)}g</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-danger" />Fat {fat.toFixed(0)}g</span>
      </div>
    </div>
  )
}
