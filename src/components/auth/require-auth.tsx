import { useEffect } from 'react'
import { useNavigate, useLocation } from '@tanstack/react-router'
import { useAuth } from '@/features/auth/auth-context'

/**
 * Guarda de rota para fluxos privados. Redireciona para o login preservando
 * o destino em `?redirect=` para retomada após autenticação.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      void navigate({ to: '/login', search: { redirect: location.pathname } })
    }
  }, [isLoading, isAuthenticated, navigate, location.pathname])

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-kurio-copper border-t-transparent motion-reduce:animate-none" />
      </div>
    )
  }

  return <>{children}</>
}
