import { http } from 'msw'
import type { Cart, CartItem } from '@/api/types'
import { env } from '@/lib/env'
import { scenario } from '../config'
import {
  currentUser,
  getDb,
  getOrCreateCart,
  GUEST_CART_ID,
  persistDb,
  uid,
} from '../db'
import { findEdition, findNft } from '../quote'
import {
  applyNetworkConditions,
  getBearerToken,
  jsonError,
  jsonOk,
} from './utils'

const API = env.apiUrl

/** Carrinho é acessível a visitantes; autenticados usam o próprio id. */
function resolveOwner(request: Request): string {
  const user = currentUser(getBearerToken(request))
  return user ? user.id : GUEST_CART_ID
}

function touch(cart: Cart): void {
  cart.version += 1
  cart.updatedAt = new Date().toISOString()
  persistDb()
}

export const cartHandlers = [
  http.get(`${API}/cart`, async ({ request }) => {
    const gate = await applyNetworkConditions()
    if (gate) return gate
    const owner = resolveOwner(request)
    return jsonOk(getOrCreateCart(owner))
  }),

  http.post(`${API}/cart/items`, async ({ request }) => {
    const gate = await applyNetworkConditions()
    if (gate) return gate

    const body = (await request.json()) as {
      nftId?: string
      editionId?: string
      quantity?: number
    }

    if (!body.nftId || !body.editionId || !body.quantity || body.quantity < 1) {
      return jsonError(422, 'validation_error', 'Item inválido.')
    }

    const nft = findNft(body.nftId)
    if (!nft) return jsonError(404, 'not_found', 'NFT não encontrado.')
    const edition = findEdition(nft, body.editionId)
    if (!edition) return jsonError(404, 'edition_unavailable', 'Edição não encontrada.')
    if (edition.available <= 0) {
      return jsonError(409, 'out_of_stock', 'Edição esgotada.')
    }

    const cart = getOrCreateCart(resolveOwner(request))
    const existing = cart.items.find(
      (item) => item.nftId === body.nftId && item.editionId === body.editionId,
    )
    const desired = (existing?.quantity ?? 0) + body.quantity

    if (desired > edition.available) {
      return jsonError(
        409,
        'out_of_stock',
        `Só restam ${edition.available} unidade(s) desta edição.`,
      )
    }

    if (existing) {
      existing.quantity = desired
      existing.unitPriceEth = edition.priceEth
      existing.maxQuantity = edition.available
    } else {
      const item: CartItem = {
        id: uid('item'),
        nftId: nft.id,
        editionId: edition.id,
        name: nft.name,
        imageUrl: nft.imageUrl,
        collection: nft.collection,
        unitPriceEth: edition.priceEth,
        quantity: body.quantity,
        maxQuantity: edition.available,
      }
      cart.items.push(item)
    }
    touch(cart)
    return jsonOk(cart, 201)
  }),

  http.patch(`${API}/cart/items/:itemId`, async ({ request, params }) => {
    const gate = await applyNetworkConditions()
    if (gate) return gate

    const body = (await request.json()) as { quantity?: number }
    const cart = getOrCreateCart(resolveOwner(request))
    const item = cart.items.find((entry) => entry.id === params.itemId)
    if (!item) return jsonError(404, 'not_found', 'Item não encontrado no carrinho.')

    const nft = findNft(item.nftId)
    const edition = nft ? findEdition(nft, item.editionId) : undefined
    const available = edition?.available ?? 0

    if (!body.quantity || body.quantity < 1) {
      return jsonError(422, 'validation_error', 'Quantidade inválida.')
    }
    if (body.quantity > available) {
      return jsonError(
        409,
        'out_of_stock',
        `Só restam ${available} unidade(s) desta edição.`,
      )
    }

    item.quantity = body.quantity
    item.unitPriceEth = edition?.priceEth ?? item.unitPriceEth
    item.maxQuantity = available
    touch(cart)
    return jsonOk(cart)
  }),

  http.delete(`${API}/cart/items/:itemId`, async ({ request, params }) => {
    const gate = await applyNetworkConditions()
    if (gate) return gate
    const cart = getOrCreateCart(resolveOwner(request))
    cart.items = cart.items.filter((entry) => entry.id !== params.itemId)
    touch(cart)
    return jsonOk(cart)
  }),

  http.post(`${API}/cart/coupon`, async ({ request }) => {
    const gate = await applyNetworkConditions()
    if (gate) return gate

    const body = (await request.json()) as { code?: string }
    const code = (body.code ?? '').trim().toUpperCase()
    if (!code) return jsonError(422, 'validation_error', 'Informe um cupom.')

    const mode = scenario().couponMode
    if (mode === 'invalid') {
      return jsonError(400, 'invalid_coupon', `O cupom ${code} é inválido.`)
    }
    const seed = getDb().coupons.find((coupon) => coupon.code === code)
    const expired = seed?.expiresAt ? Date.parse(seed.expiresAt) < Date.now() : false
    if (!seed || mode === 'expired' || expired) {
      return jsonError(400, 'coupon_expired', `O cupom ${code} expirou.`)
    }

    const cart = getOrCreateCart(resolveOwner(request))
    cart.couponCode = seed.code
    touch(cart)
    return jsonOk(cart)
  }),

  http.delete(`${API}/cart/coupon`, async ({ request }) => {
    const gate = await applyNetworkConditions()
    if (gate) return gate
    const cart = getOrCreateCart(resolveOwner(request))
    cart.couponCode = null
    touch(cart)
    return jsonOk(cart)
  }),
]
