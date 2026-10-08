import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './api-error'

const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504])

/**
 * Política de retry: falhas transitórias de rede e respostas 5xx merecem nova
 * tentativa; erros de validação/permissão (4xx) não. Documentada em
 * ARCHITECTURE.md > "Estratégia de cache".
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= 3) return false
  if (ApiError.isApiError(error)) {
    if (error.status === 0) return true
    return RETRYABLE_STATUS.has(error.status)
  }
  return false
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: shouldRetry,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8_000),
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})

/** Reseta o cache privado em logout/troca de usuário. */
export function resetQueryClient(): void {
  queryClient.clear()
}
