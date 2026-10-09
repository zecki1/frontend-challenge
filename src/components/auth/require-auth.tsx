import { useEffect } from 'react'
import { useNavigate, useLocation } from '@tanstack/react-router'
import { useAuth } from '@/features/auth/auth-context'
import { useMswReady } from '@/lib/msw-ready'

/**
 * Guarda de rota para fluxos privados. Redireciona para o login preservando
 * o destino em `?redirect=` para retomada após autenticação.
 *
 * Aguarda o MSW estar pronto antes de redirecionar: evita redirecionar
 * usuário logado em reload antes do boot do mock.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const mswReady = useMswReady()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (mswReady && !isLoading && !isAuthenticated) {
      void navigate({ to: '/login', search: { redirect: location.pathname } })
    }
  }, [mswReady, isLoading, isAuthenticated, navigate, location.pathname])

  if (!mswReady || isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-kurio-copper border-t-transparent motion-reduce:animate-none" />
      </div>
    )
  }

  return <>{children}</>
}
