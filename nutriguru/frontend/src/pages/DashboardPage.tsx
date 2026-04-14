import { Scale, CalendarDays, Flame, TrendingDown, Shield } from 'lucide-react'
import MetricRing from '../components/ui/MetricRing'
import MetricCard from '../components/ui/MetricCard'
import SecurityBadge from '../components/ui/SecurityBadge'
import WeightChart from '../components/charts/WeightChart'
import { useProfileStore } from '../stores/useProfileStore'
import { useSecurityStore } from '../stores/useSecurityStore'
import { useProgress } from '../hooks/useProgress'
import { useSecurityStatus } from '../hooks/useSecurity'

export default function DashboardPage() {
  const profile = useProfileStore()
  const security = useSecurityStore()
  const { data: progress } = useProgress(profile.challengeId)

  useSecurityStatus()

  const metrics = profile.metrics
  const calTarget = metrics?.daily_calorie_target || 1800
  const proteinTarget = metrics?.protein_g || 120

  const calConsumed = progress?.entries?.length
    ? progress.entries[progress.entries.length - 1]?.calories || 0
    : 0

  const weightData = (progress?.entries || []).map((e: any, i: number) => ({
    date: `Day ${i + 1}`,
    actual: e.weight_kg,
    projected: profile.weight_kg - ((profile.weight_kg * 0.0857) / (progress?.total_days || 21)) * (i + 1),
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {profile.name || 'User'}</h1>
          <p className="text-sm text-text-secondary">
            Day {progress?.days_elapsed || 0} of {progress?.total_days || 21}
          </p>
        </div>
      </div>

      {/* Hero Metric Rings */}
      <div className="bg-surface-0 rounded-xl border border-border p-6">
        <div className="flex items-center justify-center gap-12 flex-wrap">
          <MetricRing label="Calories" value={calConsumed} max={calTarget} unit="kcal" color="var(--color-primary)" />
          <MetricRing label="Protein" value={0} max={proteinTarget} unit="grams" color="var(--color-info)" />
          <MetricRing label="Hydration" value={0} max={Math.round((metrics?.hydration_litres || 2.5) * 1000)} unit="ml" color="#06b6d4" />
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Weight Lost"
          value={`${progress?.weight_lost_kg || 0} kg`}
          icon={Scale}
          trend={progress?.weight_lost_kg > 0 ? 'up' : 'neutral'}
          trendLabel={progress?.weight_lost_kg > 0 ? 'on track' : 'start logging'}
        />
        <MetricCard
          label="Days Left"
          value={`${progress?.days_remaining || 21}`}
          sublabel="days"
          icon={CalendarDays}
        />
        <MetricCard
          label="Streak"
          value={`${progress?.streak_days || 0} days`}
          icon={Flame}
          trend={progress?.streak_days > 3 ? 'up' : 'neutral'}
          trendLabel={progress?.streak_days > 3 ? 'keep going!' : ''}
        />
        <MetricCard
          label="Avg Deficit"
          value="-980 kcal"
          icon={TrendingDown}
          trend="up"
          trendLabel="on target"
        />
      </div>

      {/* Weight Chart */}
      {weightData.length > 0 && <WeightChart data={weightData} />}

      {/* Security Widget */}
      <div className="bg-surface-0 rounded-xl border border-border p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-text-secondary" />
            <div>
              <div className="text-sm font-bold">Lakera Guard</div>
              <div className="text-xs text-text-muted">
                Scanned today: {security.totalScansToday} interactions | Threats blocked: {security.threatsBlockedToday}
              </div>
            </div>
          </div>
          <SecurityBadge mode={security.mode} />
        </div>
      </div>
    </div>
  )
}
