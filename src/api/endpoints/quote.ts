import { apiClient } from '@/lib/http'
import type { Quote } from '../types'

export const quoteApi = {
  get: (signal?: AbortSignal) =>
    apiClient.get<Quote>('/quote', { signal }),
  /** Revalida a cotação contra o estado atual do carrinho/preços. */
  revalidate: (signal?: AbortSignal) =>
    apiClient.post<Quote>('/quote/revalidate', undefined, { signal }),
}
