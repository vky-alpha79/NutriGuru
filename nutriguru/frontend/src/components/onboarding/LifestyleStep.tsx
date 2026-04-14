import { useProfileStore } from '../../stores/useProfileStore'
import { ACTIVITY_TYPES, DIETARY_PREFS, CUISINE_PREFS } from '../../lib/constants'

export default function LifestyleStep() {
  const { activity_type, dietary_pref, cuisine_pref, setProfile } = useProfileStore()

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">Activity Level</label>
        <div className="space-y-2">
          {ACTIVITY_TYPES.map((a) => (
            <button
              key={a.value}
              type="button"
              onClick={() => setProfile({ activity_type: a.value })}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                activity_type === a.value
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border bg-surface-0 hover:border-text-muted'
              }`}
            >
              <span className="font-medium text-sm">{a.label}</span>
              <span className="block text-xs text-text-muted mt-0.5">{a.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">Dietary Preference</label>
        <div className="grid grid-cols-2 gap-2">
          {DIETARY_PREFS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setProfile({ dietary_pref: d })}
              className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                dietary_pref === d
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border bg-surface-0 hover:border-text-muted'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">Cuisine Preference</label>
        <div className="grid grid-cols-2 gap-2">
          {CUISINE_PREFS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setProfile({ cuisine_pref: c })}
              className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                cuisine_pref === c
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border bg-surface-0 hover:border-text-muted'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
