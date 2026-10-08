import { http } from 'msw'
import type { LoginPayload, RegisterPayload, Session } from '@/api/types'
import { env } from '@/lib/env'
import {
  createEmptyCart,
  getDb,
  GUEST_CART_ID,
  hashPassword,
  persistDb,
  toUser,
  uid,
  verifyPassword,
  type MockUserRecord,
} from '../db'
import { applyNetworkConditions, getBearerToken, jsonError, jsonOk, requireUser } from './utils'

const API = env.apiUrl
const SESSION_TTL_MS = 8 * 60 * 60 * 1000

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function mergeGuestCart(userId: string): void {
  const db = getDb()
  const guest = db.carts[GUEST_CART_ID]
  if (!guest || guest.items.length === 0) {
    delete db.carts[GUEST_CART_ID]
    return
  }
  const userCart = db.carts[userId] ?? createEmptyCart(userId)
  for (const item of guest.items) {
    const existing = userCart.items.find(
      (entry) => entry.nftId === item.nftId && entry.editionId === item.editionId,
    )
    if (existing) {
      existing.quantity = Math.min(
        existing.quantity + item.quantity,
        existing.maxQuantity,
      )
    } else {
      userCart.items.push(item)
    }
  }
  userCart.couponCode = userCart.couponCode ?? guest.couponCode
  userCart.version += 1
  userCart.updatedAt = new Date().toISOString()
  db.carts[userId] = userCart
  delete db.carts[GUEST_CART_ID]
  persistDb()
}

function createSession(user: MockUserRecord): Session {
  const db = getDb()
  const token = uid('tok')
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString()
  db.sessions.push({ token, userId: user.id, expiresAt })
  persistDb()
  return { user: toUser(user), token, expiresAt }
}

export const authHandlers = [
  http.post(`${API}/auth/register`, async ({ request }) => {
    const gate = await applyNetworkConditions()
    if (gate) return gate

    const body = (await request.json()) as Partial<RegisterPayload>
    const details: Record<string, string[]> = {}
    if (!body.name || body.name.trim().length < 2) {
      details.name = ['Informe um nome com pelo menos 2 caracteres.']
    }
    if (!body.email || !EMAIL_RE.test(body.email)) {
      details.email = ['Informe um e-mail válido.']
    }
    if (!body.password || body.password.length < 8) {
      details.password = ['A senha deve ter pelo menos 8 caracteres.']
    }
    if (Object.keys(details).length > 0) {
      return jsonError(422, 'validation_error', 'Verifique os campos.', details)
    }

    const db = getDb()
    if (db.users.some((user) => user.profile.email.toLowerCase() === body.email!.toLowerCase())) {
      return jsonError(409, 'email_conflict', 'Este e-mail já está cadastrado.', {
        email: ['Este e-mail já está cadastrado.'],
      })
    }

    const record: MockUserRecord = {
      id: uid('user'),
      passwordHash: hashPassword(body.password!),
      profile: {
        id: '',
        name: body.name!.trim(),
        email: body.email!.toLowerCase(),
        avatarUrl: null,
        document: null,
        phone: null,
        bio: null,
      },
    }
    record.profile.id = record.id
    db.users.push(record)
    persistDb()
    mergeGuestCart(record.id)

    return jsonOk(createSession(record), 201)
  }),

  http.post(`${API}/auth/login`, async ({ request }) => {
    const gate = await applyNetworkConditions()
    if (gate) return gate

    const body = (await request.json()) as Partial<LoginPayload>
    const db = getDb()
    const user = db.users.find(
      (item) => item.profile.email.toLowerCase() === (body.email ?? '').toLowerCase(),
    )
    if (!user || !body.password || !verifyPassword(body.password, user.passwordHash)) {
      return jsonError(401, 'invalid_credentials', 'E-mail ou senha inválidos.')
    }

    mergeGuestCart(user.id)
    return jsonOk(createSession(user))
  }),

  http.post(`${API}/auth/social/:provider`, async ({ params }) => {
    const gate = await applyNetworkConditions()
    if (gate) return gate

    const provider = params.provider
    if (provider !== 'google' && provider !== 'facebook') {
      return jsonError(422, 'validation_error', 'Provedor inválido.')
    }

    const db = getDb()
    const email = provider === 'google' ? 'collector@example.com' : 'leo@example.com'
    const user = db.users.find(
      (item) => item.profile.email.toLowerCase() === email,
    )
    if (!user) {
      return jsonError(401, 'invalid_credentials', 'Conta não encontrada para este provedor.')
    }

    mergeGuestCart(user.id)
    return jsonOk(createSession(user))
  }),

  http.get(`${API}/auth/session`, ({ request }) => {
    const result = requireUser(request)
    if (result instanceof Response) return result
    const session = getDb().sessions.find(
      (item) => item.token === getBearerToken(request),
    )
    if (!session) {
      return jsonError(401, 'session_expired', 'Sua sessão expirou. Entre novamente.')
    }
    return jsonOk<Session>({
      user: toUser(result),
      token: session.token,
      expiresAt: session.expiresAt,
    })
  }),

  http.post(`${API}/auth/logout`, ({ request }) => {
    const db = getDb()
    const token = getBearerToken(request)
    db.sessions = db.sessions.filter((session) => session.token !== token)
    persistDb()
    return new Response(null, { status: 204 })
  }),
]
