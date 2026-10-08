import { apiClient } from '@/lib/http'
import type { CreateOrderPayload, Order } from '../types'

export const ordersApi = {
  /**
   * Criação idempotente: a mesma `idempotencyKey` com o mesmo conteúdo recupera
   * o mesmo pedido; reutilizá-la com conteúdo diferente gera conflito.
   */
  create: (
    payload: CreateOrderPayload,
    idempotencyKey: string,
    signal?: AbortSignal,
  ) =>
    apiClient.post<Order>('/orders', payload, {
      signal,
      headers: { 'Idempotency-Key': idempotencyKey },
    }),
  get: (id: string, signal?: AbortSignal) =>
    apiClient.get<Order>(`/orders/${id}`, { signal }),
  list: (signal?: AbortSignal) =>
    apiClient.get<Order[]>('/orders', { signal }),
}
