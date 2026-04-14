import { useProfileStore } from '../../stores/useProfileStore'
import { SEX_OPTIONS } from '../../lib/constants'

interface Props {
  onValidChange: (valid: boolean) => void
}

export default function PersonalStep({ onValidChange }: Props) {
  const { name, age, sex, weight_kg, height_cm, setProfile } = useProfileStore()

  const validate = (n: string, a: number, w: number, h: number) => {
    onValidChange(n.length >= 2 && a >= 10 && a <= 90 && w >= 30 && w <= 200 && h >= 100 && h <= 250)
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Full Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setProfile({ name: e.target.value })
            validate(e.target.value, age, weight_kg, height_cm)
          }}
          placeholder="Enter your full name"
          className="w-full px-4 py-3 rounded-lg bg-surface-2 border border-border focus:border-border-focus focus:outline-none transition-colors"
          minLength={2}
          maxLength={50}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => {
              const v = parseInt(e.target.value) || 0
              setProfile({ age: v })
              validate(name, v, weight_kg, height_cm)
            }}
            min={10}
            max={90}
            className="w-full px-4 py-3 rounded-lg bg-surface-2 border border-border focus:border-border-focus focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Sex</label>
          <select
            value={sex}
            onChange={(e) => setProfile({ sex: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-surface-2 border border-border focus:border-border-focus focus:outline-none transition-colors"
          >
            {SEX_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Weight (kg)</label>
          <input
            type="number"
            value={weight_kg}
            onChange={(e) => {
              const v = parseFloat(e.target.value) || 0
              setProfile({ weight_kg: v })
              validate(name, age, v, height_cm)
            }}
            min={30}
            max={200}
            step={0.1}
            className="w-full px-4 py-3 rounded-lg bg-surface-2 border border-border focus:border-border-focus focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Height (cm)</label>
          <input
            type="number"
            value={height_cm}
            onChange={(e) => {
              const v = parseFloat(e.target.value) || 0
              setProfile({ height_cm: v })
              validate(name, age, weight_kg, v)
            }}
            min={100}
            max={250}
            step={0.1}
            className="w-full px-4 py-3 rounded-lg bg-surface-2 border border-border focus:border-border-focus focus:outline-none transition-colors"
          />
        </div>
      </div>
    </div>
  )
}
