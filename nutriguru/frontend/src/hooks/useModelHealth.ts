import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'

export function useModelHealth() {
  return useQuery({
    queryKey: ['model-health'],
    queryFn: async () => {
      const { data } = await api.get('/models/health')
      return data
    },
    refetchInterval: 30000,
  })
}
