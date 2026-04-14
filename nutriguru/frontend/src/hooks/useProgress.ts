import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'

export function useProgress(challengeId: string | null) {
  return useQuery({
    queryKey: ['progress', challengeId],
    queryFn: async () => {
      const { data } = await api.get('/progress', { params: { challenge_id: challengeId } })
      return data
    },
    enabled: !!challengeId,
    refetchInterval: 60000,
  })
}
