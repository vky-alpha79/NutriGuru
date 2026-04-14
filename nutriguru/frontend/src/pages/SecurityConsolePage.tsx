import { useState } from 'react'
import { Shield, Zap, AlertTriangle, Clock } from 'lucide-react'
import MetricCard from '../components/ui/MetricCard'
import SecurityToggle from '../components/security/SecurityToggle'
import ScanLogTable from '../components/security/ScanLogTable'
import { useSecurityStatus, useSecurityLogs, useUpdateSecurityMode } from '../hooks/useSecurity'
import { useSecurityStore } from '../stores/useSecurityStore'
import { useAuthStore } from '../stores/useAuthStore'

export default function SecurityConsolePage() {
  const [logPage, setLogPage] = useState(1)
  const { mode, totalScansToday, threatsBlockedToday, avgLatencyMs } = useSecurityStore()
  const role = useAuthStore((s) => s.role)

  useSecurityStatus()
  const { data: logData } = useSecurityLogs(logPage)
  const updateMode = useUpdateSecurityMode()

  const handleModeChange = (newMode: 'enforce' | 'graduated' | 'monitor') => {
    updateMode.mutate({ mode: newMode })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Security Console</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Scans" value={totalScansToday.toString()} icon={Shield} />
        <MetricCard label="Threats Blocked" value={threatsBlockedToday.toString()} icon={AlertTriangle}
          trend={threatsBlockedToday > 0 ? 'down' : 'neutral'} trendLabel={threatsBlockedToday > 0 ? 'blocked' : 'none'}
        />
        <MetricCard label="False Positives" value="0" icon={Zap} />
        <MetricCard label="Avg Latency" value={`${avgLatencyMs.toFixed(0)}ms`} icon={Clock}
          trend={avgLatencyMs < 100 ? 'up' : 'down'} trendLabel={avgLatencyMs < 100 ? 'fast' : 'slow'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SecurityToggle mode={mode} onModeChange={handleModeChange} userRole={role} />

        <div className="col-span-2 bg-surface-0 rounded-xl border border-border p-5">
          <h3 className="text-sm font-bold mb-3">Policy Status</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Policy Health</span>
              <span className="text-success font-medium">Valid</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Last Checked</span>
              <span className="text-text-muted">2 min ago</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Project ID</span>
              <span className="font-mono text-xs text-text-muted">project-1344722930</span>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-surface-1">Check Policy</button>
            <button className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-surface-1">Lint Policy</button>
            <button className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-surface-1">View Config</button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold mb-3">Scan Log</h3>
        <ScanLogTable
          entries={logData?.entries || []}
          total={logData?.total || 0}
          page={logPage}
          pageSize={20}
          onPageChange={setLogPage}
        />
      </div>
    </div>
  )
}
