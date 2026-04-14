import { create } from 'zustand'

interface AuthState {
  token: string | null
  userId: string | null
  role: string
  setAuth: (token: string, userId: string, role?: string) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('nutriguru_token'),
  userId: localStorage.getItem('nutriguru_user_id'),
  role: localStorage.getItem('nutriguru_role') || 'user',

  setAuth: (token, userId, role = 'user') => {
    localStorage.setItem('nutriguru_token', token)
    localStorage.setItem('nutriguru_user_id', userId)
    localStorage.setItem('nutriguru_role', role)
    set({ token, userId, role })
  },

  logout: () => {
    localStorage.removeItem('nutriguru_token')
    localStorage.removeItem('nutriguru_user_id')
    localStorage.removeItem('nutriguru_role')
    set({ token: null, userId: null, role: 'user' })
  },

  isAuthenticated: () => !!get().token,
}))
