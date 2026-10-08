import { http } from 'msw'
import type { NftUpdatedEvent, OrderStatus, OrderUpdatedEvent } from '@/api/types'
import { mulEth } from '@/lib/decimal'
import { mockConfig, scenario } from '../config'
import { getDb, persistDb, resetDb, uid } from '../db'
import { explorerUrl } from '../fixtures/networks'
import { scenarios } from '../scenarios'
import { broadcastNftUpdated, broadcastOrderUpdated } from '../socket'
import { jsonError, jsonOk } from './utils'

/**
 * Endpoints de controle dos mocks (`/__mocks__/*`). Não passam por latência nem
 * por simulação de falhas: servem para configurar o ambiente durante
 * desenvolvimento e testes (seleção de cenário, reset, disparo de eventos).
 */
function configSnapshot() {
  return {
    scenarioName: mockConfig.scenarioName,
    scenario: scenario(),
    availableScenarios: Object.keys(scenarios),
  }
}

export const controlHandlers = [
  http.get('/__mocks__/config', () => jsonOk(configSnapshot())),

  http.post('/__mocks__/scenario', async ({ request }) => {
    const body = (await request.json()) as { name?: string }
    if (!body.name || !(body.name in scenarios)) {
      return jsonError(422, 'validation_error', 'Cenário desconhecido.')
    }
    mockConfig.setScenario(body.name)
    return jsonOk(configSnapshot())
  }),

  http.post('/__mocks__/config', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    mockConfig.patch(body)
    return jsonOk(configSnapshot())
  }),

  http.post('/__mocks__/reset', () => {
    resetDb()
    mockConfig.setScenario('default')
    return jsonOk(configSnapshot())
  }),

  http.post('/__mocks__/nft', async ({ request }) => {
    const body = (await request.json()) as {
      nftId?: string
      action?: 'price-up' | 'sellout'
      factor?: number
    }
    const db = getDb()
    const nft = db.nfts.find((entry) => entry.id === body.nftId)
    if (!nft) return jsonError(404, 'not_found', 'NFT não encontrado.')

    if (body.action === 'price-up') {
      const factor = body.factor ?? 1.5
      nft.editions = nft.editions.map((edition) => ({
        ...edition,
        priceEth: mulEth(edition.priceEth, factor),
      }))
      nft.priceEth = mulEth(nft.priceEth, factor)
    } else if (body.action === 'sellout') {
      nft.editions = nft.editions.map((edition) => ({ ...edition, available: 0 }))
      nft.totalAvailable = 0
    } else {
      return jsonError(422, 'validation_error', 'Ação desconhecida.')
    }

    nft.version += 1
    nft.updatedAt = new Date().toISOString()
    persistDb()

    const event: NftUpdatedEvent = {
      eventId: uid('evt'),
      resource: 'nft',
      resourceId: nft.id,
      version: nft.version,
      occurredAt: nft.updatedAt,
      priceEth: nft.priceEth,
      totalAvailable: nft.totalAvailable,
      editions: nft.editions,
    }
    broadcastNftUpdated(event)
    return jsonOk(nft)
  }),

  http.post('/__mocks__/order', async ({ request }) => {
    const body = (await request.json()) as {
      orderId?: string
      status?: OrderStatus
      txHash?: string
    }
    const db = getDb()
    const order = db.orders.find((entry) => entry.id === body.orderId)
    if (!order) return jsonError(404, 'not_found', 'Pedido não encontrado.')
    if (!body.status) return jsonError(422, 'validation_error', 'Status obrigatório.')

    order.status = body.status
    order.version += 1
    order.updatedAt = new Date().toISOString()
    if (body.status === 'confirmed') {
      order.txHash = body.txHash ?? order.txHash ?? `0x${'ab'.repeat(32)}`
      order.explorerUrl = explorerUrl(order.networkId, order.txHash)
    }
    if (body.status === 'rejected') {
      order.failureReason = order.failureReason ?? 'Pagamento recusado (controle).'
    }
    persistDb()

    const event: OrderUpdatedEvent = {
      eventId: uid('evt'),
      resource: 'order',
      resourceId: order.id,
      version: order.version,
      occurredAt: order.updatedAt,
      status: order.status,
      txHash: order.txHash,
      failureReason: order.failureReason,
    }
    broadcastOrderUpdated(event)
    return jsonOk(order)
  }),
]
