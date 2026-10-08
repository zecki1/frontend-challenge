import { redirect } from '@tanstack/react-router'
import { sessionToken } from '@/lib/session-token'

/**
 * Guarda de rota para fluxos privados (checkout, perfil, carteiras, pedidos,
 * favoritos). Uso: `beforeLoad: requireAuthBeforeLoad`.
 * Preserva o destino em `?redirect=` para retomar o fluxo após o login.
 */
export function requireAuthBeforeLoad({ location }: { location: { pathname: string } }): void {
  if (!sessionToken.get()) {
    throw redirect({ to: '/login', search: { redirect: location.pathname } })
  }
}
