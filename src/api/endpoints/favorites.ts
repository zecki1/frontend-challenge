import { apiClient } from '@/lib/http'
import type { FavoritesResponse } from '../types'

export const favoritesApi = {
  list: (signal?: AbortSignal) =>
    apiClient.get<FavoritesResponse>('/favorites', { signal }),
  add: (nftId: string) =>
    apiClient.post<FavoritesResponse>(`/favorites/${nftId}`),
  remove: (nftId: string) =>
    apiClient.delete<FavoritesResponse>(`/favorites/${nftId}`),
}
