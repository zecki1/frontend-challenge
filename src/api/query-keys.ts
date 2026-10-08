import type { NftListParams } from './types'

/**
 * Fábrica central de chaves de cache do TanStack Query.
 *
 * Isolar as chaves evita invalidações amplas demais e mantém o isolamento por
 * usuário/parâmetros exigido pelo desafio.
 */
export const queryKeys = {
  session: ['session'] as const,
  profile: ['profile'] as const,
  wallets: ['wallets'] as const,
  networks: ['networks'] as const,
  favorites: ['favorites'] as const,
  nfts: {
    all: ['nfts'] as const,
    list: (params: NftListParams) => ['nfts', 'list', params] as const,
    detail: (id: string) => ['nfts', 'detail', id] as const,
  },
  cart: ['cart'] as const,
  quote: (params: { couponCode?: string | null }) =>
    ['quote', params] as const,
  orders: {
    all: ['orders'] as const,
    detail: (id: string) => ['orders', 'detail', id] as const,
  },
}
