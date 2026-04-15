import { Download } from 'lucide-react'
import { useProfileStore } from '../stores/useProfileStore'
import { useExportPlan } from '../hooks/usePlan'

export default function ExportPage() {
  const { challengeId } = useProfileStore()
  const exportPlan = useExportPlan()

  const handleExport = async () => {
    if (!challengeId) return
    const blob = await exportPlan.mutateAsync({ challenge_id: challengeId })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `nutriguru_full_plan.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Export Plan</h1>
      <div className="bg-surface-0 rounded-xl border border-border p-5">
        <h3 className="text-sm font-bold mb-2">Download your NutriGuru plan</h3>
        <p className="text-sm text-text-secondary mb-4">
          Export all generated meal plan days into a single PDF document.
        </p>
        <button
          onClick={handleExport}
          disabled={!challengeId || exportPlan.isPending}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark disabled:opacity-40 transition-colors"
        >
          <Download className="w-4 h-4" />
          {exportPlan.isPending ? 'Exporting...' : 'Export PDF'}
        </button>
        {exportPlan.error && (
          <div className="mt-3 p-3 rounded-lg bg-danger/10 text-danger text-sm">
            {(exportPlan.error as any)?.response?.data?.detail || 'Unable to export PDF'}
          </div>
        )}
      </div>
    </div>
  )
}
