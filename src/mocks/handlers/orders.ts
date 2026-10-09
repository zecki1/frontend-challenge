import { HttpResponse, http } from 'msw'
import type { CreateOrderPayload, Order, OrderItemSnapshot } from '@/api/types'
import { env } from '@/lib/env'
import { scenario } from '../config'
import { getDb, getOrCreateCart, persistDb, recordActivity, uid, walletsFor } from '../db'
import { explorerUrl } from '../fixtures/networks'
import { buildQuote } from '../quote'
import { broadcastNftUpdated, broadcastOrderUpdated } from '../socket'
import {
  applyNetworkConditions,
  jsonError,
  jsonOk,
  requireUser,
} from './utils'

const API = env.apiUrl
const SETTLE_DELAY_MS = 1_000

function txHash(): string {
  const bytes = Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, '0'),
  )
  return `0x${bytes.join('')}`
}

/**
 * Transição terminal de um pedido pendente. Pedidos confirmados/recusados são
 * terminais e não regridem. Emite `order.updated` e reconcilia catálogo/carrinho.
 */
function settleOrder(orderId: string, outcome: 'confirm' | 'reject'): void {
  const db = getDb()
  const order = db.orders.find((entry) => entry.id === orderId)
  if (!order || order.status !== 'pending') return

  const now = new Date().toISOString()
  if (outcome === 'confirm') {
    order.status = 'confirmed'
    order.txHash = txHash()
    order.explorerUrl = explorerUrl(order.networkId, order.txHash)

    for (const item of order.items) {
      const nft = db.nfts.find((entry) => entry.id === item.nftId)
      if (!nft) continue
      const edition = nft.editions.find((entry) => entry.id === item.editionId)
      if (edition) edition.available = Math.max(0, edition.available - item.quantity)
      nft.totalAvailable = Math.max(0, nft.totalAvailable - item.quantity)
      nft.version += 1
      nft.updatedAt = now
      broadcastNftUpdated({
        eventId: uid('evt'),
        resource: 'nft',
        resourceId: nft.id,
        version: nft.version,
        occurredAt: now,
        priceEth: nft.priceEth,
        totalAvailable: nft.totalAvailable,
        editions: nft.editions,
      })
    }

    const ownerId = db.orderOwners[orderId]
    const cart = ownerId ? db.carts[ownerId] : undefined
    if (cart) {
      for (const item of order.items) {
        const entry = cart.items.find(
          (line) => line.nftId === item.nftId && line.editionId === item.editionId,
        )
        if (!entry) continue
        entry.quantity -= item.quantity
        if (entry.quantity <= 0) {
          cart.items = cart.items.filter((line) => line.id !== entry.id)
        }
      }
      cart.couponCode = null
      cart.version += 1
      cart.updatedAt = now
    }
    // Atividade: registra a compra dos NFTs deste pedido
    if (ownerId) {
      for (const item of order.items) recordActivity(ownerId, item.nftId, 'buy')
    }
  } else {
    order.status = 'rejected'
    order.failureReason = 'Pagamento recusado pela carteira simulada.'
  }

  order.updatedAt = now
  order.version += 1
  persistDb()

  broadcastOrderUpdated({
    eventId: uid('evt'),
    resource: 'order',
    resourceId: order.id,
    version: order.version,
    occurredAt: now,
    status: order.status,
    txHash: order.txHash,
    failureReason: order.failureReason,
  })
}

