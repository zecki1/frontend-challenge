import type {
  Cart,
  Nft,
  Order,
  Profile,
  User,
  Wallet,
} from '@/api/types'
import { buildNfts } from './fixtures/nfts'
import { seedUsers, type SeedUser } from './fixtures/users'
import { explorerUrl, seedNetworks } from './fixtures/networks'
import { seedCoupons, type SeedCoupon } from './fixtures/coupons'

export const GUEST_CART_ID = 'guest'
const STORAGE_KEY = 'nft-marketplace.mock-db.v1'
const PASSWORD_SALT = 'nft-mkt-demo'

export interface MockUserRecord {
  id: string
  passwordHash: string
  profile: Profile
}

export interface MockSession {
  token: string
  userId: string
  expiresAt: string
}

export interface IdempotencyRecord {
  fingerprint: string
  orderId: string | null
  status: number
  createdAt: string
}

export interface MockState {
  users: MockUserRecord[]
  sessions: MockSession[]
  nfts: Nft[]
  favorites: Record<string, string[]>
  carts: Record<string, Cart>
  wallets: Record<string, Wallet[]>
  orders: Order[]
  /** orderId -> userId (isolamento dos dados por usuário). */
  orderOwners: Record<string, string>
  idempotency: Record<string, IdempotencyRecord>
  coupons: SeedCoupon[]
}

/* ------------------------------------------------------------------ *
 * Utilitários
 * ------------------------------------------------------------------ */

export function uid(prefix: string): string {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(16).slice(2, 10)
  return `${prefix}-${random}`
}

/** Hash determinístico (djb2) apenas para não guardar senha em claro nos mocks. */
export function hashPassword(password: string): string {
  const input = `${PASSWORD_SALT}:${password}`
  let hash = 5381
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) + hash) ^ input.charCodeAt(i)
  }
  return (hash >>> 0).toString(16)
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

export function toUser(record: MockUserRecord): User {
  const { id, name, email, avatarUrl } = record.profile
  return { id, name, email, avatarUrl }
}

export function createEmptyCart(_ownerId: string): Cart {
  return {
    id: uid('cart'),
    items: [],
    couponCode: null,
    version: 1,
    updatedAt: new Date().toISOString(),
  }
}

function toProfile(user: SeedUser): Profile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    ...user.profile,
  }
}

/* ------------------------------------------------------------------ *
 * Seed
 * ------------------------------------------------------------------ */

function seedState(): MockState {
  const nfts = buildNfts()
  const now = new Date().toISOString()

  const users: MockUserRecord[] = seedUsers.map((user) => ({
    id: user.id,
    passwordHash: hashPassword(user.password),
    profile: toProfile(user),
  }))

  const wallets: Record<string, Wallet[]> = {
    'user-1': [
      {
        id: 'wallet-1',
        label: 'Carteira principal',
        address: '0xA1b2C3d4E5f60718293aBcDeF0123456789aBcDe',
        networkId: 'ethereum',
        isPrimary: true,
        createdAt: now,
      },
      {
        id: 'wallet-2',
        label: 'Polygon secundária',
        address: '0xB2c3D4e5F60718293aBcDeF0123456789aBcDeF0',
        networkId: 'polygon',
        isPrimary: false,
        createdAt: now,
      },
    ],
  }

  const orders: Order[] = [
    {
      id: 'order-seed-1',
      status: 'confirmed',
      collector: {
        name: users[0].profile.name,
        email: users[0].profile.email,
        document: '123.456.789-00',
        phone: '+55 11 90000-0001',
      },
      walletId: 'wallet-1',
      networkId: 'ethereum',
      items: [
        {
          nftId: nfts[0].id,
          editionId: nfts[0].editions[0].id,
          name: nfts[0].name,
          imageUrl: nfts[0].imageUrl,
          collection: nfts[0].collection,
          unitPriceEth: nfts[0].editions[0].priceEth,
          quantity: 1,
          lineTotalEth: nfts[0].editions[0].priceEth,
        },
      ],
      subtotalEth: nfts[0].editions[0].priceEth,
      discountEth: '0',
      networkFeeEth: '0.016',
      totalEth: (Number(nfts[0].editions[0].priceEth) + 0.016).toFixed(4),
      couponCode: null,
      txHash: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
      explorerUrl: explorerUrl(
        'ethereum',
        '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
      ),
      failureReason: null,
      version: 1,
      createdAt: now,
      updatedAt: now,
    },
  ]

  return {
    users,
    sessions: [],
    nfts,
    favorites: {
      'user-1': [nfts[0].id, nfts[4]?.id, nfts[11]?.id].filter(Boolean) as string[],
      'user-2': [],
    },
    carts: {},
    wallets,
    orders,
    orderOwners: { 'order-seed-1': 'user-1' },
    idempotency: {},
    coupons: seedCoupons,
  }
}

/* ------------------------------------------------------------------ *
 * Persistência
 * ------------------------------------------------------------------ */

let state: MockState | null = null

function readFromStorage(): MockState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as MockState) : null
  } catch {
    return null
  }
}

export function getDb(): MockState {
  if (state) return state
  state = readFromStorage() ?? seedState()
  persistDb()
  return state
}

export function persistDb(): void {
  if (!state) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* storage indisponível — mantém apenas em memória */
  }
}

/** Restaura integralmente o cenário semente conhecido. */
export function resetDb(): void {
  state = seedState()
  persistDb()
}

export function findSession(token: string | null): MockSession | null {
  if (!token) return null
  const db = getDb()
  return db.sessions.find((session) => session.token === token) ?? null
}

export function findUserById(id: string): MockUserRecord | null {
  return getDb().users.find((user) => user.id === id) ?? null
}

export function currentUser(token: string | null): MockUserRecord | null {
  const session = findSession(token)
  if (!session) return null
  return findUserById(session.userId)
}

export function getOrCreateCart(ownerId: string): Cart {
  const db = getDb()
  if (!db.carts[ownerId]) {
    db.carts[ownerId] = createEmptyCart(ownerId)
    persistDb()
  }
  return db.carts[ownerId]
}

export function walletsFor(userId: string): Wallet[] {
  const db = getDb()
  if (!db.wallets[userId]) {
    db.wallets[userId] = []
    persistDb()
  }
  return db.wallets[userId]
}

export { seedNetworks }
