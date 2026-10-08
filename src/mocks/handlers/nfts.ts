import { http } from 'msw'
import type { Nft, NftCategory, NftRarity, NftSort, Paginated } from '@/api/types'
import { compareEth } from '@/lib/decimal'
import { env } from '@/lib/env'
import { getDb } from '../db'
import { scenario } from '../config'
import { applyNetworkConditions, jsonError, jsonOk } from './utils'

const API = env.apiUrl

const RARITY_RANK: Record<NftRarity, number> = {
  common: 0,
  rare: 1,
  epic: 2,
  legendary: 3,
}

function parseList(value: string | null): string[] {
  return value ? value.split(',').filter(Boolean) : []
}

function sortNfts(nfts: Nft[], sort: NftSort): Nft[] {
  const sorted = [...nfts]
  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => compareEth(a.priceEth, b.priceEth))
    case 'price-desc':
      return sorted.sort((a, b) => compareEth(b.priceEth, a.priceEth))
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name, 'pt-BR'))
    case 'rarity':
      return sorted.sort(
        (a, b) => RARITY_RANK[b.rarity] - RARITY_RANK[a.rarity],
      )
    case 'recent':
    default:
      return sorted.sort(
        (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
      )
  }
}

export const nftHandlers = [
  // Deve vir antes de `/nfts/:id` para não capturar "featured".
  http.get(`${API}/nfts/featured`, async ({ request }) => {
    const gate = await applyNetworkConditions()
    if (gate) return gate
    if (scenario().emptyCatalog) return jsonOk<Nft[]>([])
    const db = getDb()
    const featured = [...db.nfts]
      .sort((a, b) => b.totalSupply - a.totalSupply)
      .slice(0, 6)
    void request
    return jsonOk(featured)
  }),

  http.get(`${API}/nfts`, async ({ request }) => {
    const gate = await applyNetworkConditions()
    if (gate) return gate
    if (scenario().emptyCatalog) {
      return jsonOk<Paginated<Nft>>({
        items: [],
        page: 1,
        pageSize: 12,
        total: 0,
        totalPages: 0,
      })
    }

    const url = new URL(request.url)
    const q = (url.searchParams.get('q') ?? '').trim().toLowerCase()
    const categories = parseList(url.searchParams.get('categories')) as NftCategory[]
    const rarities = parseList(url.searchParams.get('rarities')) as NftRarity[]
    const minPrice = url.searchParams.get('minPrice')
    const maxPrice = url.searchParams.get('maxPrice')
    const sort = (url.searchParams.get('sort') ?? 'recent') as NftSort
    const page = Math.max(1, Number(url.searchParams.get('page') ?? 1))
    const pageSize = Math.min(48, Math.max(1, Number(url.searchParams.get('pageSize') ?? 12)))

    let items = getDb().nfts

    if (q) {
      items = items.filter(
        (nft) =>
          nft.name.toLowerCase().includes(q) ||
          nft.collection.toLowerCase().includes(q) ||
          nft.creator.name.toLowerCase().includes(q),
      )
    }
    if (categories.length) {
      items = items.filter((nft) =>
        nft.categories.some((category) => categories.includes(category)),
      )
    }
    if (rarities.length) {
      items = items.filter((nft) => rarities.includes(nft.rarity))
    }
    if (minPrice) {
      items = items.filter((nft) => compareEth(nft.priceEth, minPrice) >= 0)
    }
    if (maxPrice) {
      items = items.filter((nft) => compareEth(nft.priceEth, maxPrice) <= 0)
    }

    const sorted = sortNfts(items, sort)
    const total = sorted.length
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const start = (page - 1) * pageSize
    const paginated: Paginated<Nft> = {
      items: sorted.slice(start, start + pageSize),
      page,
      pageSize,
      total,
      totalPages,
    }
    return jsonOk(paginated)
  }),

  http.get(`${API}/nfts/:id`, async ({ params }) => {
    const gate = await applyNetworkConditions()
    if (gate) return gate
    const nft = getDb().nfts.find((item) => item.id === params.id)
    if (!nft) {
      return jsonError(404, 'not_found', 'NFT não encontrado.')
    }
    return jsonOk(nft)
  }),
]
