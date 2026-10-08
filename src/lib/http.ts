import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'
import type { ApiErrorBody } from '@/api/types'
import { ApiError } from './api-error'
import { env } from './env'
import { sessionToken } from './session-token'

/**
 * Evento global disparado quando a sessão expira durante uma requisição.
 * O provider de sessão (features/auth) escuta e limpa o estado privado.
 */
export const AUTH_EXPIRED_EVENT = 'auth:expired'

export const http = axios.create({
  baseURL: env.apiUrl,
  timeout: 15_000,
  headers: { Accept: 'application/json' },
})

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = sessionToken.get()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const apiError = ApiError.fromAxios(error)
    if (
      apiError.code === 'session_expired' ||
      apiError.code === 'unauthenticated'
    ) {
      window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT))
    }
    return Promise.reject(apiError)
  },
)

async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const { data } = await http.request<T>(config)
  return data
}

export const apiClient = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'GET', url }),
  post: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'POST', url, data: body }),
  put: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'PUT', url, data: body }),
  patch: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'PATCH', url, data: body }),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'DELETE', url }),
}
