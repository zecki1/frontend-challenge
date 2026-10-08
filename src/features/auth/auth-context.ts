import { createContext, useContext } from 'react'
import type { LoginPayload, RegisterPayload, Session } from '@/api'

export interface AuthContextValue {
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<Session>
  register: (payload: RegisterPayload) => Promise<Session>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>.')
  }
  return context
}
