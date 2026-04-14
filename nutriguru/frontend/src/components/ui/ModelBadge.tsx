interface Props {
  model: string
}

function getModelDisplay(model: string) {
  const lower = model.toLowerCase()
  if (lower.includes('nemotron')) return { name: 'Nemotron', color: 'bg-success' }
  if (lower.includes('claude')) return { name: 'Claude', color: 'bg-warning' }
  if (lower.includes('gemma')) return { name: 'Gemma', color: 'bg-danger' }
  return { name: model || 'Unknown', color: 'bg-text-muted' }
}

export default function ModelBadge({ model }: Props) {
  const { name, color } = getModelDisplay(model)

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-1 border border-border">
      <span className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-[10px] font-bold text-text-secondary tracking-wider">{name}</span>
    </div>
  )
}
