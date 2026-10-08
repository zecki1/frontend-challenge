/**
 * Contratos REST e de tempo real do NFT Marketplace.
 *
 * Este arquivo é a fonte de verdade dos tipos compartilhados entre transporte
 * (Axios), mocks (MSW) e interface (React). Nenhum DTO de rede deve ser
 * declarado fora daqui.
 */

/* ------------------------------------------------------------------ *
 * Erros
 * ------------------------------------------------------------------ */

export type ApiErrorCode =
  | 'validation_error'
  | 'invalid_credentials'
  | 'email_conflict'
  | 'unauthenticated'
  | 'session_expired'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'out_of_stock'
  | 'edition_unavailable'
  | 'invalid_coupon'
  | 'coupon_expired'
  | 'price_changed'
  | 'quote_expired'
  | 'payment_declined'
  | 'idempotency_conflict'
  | 'transient_error'
  | 'network_error'

export interface ApiErrorBody {
  code: ApiErrorCode
  message: string
  /** Erros de validação por campo (chave = nome do campo). */
  details?: Record<string, string[]> | null
  requestId?: string
}

/* ------------------------------------------------------------------ *
 * Sessão e conta
 * ------------------------------------------------------------------ */

export interface User {
  id: string
  name: string
  email: string
  avatarUrl: string | null
}

