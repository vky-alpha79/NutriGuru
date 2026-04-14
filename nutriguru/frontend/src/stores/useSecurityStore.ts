import { create } from 'zustand'

interface SecurityState {
  mode: 'enforce' | 'graduated' | 'monitor'
  totalScansToday: number
  threatsBlockedToday: number
  avgLatencyMs: number
  setStatus: (data: {
    mode: string
    total_scans_today: number
    threats_blocked_today: number
    avg_latency_ms: number
  }) => void
  setMode: (mode: 'enforce' | 'graduated' | 'monitor') => void
}

export const useSecurityStore = create<SecurityState>((set) => ({
  mode: 'enforce',
  totalScansToday: 0,
  threatsBlockedToday: 0,
  avgLatencyMs: 0,

  setStatus: (data) =>
    set({
      mode: data.mode as 'enforce' | 'graduated' | 'monitor',
      totalScansToday: data.total_scans_today,
      threatsBlockedToday: data.threats_blocked_today,
      avgLatencyMs: data.avg_latency_ms,
    }),

  setMode: (mode) => set({ mode }),
}))
