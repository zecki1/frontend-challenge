import { apiClient } from '@/lib/http'
import type {
  ChangePasswordPayload,
  Profile,
  UpdateProfilePayload,
} from '../types'

export const profileApi = {
  get: (signal?: AbortSignal) =>
    apiClient.get<Profile>('/profile', { signal }),
  update: (payload: UpdateProfilePayload) =>
    apiClient.patch<Profile>('/profile', payload),
  changePassword: (payload: ChangePasswordPayload) =>
    apiClient.post<void>('/profile/password', payload),
}
