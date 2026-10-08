import type { Nft, NftCategory, NftEdition, NftRarity } from '@/api/types'

/** Arte real extraída do Figma, otimizada para WebP em 640/1280. */
const ARTWORKS = ['nft-artwork-03', 'nft-artwork-04', 'nft-artwork-05', 'nft-artwork-09'] as const

export function artworkUrl(index: number, size: 640 | 1280 = 1280): string {
  const name = ARTWORKS[index % ARTWORKS.length]
  return `/nfts/${name}-${size}.webp`
}

/** Gerador determinístico (mulberry32) — fixtures reproduzíveis. */
function createRng(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const CREATOR = { id: 'creator-nova', name: 'Nova Sato', avatarUrl: null as string | null, verified: true }

/**
 * Todas as obras do Figma, com nomes, preços e artes corretos.
 * Os NFTs gerados além destes usam nomes do Figma com variações.
 */
const FIGMA_NFTS: Array<{
  name: string
  slug: string
  price: string
  oldPrice?: string
  art: number
  collection: string
  rarity: NftRarity
  categories: NftCategory[]
  description?: string
}> = [
  { name: 'Emerald Ape #042', slug: 'emerald-ape-042', price: '1.19', art: 0, collection: 'Kurio Apes', rarity: 'rare', categories: ['art', 'collectibles'], description: 'Emerald Ape #042 é uma obra digital 1/50 finalizada à mão da coleção Kurio Editions. Cada atributo fica armazenado nos metadados do token e verificado na Ethereum. A obra explora identidade, movimento e luz em um mundo digital sem fronteiras.' },
  { name: 'Sage Nomad #009', slug: 'sage-nomad-009', price: '1.69', art: 1, collection: 'Kurio Editions', rarity: 'epic', categories: ['art'] },
  { name: 'Neon Vessel #552', slug: 'neon-vessel-552', price: '1.99', oldPrice: '2.29', art: 2, collection: 'Kurio Editions', rarity: 'legendary', categories: ['art', 'utility'] },
  { name: 'Cosmic Bloom #118', slug: 'cosmic-bloom-118', price: '1.29', art: 1, collection: 'Cosmic Drift', rarity: 'rare', categories: ['art'] },
  { name: 'Violet Nomad #314', slug: 'violet-nomad-314', price: '1.39', art: 1, collection: 'Kurio Editions', rarity: 'epic', categories: ['art', 'photography'] },
  { name: 'Ivory Baron #088', slug: 'ivory-baron-088', price: '1.79', art: 2, collection: 'Kurio Editions', rarity: 'rare', categories: ['art'] },
  { name: 'Golden Beat #207', slug: 'golden-beat-207', price: '0.99', art: 3, collection: 'Kurio Editions', rarity: 'common', categories: ['music'] },
  { name: 'Golden Signal #160', slug: 'golden-signal-160', price: '0.39', art: 3, collection: 'Kurio Editions', rarity: 'common', categories: ['music'] },
  { name: 'Golden Frequency #071', slug: 'golden-frequency-071', price: '0.59', art: 3, collection: 'Kurio Editions', rarity: 'common', categories: ['music'] },
  { name: 'Sage Nomad #009', slug: 'sage-nomad-009-2', price: '2.29', art: 1, collection: 'Kurio Editions', rarity: 'epic', categories: ['art'] },
  { name: 'Neon Vessel #552', slug: 'neon-vessel-552-2', price: '4.80', art: 2, collection: 'Kurio Editions', rarity: 'legendary', categories: ['art', 'utility'] },
  { name: 'Violet Nomad #314', slug: 'violet-nomad-314-2', price: '3.58', art: 1, collection: 'Kurio Editions', rarity: 'epic', categories: ['art', 'photography'] },
  { name: 'Ivory Baron #088', slug: 'ivory-baron-088-2', price: '4.506', art: 2, collection: 'Kurio Editions', rarity: 'rare', categories: ['art'] },
  { name: 'Golden Beat #207', slug: 'golden-beat-207-2', price: '1.98', art: 3, collection: 'Kurio Editions', rarity: 'common', categories: ['music'] },
  { name: 'Cosmic Bloom #118', slug: 'cosmic-bloom-118-2', price: '0.2286', art: 1, collection: 'Cosmic Drift', rarity: 'rare', categories: ['art'] },
  { name: 'Emerald Ape #042', slug: 'emerald-ape-042-2', price: '1.5349', art: 0, collection: 'Kurio Apes', rarity: 'rare', categories: ['art', 'collectibles'] },
  { name: 'Sage Nomad #009', slug: 'sage-nomad-009-3', price: '1.69', art: 1, collection: 'Kurio Editions', rarity: 'epic', categories: ['art'] },
  { name: 'Neon Vessel #552', slug: 'neon-vessel-552-3', price: '1.99', art: 2, collection: 'Kurio Editions', rarity: 'legendary', categories: ['art', 'utility'] },
  { name: 'Violet Nomad #314', slug: 'violet-nomad-314-3', price: '1.39', art: 1, collection: 'Kurio Editions', rarity: 'epic', categories: ['art', 'photography'] },
  { name: 'Ivory Baron #088', slug: 'ivory-baron-088-3', price: '1.79', art: 2, collection: 'Kurio Editions', rarity: 'rare', categories: ['art'] },
  { name: 'Golden Signal #160', slug: 'golden-signal-160-2', price: '0.39', art: 3, collection: 'Kurio Editions', rarity: 'common', categories: ['music'] },
  { name: 'Golden Frequency #071', slug: 'golden-frequency-071-2', price: '0.59', art: 3, collection: 'Kurio Editions', rarity: 'common', categories: ['music'] },
  { name: 'Cosmic Bloom #118', slug: 'cosmic-bloom-118-3', price: '1.29', art: 1, collection: 'Cosmic Drift', rarity: 'rare', categories: ['art'] },
  { name: 'Emerald Ape #042', slug: 'emerald-ape-042-3', price: '1.19', art: 0, collection: 'Kurio Apes', rarity: 'rare', categories: ['art', 'collectibles'] },
  { name: 'Sage Nomad #009', slug: 'sage-nomad-009-4', price: '1.69', art: 1, collection: 'Kurio Editions', rarity: 'epic', categories: ['art'] },
  { name: 'Neon Vessel #552', slug: 'neon-vessel-552-4', price: '1.99', art: 2, collection: 'Kurio Editions', rarity: 'legendary', categories: ['art', 'utility'] },
  { name: 'Violet Nomad #314', slug: 'violet-nomad-314-4', price: '1.39', art: 1, collection: 'Kurio Editions', rarity: 'epic', categories: ['art', 'photography'] },
  { name: 'Ivory Baron #088', slug: 'ivory-baron-088-4', price: '1.79', art: 2, collection: 'Kurio Editions', rarity: 'rare', categories: ['art'] },
  { name: 'Golden Beat #207', slug: 'golden-beat-207-3', price: '0.99', art: 3, collection: 'Kurio Editions', rarity: 'common', categories: ['music'] },
  { name: 'Golden Signal #160', slug: 'golden-signal-160-3', price: '0.39', art: 3, collection: 'Kurio Editions', rarity: 'common', categories: ['music'] },
  { name: 'Golden Frequency #071', slug: 'golden-frequency-071-3', price: '0.59', art: 3, collection: 'Kurio Editions', rarity: 'common', categories: ['music'] },
  { name: 'Cosmic Bloom #118', slug: 'cosmic-bloom-118-4', price: '1.29', art: 1, collection: 'Cosmic Drift', rarity: 'rare', categories: ['art'] },
  { name: 'Emerald Ape #042', slug: 'emerald-ape-042-4', price: '1.19', art: 0, collection: 'Kurio Apes', rarity: 'rare', categories: ['art', 'collectibles'] },
  { name: 'Sage Nomad #009', slug: 'sage-nomad-009-5', price: '1.69', art: 1, collection: 'Kurio Editions', rarity: 'epic', categories: ['art'] },
  { name: 'Neon Vessel #552', slug: 'neon-vessel-552-5', price: '1.99', art: 2, collection: 'Kurio Editions', rarity: 'legendary', categories: ['art', 'utility'] },
  { name: 'Violet Nomad #314', slug: 'violet-nomad-314-5', price: '1.39', art: 1, collection: 'Kurio Editions', rarity: 'epic', categories: ['art', 'photography'] },
  { name: 'Ivory Baron #088', slug: 'ivory-baron-088-5', price: '1.79', art: 2, collection: 'Kurio Editions', rarity: 'rare', categories: ['art'] },
  { name: 'Golden Beat #207', slug: 'golden-beat-207-4', price: '0.99', art: 3, collection: 'Kurio Editions', rarity: 'common', categories: ['music'] },
  { name: 'Golden Signal #160', slug: 'golden-signal-160-4', price: '0.39', art: 3, collection: 'Kurio Editions', rarity: 'common', categories: ['music'] },
  { name: 'Golden Frequency #071', slug: 'golden-frequency-071-4', price: '0.59', art: 3, collection: 'Kurio Editions', rarity: 'common', categories: ['music'] },
  { name: 'Cosmic Bloom #118', slug: 'cosmic-bloom-118-5', price: '1.29', art: 1, collection: 'Cosmic Drift', rarity: 'rare', categories: ['art'] },
  { name: 'Emerald Ape #042', slug: 'emerald-ape-042-5', price: '1.19', art: 0, collection: 'Kurio Apes', rarity: 'rare', categories: ['art', 'collectibles'] },
  { name: 'Sage Nomad #009', slug: 'sage-nomad-009-6', price: '1.69', art: 1, collection: 'Kurio Editions', rarity: 'epic', categories: ['art'] },
  { name: 'Neon Vessel #552', slug: 'neon-vessel-552-6', price: '1.99', art: 2, collection: 'Kurio Editions', rarity: 'legendary', categories: ['art', 'utility'] },
  { name: 'Violet Nomad #314', slug: 'violet-nomad-314-6', price: '1.39', art: 1, collection: 'Kurio Editions', rarity: 'epic', categories: ['art', 'photography'] },
  { name: 'Ivory Baron #088', slug: 'ivory-baron-088-6', price: '1.79', art: 2, collection: 'Kurio Editions', rarity: 'rare', categories: ['art'] },
  { name: 'Golden Beat #207', slug: 'golden-beat-207-5', price: '0.99', art: 3, collection: 'Kurio Editions', rarity: 'common', categories: ['music'] },
  { name: 'Golden Signal #160', slug: 'golden-signal-160-5', price: '0.39', art: 3, collection: 'Kurio Editions', rarity: 'common', categories: ['music'] },
  { name: 'Golden Frequency #071', slug: 'golden-frequency-071-5', price: '0.59', art: 3, collection: 'Kurio Editions', rarity: 'common', categories: ['music'] },
  { name: 'Cosmic Bloom #118', slug: 'cosmic-bloom-118-6', price: '1.29', art: 1, collection: 'Cosmic Drift', rarity: 'rare', categories: ['art'] },
]

function makeEditions(id: string, rng: () => number, basePrice: string): NftEdition[] {
  const editionCount = 1 + Math.floor(rng() * 3)
  return Array.from({ length: editionCount }, (_, i) => {
    const total = i === 0 ? 50 : 1 + Math.floor(rng() * 20)
    const available = 1 + Math.floor(rng() * total)
    const price = i === 0 ? basePrice : (Number(basePrice) * (1 + rng())).toFixed(4)
    return {
      id: `${id}-ed-${i + 1}`,
      name: i === 0 ? 'Standard' : i === 1 ? 'Deluxe' : 'Collector',
      priceEth: price,
      available,
      total,
    }
  })
}

export function buildNfts(count = 48): Nft[] {
  const base = Date.parse('2026-06-01T00:00:00.000Z')

  return Array.from({ length: count }, (_, index) => {
    const item = FIGMA_NFTS[index % FIGMA_NFTS.length]
    const id = `nft-${String(index + 1).padStart(3, '0')}`
    const rng = createRng(1000 + index)
    const editions = makeEditions(id, rng, item.price)
    const totalAvailable = editions.reduce((sum, e) => sum + e.available, 0)
    const totalSupply = editions.reduce((sum, e) => sum + e.total, 0)
    const imageUrl = artworkUrl(item.art, 1280)
    const createdAt = new Date(base - index * 3600 * 1000).toISOString()

    return {
      id,
      name: item.name,
      slug: item.slug,
      description: item.description ?? 'Obra digital única registrada em cadeia, com proveniência verificável e edições limitadas.',
      imageUrl,
      gallery: [artworkUrl(item.art, 640), artworkUrl((item.art + 1) % 4, 640)],
      collection: item.collection,
      creator: CREATOR,
      categories: item.categories,
      rarity: item.rarity,
      priceEth: item.price,
      oldPriceEth: item.oldPrice ?? null,
      editions,
      totalAvailable,
      totalSupply,
      version: 1,
      createdAt,
      updatedAt: createdAt,
    } satisfies Nft
  })
}
