import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Utensils,
  MessageCircle,
  TrendingUp,
  BarChart3,
  Settings,
  Shield,
  Download,
  LucideIcon,
} from 'lucide-react'

const mainNav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/plan', icon: Utensils, label: 'My Plan' },
  { to: '/chat', icon: MessageCircle, label: 'Diet Chat' },
  { to: '/progress', icon: TrendingUp, label: 'Progress' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
]

const bottomNav = [
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/security', icon: Shield, label: 'Security' },
  { to: '/export', icon: Download, label: 'Export' },
]

interface Props {
  onNavigate?: () => void
}

function NavItem({ to, icon: Icon, label, onClick }: { to: string; icon: LucideIcon; label: string; onClick?: () => void }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      end={to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-primary/15 text-white'
            : 'text-white/60 hover:text-white hover:bg-white/5'
        }`
      }
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span>{label}</span>
    </NavLink>
  )
}

export default function Sidebar({ onNavigate }: Props) {
  return (
    <nav className="flex-1 flex flex-col px-3 py-4 h-full">
      <div className="flex flex-col gap-1">
        {mainNav.map((item) => (
          <NavItem key={item.to} {...item} onClick={onNavigate} />
        ))}
      </div>

      <div className="my-4 border-t border-white/10" />

      <div className="flex flex-col gap-1">
        {bottomNav.map((item) => (
          <NavItem key={item.to} {...item} onClick={onNavigate} />
        ))}
      </div>

      <div className="mt-auto px-4 py-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-success" />
          <span className="text-xs text-white/50">Model Status</span>
        </div>
      </div>
    </nav>
  )
}
