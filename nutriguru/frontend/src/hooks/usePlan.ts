import { useMutation } from '@tanstack/react-query'
import api from '../lib/api'

export function useGeneratePlan() {
  return useMutation({
    mutationFn: async (payload: { challenge_id: string; day_number: number }) => {
      const { data } = await api.post('/plan/generate', payload)
      return data
    },
  })
}

export function useExportPlan() {
  return useMutation({
    mutationFn: async (payload: { challenge_id: string }) => {
      const { data } = await api.post('/plan/export', payload)
      return data
    },
  })
}
