import { useMutation } from '@tanstack/react-query'
import api from '../lib/api'

interface ChatPayload {
  message: string
  session_id: string
  history: { role: string; content: string }[]
}

export function useChat() {
  return useMutation({
    mutationFn: async (payload: ChatPayload) => {
      const { data } = await api.post('/chat', payload)
      return data
    },
  })
}
