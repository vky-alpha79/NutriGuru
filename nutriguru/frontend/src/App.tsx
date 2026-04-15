import { Routes, Route, Navigate } from 'react-router-dom'
import ErrorBoundary from './components/ui/ErrorBoundary'
import MainLayout from './components/layout/MainLayout'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import DietChatPage from './pages/DietChatPage'
import ProgressPage from './pages/ProgressPage'
import SecurityConsolePage from './pages/SecurityConsolePage'
import SettingsPage from './pages/SettingsPage'
import ExportPage from './pages/ExportPage'
import { useAuthStore } from './stores/useAuthStore'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuth = useAuthStore((s) => s.isAuthenticated)()
  if (!isAuth) return <Navigate to="/onboard" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/onboard" element={<OnboardingPage />} />
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/plan" element={<DietChatPage />} />
          <Route path="/chat" element={<DietChatPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/analytics" element={<ProgressPage />} />
          <Route path="/security" element={<SecurityConsolePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/export" element={<ExportPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  )
}