export interface Session {
  user: User
  token: string
  expiresAt: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

/* ------------------------------------------------------------------ *
 * Perfil
 * ------------------------------------------------------------------ */

export interface Profile extends User {
  document: string | null
  phone: string | null
  bio: string | null
}

export interface UpdateProfilePayload {
  name?: string
  email?: string
  document?: string | null
  phone?: string | null
  bio?: string | null
  avatarUrl?: string | null
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

/* ------------------------------------------------------------------ *
 * Carteiras e redes
 * ------------------------------------------------------------------ */

export type NetworkId = 'ethereum' | 'polygon' | 'base'

export interface Network {
  id: NetworkId
  name: string
  symbol: string
  explorerUrlTemplate: string
}

export interface Wallet {
  id: string
  label: string
  address: string
  networkId: NetworkId
  isPrimary: boolean
  createdAt: string
}

export interface WalletPayload {
  label: string
  address: string
  networkId: NetworkId
  isPrimary?: boolean
}

/* ------------------------------------------------------------------ *
 * NFTs
 * ------------------------------------------------------------------ */

export type NftCategory =
  | 'art'
  | 'collectibles'
  | 'music'
  | 'photography'
  | 'sports'
  | 'utility'
  | '3d-art'
  | 'generative'
  | 'memberships'

export type NftRarity = 'common' | 'rare' | 'epic' | 'legendary'

export type NftSort =
  | 'recent'
  | 'price-asc'
  | 'price-desc'
  | 'name-asc'
  | 'name-desc'
  | 'rarity'

export interface NftCreator {
  id: string
  name: string
  avatarUrl: string | null
  verified: boolean
}

export interface NftEdition {
  id: string
  name: string
  priceEth: string
  available: number
  total: number
}

export interface Nft {
  id: string
  name: string
  slug: string
  description: string
  imageUrl: string
  gallery: string[]
  collection: string
  creator: NftCreator
  categories: NftCategory[]
  rarity: NftRarity
  priceEth: string
  oldPriceEth?: string | null
  editions: NftEdition[]
  totalAvailable: number
  totalSupply: number
  version: number
  createdAt: string
  updatedAt: string
}

export interface NftListParams {
  q?: string
  categories?: NftCategory[]
  rarities?: NftRarity[]
  minPrice?: string
  maxPrice?: string
  sort?: NftSort
  page?: number
  pageSize?: number
}

export interface Paginated<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

/* ------------------------------------------------------------------ *
 * Favoritos
 * ------------------------------------------------------------------ */

export interface FavoritesResponse {
  nftIds: string[]
}

/* ------------------------------------------------------------------ *
 * Carrinho
 * ------------------------------------------------------------------ */

export interface CartItem {
  id: string
  nftId: string
  editionId: string
  name: string
  imageUrl: string
  collection: string
  unitPriceEth: string
  quantity: number
  maxQuantity: number
}

export interface Cart {
  id: string
  items: CartItem[]
  couponCode: string | null
  version: number
  updatedAt: string
}

export interface AddCartItemPayload {
  nftId: string
  editionId: string
  quantity: number
}

export interface UpdateCartItemPayload {
  quantity: number
}

export interface ApplyCouponPayload {
  code: string
}

/* ------------------------------------------------------------------ *
 * Cotação
 * ------------------------------------------------------------------ */

export interface Coupon {
  code: string
  percentOff: number
}

export interface QuoteLine {
  cartItemId: string
  nftId: string
  editionId: string
  name: string
  imageUrl: string
  unitPriceEth: string
  quantity: number
  lineTotalEth: string
}

export type QuoteChangeReason =
  | 'price_changed'
  | 'out_of_stock'
  | 'edition_unavailable'
  | 'coupon_invalid'
  | 'coupon_expired'

export interface QuoteChange {
  cartItemId: string | null
  reason: QuoteChangeReason
  message: string
}

export interface Quote {
  id: string
  currency: 'ETH'
  lines: QuoteLine[]
  subtotalEth: string
  discountEth: string
  networkFeeEth: string
  totalEth: string
  coupon: Coupon | null
  changes: QuoteChange[]
  version: number
  expiresAt: string
}

/* ------------------------------------------------------------------ *
 * Pedidos
 * ------------------------------------------------------------------ */

export type OrderStatus = 'pending' | 'confirmed' | 'rejected'

export interface CollectorInfo {
  name: string
  email: string
  document: string
  phone: string | null
}

export interface OrderItemSnapshot {
  nftId: string
  editionId: string
  name: string
  imageUrl: string
  collection: string
  unitPriceEth: string
  quantity: number
  lineTotalEth: string
}

export interface Order {
  id: string
  status: OrderStatus
  collector: CollectorInfo
  walletId: string
  networkId: NetworkId
  items: OrderItemSnapshot[]
  subtotalEth: string
  discountEth: string
  networkFeeEth: string
  totalEth: string
  couponCode: string | null
  txHash: string | null
  explorerUrl: string | null
  failureReason: string | null
  version: number
  createdAt: string
  updatedAt: string
}

export interface CreateOrderPayload {
  collector: CollectorInfo
  walletId: string
  networkId: NetworkId
  quoteId: string
  /** Cópia do total validado; se divergir da cotação, exige nova confirmação. */
  expectedTotalEth: string
}

export interface IdempotentRequest {
  /** Chave de idempotência (cabeçalho `Idempotency-Key`). */
  idempotencyKey: string
}

/* ------------------------------------------------------------------ *
 * Tempo real (Socket.IO)
 * ------------------------------------------------------------------ */

export interface RealtimeMeta {
  /** Identidade estável do evento — permite descartar duplicatas. */
  eventId: string
  resource: string
  resourceId: string
  /** Versão monotônica do recurso; eventos antigos devem ser ignorados. */
  version: number
  occurredAt: string
}

export interface NftUpdatedEvent extends RealtimeMeta {
  resource: 'nft'
  priceEth: string
  totalAvailable: number
  editions: NftEdition[]
}

export interface OrderUpdatedEvent extends RealtimeMeta {
  resource: 'order'
  status: OrderStatus
  txHash: string | null
  failureReason: string | null
}

export interface ServerToClientEvents {
  'nft.updated': (payload: NftUpdatedEvent) => void
  'order.updated': (payload: OrderUpdatedEvent) => void
}

export interface ClientToServerEvents {
  subscribe: (payload: { topics: string[] }) => void
  unsubscribe: (payload: { topics: string[] }) => void
}
