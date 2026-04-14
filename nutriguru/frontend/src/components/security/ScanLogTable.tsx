import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

interface LogEntry {
  id: string
  timestamp: string
  scan_type: string
  flagged: boolean
  action_taken: string
  active_model: string
  breakdown: Record<string, any>
}

interface Props {
  entries: LogEntry[]
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
}

export default function ScanLogTable({ entries, total, page, pageSize, onPageChange }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="bg-surface-0 rounded-xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface-1 text-xs text-text-muted border-b border-border">
            <th className="w-8" />
            <th className="text-left py-2.5 px-3 font-medium">Timestamp</th>
            <th className="text-left py-2.5 px-3 font-medium">Scan Type</th>
            <th className="text-left py-2.5 px-3 font-medium">Flagged</th>
            <th className="text-left py-2.5 px-3 font-medium">Action</th>
            <th className="text-left py-2.5 px-3 font-medium">Model</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <>
              <tr
                key={e.id}
                className="border-b border-border/50 hover:bg-surface-1 cursor-pointer"
                onClick={() => setExpanded(expanded === e.id ? null : e.id)}
              >
                <td className="pl-3">
                  {expanded === e.id ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </td>
                <td className="py-2 px-3 text-text-secondary">{new Date(e.timestamp).toLocaleTimeString()}</td>
                <td className="py-2 px-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-2">{e.scan_type}</span>
                </td>
                <td className="py-2 px-3">
                  {e.flagged
                    ? <span className="text-danger font-bold">Yes</span>
                    : <span className="text-success">No</span>}
                </td>
                <td className="py-2 px-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    e.action_taken === 'block' ? 'bg-danger/10 text-danger'
                      : e.action_taken === 'warn' ? 'bg-warning/10 text-warning'
                      : 'bg-success/10 text-success'
                  }`}>
                    {e.action_taken}
                  </span>
                </td>
                <td className="py-2 px-3 text-text-muted">{e.active_model || '—'}</td>
              </tr>
              {expanded === e.id && (
                <tr key={`${e.id}-detail`} className="bg-surface-1">
                  <td colSpan={6} className="px-6 py-3">
                    <pre className="text-xs text-text-secondary whitespace-pre-wrap">
                      {JSON.stringify(e.breakdown, null, 2)}
                    </pre>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border text-xs">
          <span className="text-text-muted">{total} total events</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="px-2 py-1 rounded border border-border disabled:opacity-30"
            >Prev</button>
            <span className="px-2 text-text-secondary">{page} / {totalPages}</span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-2 py-1 rounded border border-border disabled:opacity-30"
            >Next</button>
          </div>
        </div>
      )}
    </div>
  )
}
