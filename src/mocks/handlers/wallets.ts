import { http } from 'msw'
import type { NetworkId, Wallet, WalletPayload } from '@/api/types'
import { env } from '@/lib/env'
import { persistDb, uid, walletsFor } from '../db'
import { seedNetworks } from '../fixtures/networks'
import {
  applyNetworkConditions,
  jsonError,
  jsonOk,
  requireUser,
} from './utils'

const API = env.apiUrl
const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/
const NETWORK_IDS: NetworkId[] = ['ethereum', 'polygon', 'base']

export const walletHandlers = [
  http.get(`${API}/networks`, async () => {
    const gate = await applyNetworkConditions()
    if (gate) return gate
    return jsonOk(seedNetworks)
  }),

  http.get(`${API}/wallets`, async ({ request }) => {
    const gate = await applyNetworkConditions()
    if (gate) return gate
    const user = requireUser(request)
    if (user instanceof Response) return user
    return jsonOk(walletsFor(user.id))
  }),

  http.post(`${API}/wallets`, async ({ request }) => {
    const gate = await applyNetworkConditions()
    if (gate) return gate
    const user = requireUser(request)
    if (user instanceof Response) return user

    const body = (await request.json()) as Partial<WalletPayload>
    const details: Record<string, string[]> = {}
    if (!body.label || body.label.trim().length < 2) {
      details.label = ['Informe um rótulo com pelo menos 2 caracteres.']
    }
    if (!body.address || !ADDRESS_RE.test(body.address)) {
      details.address = ['Endereço inválido (esperado 0x + 40 hexadecimais).']
    }
    if (!body.networkId || !NETWORK_IDS.includes(body.networkId)) {
      details.networkId = ['Selecione uma rede válida.']
    }
    if (Object.keys(details).length > 0) {
      return jsonError(422, 'validation_error', 'Verifique os campos.', details)
    }

    const wallets = walletsFor(user.id)
    if (wallets.some((wallet) => wallet.address.toLowerCase() === body.address!.toLowerCase())) {
      return jsonError(409, 'conflict', 'Esta carteira já está cadastrada.', {
        address: ['Esta carteira já está cadastrada.'],
      })
    }

    const makePrimary = body.isPrimary ?? wallets.length === 0
    if (makePrimary) wallets.forEach((wallet) => (wallet.isPrimary = false))

    const wallet: Wallet = {
      id: uid('wallet'),
      label: body.label!.trim(),
      address: body.address!,
      networkId: body.networkId!,
      isPrimary: makePrimary,
      createdAt: new Date().toISOString(),
    }
    wallets.push(wallet)
    persistDb()
    return jsonOk(wallet, 201)
  }),

  http.patch(`${API}/wallets/:id`, async ({ request, params }) => {
    const gate = await applyNetworkConditions()
    if (gate) return gate
    const user = requireUser(request)
    if (user instanceof Response) return user

    const wallets = walletsFor(user.id)
    const wallet = wallets.find((entry) => entry.id === params.id)
    if (!wallet) return jsonError(404, 'not_found', 'Carteira não encontrada.')

    const body = (await request.json()) as Partial<WalletPayload>
    const details: Record<string, string[]> = {}
    if (body.label !== undefined && body.label.trim().length < 2) {
      details.label = ['Informe um rótulo com pelo menos 2 caracteres.']
    }
    if (body.address !== undefined && !ADDRESS_RE.test(body.address)) {
      details.address = ['Endereço inválido (esperado 0x + 40 hexadecimais).']
    }
    if (body.networkId !== undefined && !NETWORK_IDS.includes(body.networkId)) {
      details.networkId = ['Selecione uma rede válida.']
    }
    if (Object.keys(details).length > 0) {
      return jsonError(422, 'validation_error', 'Verifique os campos.', details)
    }

    if (body.isPrimary) {
      wallets.forEach((entry) => (entry.isPrimary = false))
    }
    Object.assign(wallet, {
      label: body.label?.trim() ?? wallet.label,
      address: body.address ?? wallet.address,
      networkId: body.networkId ?? wallet.networkId,
      isPrimary: body.isPrimary ?? wallet.isPrimary,
    })
    persistDb()
    return jsonOk(wallet)
  }),
]
