import { redirect } from '@tanstack/react-router'
import { sessionToken } from '@/lib/session-token'

/**
 * Guarda de rota para fluxos privados (checkout, perfil, carteiras, pedidos).
 * Preserva o destino em `redirect` para retomar o fluxo após o login.
 */
export function requireAuthBeforeLoad(): void {
  if (!sessionToken.get()) {
    throw redirect({ to: '/login' })
  }
}