export const orderHandlers = [
  http.get(`${API}/orders`, async ({ request }) => {
    const gate = await applyNetworkConditions()
    if (gate) return gate
    const user = requireUser(request)
    if (user instanceof Response) return user
    const db = getDb()
    const orders = db.orders
      .filter((order) => db.orderOwners[order.id] === user.id)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    return jsonOk(orders)
  }),

  http.get(`${API}/orders/:id`, async ({ request, params }) => {
    const gate = await applyNetworkConditions()
    if (gate) return gate
    const user = requireUser(request)
    if (user instanceof Response) return user
    const db = getDb()
    const order = db.orders.find((entry) => entry.id === params.id)
    if (!order) return jsonError(404, 'not_found', 'Pedido não encontrado.')
    if (db.orderOwners[order.id] !== user.id) {
      return jsonError(403, 'forbidden', 'Você não tem acesso a este pedido.')
    }
    return jsonOk(order)
  }),

  http.post(`${API}/orders`, async ({ request }) => {
    const gate = await applyNetworkConditions()
    if (gate) return gate
    const user = requireUser(request)
    if (user instanceof Response) return user

    const idempotencyKey = request.headers.get('Idempotency-Key')
    if (!idempotencyKey) {
      return jsonError(422, 'validation_error', 'Cabeçalho Idempotency-Key é obrigatório.')
    }

    const payload = (await request.json()) as CreateOrderPayload
    const fingerprint = JSON.stringify(payload)
    const key = `${user.id}:${idempotencyKey}`
    const db = getDb()

    const existing = db.idempotency[key]
    if (existing) {
      if (existing.fingerprint !== fingerprint) {
        return jsonError(
          409,
          'idempotency_conflict',
          'Chave de idempotência reutilizada com conteúdo diferente.',
        )
      }
      const order = db.orders.find((entry) => entry.id === existing.orderId)
      if (order) return jsonOk(order)
    }

    if (!payload.collector?.name || !payload.collector?.email) {
      return jsonError(422, 'validation_error', 'Dados do colecionador incompletos.', {
        name: ['Informe o nome.'],
      })
    }

    const wallet = walletsFor(user.id).find((entry) => entry.id === payload.walletId)
    if (!wallet) {
      return jsonError(422, 'validation_error', 'Selecione uma carteira válida.', {
        walletId: ['Carteira inválida.'],
      })
    }

    const cart = getOrCreateCart(user.id)
    const quote = buildQuote(cart)

    if (quote.changes.length > 0) {
      const code = quote.changes.some((change) => change.reason === 'price_changed')
        ? 'price_changed'
        : 'out_of_stock'
      return jsonError(
        409,
        code,
        'A cotação mudou. Revise os valores e confirme novamente.',
        { changes: quote.changes.map((change) => change.message) },
      )
    }

    if (payload.expectedTotalEth !== quote.totalEth) {
      return jsonError(
        409,
        'price_changed',
        'O total mudou. Revise os valores e confirme novamente.',
      )
    }

    const now = new Date().toISOString()
    const items: OrderItemSnapshot[] = quote.lines.map((line) => ({
      nftId: line.nftId,
      editionId: line.editionId,
      name: line.name,
      imageUrl: line.imageUrl,
      collection:
        db.nfts.find((nft) => nft.id === line.nftId)?.collection ?? 'Coleção',
      unitPriceEth: line.unitPriceEth,
      quantity: line.quantity,
      lineTotalEth: line.lineTotalEth,
    }))

    const order: Order = {
      id: uid('order'),
      status: 'pending',
      collector: payload.collector,
      walletId: wallet.id,
      networkId: payload.networkId,
      items,
      subtotalEth: quote.subtotalEth,
      discountEth: quote.discountEth,
      networkFeeEth: quote.networkFeeEth,
      totalEth: quote.totalEth,
      couponCode: quote.coupon?.code ?? null,
      txHash: null,
      explorerUrl: null,
      failureReason: null,
      version: 1,
      createdAt: now,
      updatedAt: now,
    }

    db.orders.push(order)
    db.orderOwners[order.id] = user.id
    db.idempotency[key] = {
      fingerprint,
      orderId: order.id,
      status: 201,
      createdAt: now,
    }
    persistDb()

    const outcome = scenario().orderOutcome
    setTimeout(
      () => settleOrder(order.id, outcome === 'decline' ? 'reject' : 'confirm'),
      SETTLE_DELAY_MS,
    )

    if (outcome === 'timeout-after-create') {
      // O pedido foi criado, mas a resposta "se perde": o cliente deve
      // recuperá-lo via idempotência (retry com a mesma chave).
      return HttpResponse.error()
    }

    return jsonOk(order, 201)
  }),
]
