import { apiClient } from '@/lib/http'
import type {
  LoginPayload,
  RegisterPayload,
  Session,
} from '../types'

export const sessionApi = {
  register: (payload: RegisterPayload) =>
    apiClient.post<Session>('/auth/register', payload),
  login: (payload: LoginPayload) =>
    apiClient.post<Session>('/auth/login', payload),
  socialLogin: (provider: 'google' | 'facebook') =>
    apiClient.post<Session>(`/auth/social/${provider}`),
  me: (signal?: AbortSignal) =>
    apiClient.get<Session>('/auth/session', { signal }),
  logout: () => apiClient.post<void>('/auth/logout'),
}
