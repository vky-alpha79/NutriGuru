import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import TopBar from './TopBar'
import Sidebar from './Sidebar'

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-surface-1">
      <TopBar onMenuToggle={() => setSidebarOpen((v) => !v)} />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar: fixed on desktop, slide-in on mobile */}
      <div className={`
        fixed top-16 left-0 bottom-0 z-30 w-60 bg-navy transition-transform duration-200
        lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      <main className="lg:ml-60 mt-16 p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  )
}
