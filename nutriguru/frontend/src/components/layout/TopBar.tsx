import { Leaf, Shield, Settings, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Props {
  activeModel?: string
  securityMode?: string
  onMenuToggle?: () => void
}

function getModelBadge(activeModel?: string) {
  if (!activeModel) return { color: 'bg-gray-400', label: 'No Model' }
  const name = activeModel.toLowerCase()
  if (name.includes('nemotron')) return { color: 'bg-green-500', label: 'Nemotron' }
  if (name.includes('claude')) return { color: 'bg-amber-500', label: 'Claude' }
  if (name.includes('gemma')) return { color: 'bg-red-500', label: 'Gemma' }
  return { color: 'bg-gray-400', label: activeModel }
}

function getSecurityBadge(mode?: string) {
  switch (mode) {
    case 'enforce': return { textColor: 'text-success', label: 'SECURE' }
    case 'monitor': case 'graduated': return { textColor: 'text-warning', label: 'MONITOR' }
    default: return { textColor: 'text-danger', label: 'DISABLED' }
  }
}

export default function TopBar({ activeModel, securityMode, onMenuToggle }: Props) {
  const model = getModelBadge(activeModel)
  const security = getSecurityBadge(securityMode)
  const navigate = useNavigate()

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-surface-0 border-b border-border flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="p-2 rounded-lg text-text-secondary hover:bg-surface-2 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Leaf className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold text-navy tracking-tight">NutriGuru</span>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="hidden sm:flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${model.color}`} />
          <span className="text-sm font-medium text-text-secondary">{model.label}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Shield className={`h-4 w-4 ${security.textColor}`} />
          <span className={`text-xs font-semibold tracking-wide ${security.textColor}`}>
            {security.label}
          </span>
        </div>

        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="p-2 rounded-lg text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}
