import { http } from 'msw'
import { env } from '@/lib/env'
import { getOrCreateCart } from '../db'
import { buildQuote } from '../quote'
import { applyNetworkConditions, jsonOk, requireUser } from './utils'

const API = env.apiUrl

export const quoteHandlers = [
  http.get(`${API}/quote`, async ({ request }) => {
    const gate = await applyNetworkConditions()
    if (gate) return gate
    const user = requireUser(request)
    if (user instanceof Response) return user
    return jsonOk(buildQuote(getOrCreateCart(user.id)))
  }),

  http.post(`${API}/quote/revalidate`, async ({ request }) => {
    const gate = await applyNetworkConditions()
    if (gate) return gate
    const user = requireUser(request)
    if (user instanceof Response) return user
    return jsonOk(buildQuote(getOrCreateCart(user.id)))
  }),
]
