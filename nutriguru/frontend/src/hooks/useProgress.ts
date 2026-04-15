import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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

export function useLogProgress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      challenge_id: string
      entry_date: string
      actual_weight_kg: number
      calories_consumed: number
      meals_completed: Record<string, boolean>
    }) => {
      const { data } = await api.post('/progress', payload)
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['progress', variables.challenge_id] })
    },
  })
}
