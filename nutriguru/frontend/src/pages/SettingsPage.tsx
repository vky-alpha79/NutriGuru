import { useProfileStore } from '../stores/useProfileStore'
import { useAuthStore } from '../stores/useAuthStore'
import { useNavigate } from 'react-router-dom'

export default function SettingsPage() {
  const profile = useProfileStore()
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/onboard')
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="bg-surface-0 rounded-xl border border-border p-5">
        <h3 className="text-sm font-bold mb-4">Profile Summary</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-text-muted">Name:</span> <span className="font-medium">{profile.name}</span></div>
          <div><span className="text-text-muted">Age:</span> <span className="font-medium">{profile.age}</span></div>
          <div><span className="text-text-muted">Sex:</span> <span className="font-medium">{profile.sex}</span></div>
          <div><span className="text-text-muted">Weight:</span> <span className="font-medium">{profile.weight_kg} kg</span></div>
          <div><span className="text-text-muted">Height:</span> <span className="font-medium">{profile.height_cm} cm</span></div>
          <div><span className="text-text-muted">Activity:</span> <span className="font-medium">{profile.activity_type}</span></div>
          <div><span className="text-text-muted">Diet:</span> <span className="font-medium">{profile.dietary_pref}</span></div>
          <div><span className="text-text-muted">Cuisine:</span> <span className="font-medium">{profile.cuisine_pref}</span></div>
        </div>
      </div>

      {profile.metrics && (
        <div className="bg-surface-0 rounded-xl border border-border p-5">
          <h3 className="text-sm font-bold mb-4">Computed Metrics</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-text-muted">BMI:</span> <span className="font-medium">{profile.metrics.bmi.toFixed(1)}</span></div>
            <div><span className="text-text-muted">BMR:</span> <span className="font-medium">{profile.metrics.bmr.toFixed(0)} kcal</span></div>
            <div><span className="text-text-muted">TDEE:</span> <span className="font-medium">{profile.metrics.tdee.toFixed(0)} kcal</span></div>
            <div><span className="text-text-muted">Target:</span> <span className="font-medium">{profile.metrics.daily_calorie_target.toFixed(0)} kcal</span></div>
            <div><span className="text-text-muted">Protein:</span> <span className="font-medium">{profile.metrics.protein_g.toFixed(0)}g</span></div>
            <div><span className="text-text-muted">Hydration:</span> <span className="font-medium">{profile.metrics.hydration_litres.toFixed(1)}L</span></div>
          </div>
        </div>
      )}

      <button
        onClick={handleLogout}
        className="px-5 py-2.5 rounded-lg bg-danger text-white text-sm font-medium hover:bg-danger/90 transition-colors"
      >
        Logout
      </button>
    </div>
  )
}
