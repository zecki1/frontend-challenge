import { useCallback, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  queryKeys,
  sessionApi,
  type LoginPayload,
  type RegisterPayload,
  type Session,
} from '@/api'
import { AUTH_EXPIRED_EVENT } from '@/lib/http'
import { sessionToken } from '@/lib/session-token'
import { AuthContext, type AuthContextValue } from './auth-context'
import { useMswReady } from '@/lib/msw-ready'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const mswReady = useMswReady()

  const sessionQuery = useQuery({
    queryKey: queryKeys.session,
    queryFn: ({ signal }) => sessionApi.me(signal),
    enabled: mswReady && Boolean(sessionToken.get()),
    retry: false,
    staleTime: 5 * 60_000,
  })

  /**
   * Ao autenticar trocamos totalmente o cache: garante que dados privados do
   * usuário anterior não vazem para o novo.
   */
  const applySession = useCallback(
    (session: Session) => {
      sessionToken.set(session.token)
      queryClient.clear()
      queryClient.setQueryData(queryKeys.session, session)
      void queryClient.invalidateQueries()
    },
    [queryClient],
  )

  const clearSession = useCallback(() => {
    sessionToken.clear()
    queryClient.clear()
  }, [queryClient])

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => sessionApi.login(payload),
    onSuccess: applySession,
  })

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => sessionApi.register(payload),
    onSuccess: applySession,
  })

  const logout = useCallback(async () => {
    try {
      await sessionApi.logout()
    } catch {
      /* logout local mesmo se a API falhar - intentional no-op */
    }
    clearSession()
    if (typeof window !== 'undefined') {
      try { window.dispatchEvent(new Event('kurio:auth-logout')) } catch { /* no-op */ }
    }
  }, [clearSession])

  useEffect(() => {
    const handler = () => clearSession()
    window.addEventListener(AUTH_EXPIRED_EVENT, handler)
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handler)
  }, [clearSession])

  const value = useMemo<AuthContextValue>(
    () => ({
      session: sessionQuery.data ?? null,
      isLoading: sessionQuery.isLoading,
      isAuthenticated: Boolean(sessionQuery.data),
      login: (payload) => loginMutation.mutateAsync(payload),
      register: (payload) => registerMutation.mutateAsync(payload),
      logout,
    }),
    [sessionQuery.data, sessionQuery.isLoading, loginMutation, registerMutation, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
