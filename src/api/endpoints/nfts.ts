import { apiClient } from '@/lib/http'
import type { Nft, NftListParams, Paginated } from '../types'

function toSearchParams(params: NftListParams): string {
  const search = new URLSearchParams()
  if (params.q) search.set('q', params.q)
  if (params.categories?.length) {
    search.set('categories', params.categories.join(','))
  }
  if (params.rarities?.length) {
    search.set('rarities', params.rarities.join(','))
  }
  if (params.minPrice) search.set('minPrice', params.minPrice)
  if (params.maxPrice) search.set('maxPrice', params.maxPrice)
  if (params.sort) search.set('sort', params.sort)
  search.set('page', String(params.page ?? 1))
  search.set('pageSize', String(params.pageSize ?? 12))
  return search.toString()
}

export const nftsApi = {
  list: (params: NftListParams, signal?: AbortSignal) =>
    apiClient.get<Paginated<Nft>>(`/nfts?${toSearchParams(params)}`, { signal }),
  detail: (id: string, signal?: AbortSignal) =>
    apiClient.get<Nft>(`/nfts/${id}`, { signal }),
  featured: (signal?: AbortSignal) =>
    apiClient.get<Nft[]>('/nfts/featured', { signal }),
}
