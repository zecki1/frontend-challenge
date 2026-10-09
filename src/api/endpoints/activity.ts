import { apiClient } from '@/lib/http'
import type { ActivityItem } from '../types'

export const activityApi = {
  list: (signal?: AbortSignal) =>
    apiClient.get<ActivityItem[]>('/activity', { signal }),
}