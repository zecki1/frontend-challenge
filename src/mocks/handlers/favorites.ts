import { http } from 'msw'
import type { FavoritesResponse } from '@/api/types'
import { env } from '@/lib/env'
import { getDb, persistDb } from '../db'
import { applyNetworkConditions, jsonOk, requireUser } from './utils'

const API = env.apiUrl

function favoritesFor(userId: string): string[] {
  const db = getDb()
  if (!db.favorites[userId]) db.favorites[userId] = []
  return db.favorites[userId]
}

export const favoriteHandlers = [
  http.get(`${API}/favorites`, async ({ request }) => {
    const gate = await applyNetworkConditions()
    if (gate) return gate
    const user = requireUser(request)
    if (user instanceof Response) return user
    return jsonOk<FavoritesResponse>({ nftIds: favoritesFor(user.id) })
  }),

  http.post(`${API}/favorites/:nftId`, async ({ request, params }) => {
    const gate = await applyNetworkConditions()
    if (gate) return gate
    const user = requireUser(request)
    if (user instanceof Response) return user

    const nftId = String(params.nftId)
    const favorites = favoritesFor(user.id)
    if (!favorites.includes(nftId)) favorites.push(nftId)
    persistDb()
    return jsonOk<FavoritesResponse>({ nftIds: favorites })
  }),

  http.delete(`${API}/favorites/:nftId`, async ({ request, params }) => {
    const gate = await applyNetworkConditions()
    if (gate) return gate
    const user = requireUser(request)
    if (user instanceof Response) return user

    const nftId = String(params.nftId)
    const db = getDb()
    db.favorites[user.id] = favoritesFor(user.id).filter((id) => id !== nftId)
    persistDb()
    return jsonOk<FavoritesResponse>({ nftIds: db.favorites[user.id] })
  }),
]
