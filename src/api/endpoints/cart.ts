import { apiClient } from '@/lib/http'
import type {
  AddCartItemPayload,
  ApplyCouponPayload,
  Cart,
  UpdateCartItemPayload,
} from '../types'

export const cartApi = {
  get: (signal?: AbortSignal) =>
    apiClient.get<Cart>('/cart', { signal }),
  addItem: (payload: AddCartItemPayload) =>
    apiClient.post<Cart>('/cart/items', payload),
  updateItem: (itemId: string, payload: UpdateCartItemPayload) =>
    apiClient.patch<Cart>(`/cart/items/${itemId}`, payload),
  removeItem: (itemId: string) =>
    apiClient.delete<Cart>(`/cart/items/${itemId}`),
  applyCoupon: (payload: ApplyCouponPayload) =>
    apiClient.post<Cart>('/cart/coupon', payload),
  removeCoupon: () => apiClient.delete<Cart>('/cart/coupon'),
}
