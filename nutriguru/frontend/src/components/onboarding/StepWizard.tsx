import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronLeft, Leaf } from 'lucide-react'
import PersonalStep from './PersonalStep'
import LifestyleStep from './LifestyleStep'
import ChallengeStep from './ChallengeStep'
import { useProfileStore } from '../../stores/useProfileStore'
import { useAuthStore } from '../../stores/useAuthStore'
import api from '../../lib/api'

const STEPS = ['Personal', 'Lifestyle', 'Challenge']

export default function StepWizard() {
  const [step, setStep] = useState(0)
  const [personalValid, setPersonalValid] = useState(false)
  const [challengeValid, setChallengeValid] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [difficulty, setDifficulty] = useState('Medium')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const profile = useProfileStore()
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const canNext = () => {
    if (step === 0) return personalValid
    if (step === 1) return true
    if (step === 2) return challengeValid && password.length >= 6
    return false
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const [sy, sm, sd] = startDate.split('-')
      const [ey, em, ed] = endDate.split('-')

      const res = await api.post('/onboard', {
        personal: {
          name: profile.name,
          age: profile.age,
          sex: profile.sex,
          weight_kg: profile.weight_kg,
          height_cm: profile.height_cm,
        },
        lifestyle: {
          activity_type: profile.activity_type,
          dietary_pref: profile.dietary_pref,
          cuisine_pref: profile.cuisine_pref,
        },
        challenge: {
          challenge_start: startDate,
          challenge_end: endDate,
          difficulty,
        },
        password,
      })

      const data = res.data
      setAuth(data.token, data.user_id)
      profile.setMetrics(data.metrics, data.warnings)
      if (data.challenge_id) profile.setChallengeId(data.challenge_id)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-1 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <Leaf className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-navy">NutriGuru</h1>
          </div>
          <p className="text-text-secondary text-sm">Your 21-Day Anti-Ageing Fat Loss Journey</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                i <= step ? 'bg-primary text-white' : 'bg-surface-2 text-text-muted'
              }`}>
                {i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${
                i <= step ? 'text-primary' : 'text-text-muted'
              }`}>
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`w-12 h-0.5 ${i < step ? 'bg-primary' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-surface-0 rounded-2xl shadow-lg border border-border p-6">
          <h2 className="text-lg font-semibold mb-5">
            {step === 0 && 'Tell us about yourself'}
            {step === 1 && 'Your lifestyle & preferences'}
            {step === 2 && 'Set up your challenge'}
          </h2>

          {step === 0 && <PersonalStep onValidChange={setPersonalValid} />}
          {step === 1 && <LifestyleStep />}
          {step === 2 && (
            <>
              <ChallengeStep
                onValidChange={setChallengeValid}
                startDate={startDate}
                endDate={endDate}
                difficulty={difficulty}
                onStartChange={setStartDate}
                onEndChange={setEndDate}
                onDifficultyChange={setDifficulty}
              />
              <div className="mt-5">
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Create a Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-4 py-3 rounded-lg bg-surface-2 border border-border focus:border-border-focus focus:outline-none transition-colors"
                />
              </div>
            </>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-danger/10 text-danger text-sm">{error}</div>
          )}

          <div className="flex items-center justify-between mt-6">
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="flex items-center gap-1 px-4 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            {step < 2 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext()}
                className="flex items-center gap-1 px-6 py-2.5 rounded-lg text-sm font-bold bg-primary text-white hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canNext() || loading}
                className="flex items-center gap-1 px-6 py-2.5 rounded-lg text-sm font-bold bg-primary text-white hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating...' : 'Start Challenge'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
