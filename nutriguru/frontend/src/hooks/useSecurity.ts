import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { useSecurityStore } from '../stores/useSecurityStore'

export function useSecurityStatus() {
  const setStatus = useSecurityStore((s) => s.setStatus)

  return useQuery({
    queryKey: ['security-status'],
    queryFn: async () => {
      const { data } = await api.get('/security/status')
      setStatus(data)
      return data
    },
    refetchInterval: 30000,
  })
}

export function useSecurityLogs(page: number = 1, pageSize: number = 20) {
  return useQuery({
    queryKey: ['security-logs', page, pageSize],
    queryFn: async () => {
      const { data } = await api.get('/security/logs', { params: { page, page_size: pageSize } })
      return data
    },
  })
}

export function useUpdateSecurityMode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { mode: string; reason?: string }) => {
      const { data } = await api.put('/security/mode', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-status'] })
    },
  })
}
