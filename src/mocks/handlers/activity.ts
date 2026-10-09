import { http } from 'msw'
import type { ActivityItem } from '@/api/types'
import { env } from '@/lib/env'
import { getDb } from '../db'
import { applyNetworkConditions, jsonOk, requireUser } from './utils'

const API = env.apiUrl

export const activityHandlers = [
  http.get(`${API}/activity`, async ({ request }) => {
    const gate = await applyNetworkConditions()
    if (gate) return gate
    const user = requireUser(request)
    if (user instanceof Response) return user

    const db = getDb()
    const events = db.userActivity[user.id] ?? []
    const items: ActivityItem[] = events
      .map((event) => {
        const nft = db.nfts.find((entry) => entry.id === event.nftId)
        return nft ? { event, nft } : null
      })
      .filter((item): item is ActivityItem => item !== null)

    return jsonOk<ActivityItem[]>(items)
  }),
]