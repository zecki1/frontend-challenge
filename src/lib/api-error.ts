import type { AxiosError } from 'axios'
import type { ApiErrorBody, ApiErrorCode } from '@/api/types'

/**
 * Erro de domínio normalizado a partir de qualquer falha de transporte.
 * Componentes e hooks consomem apenas `ApiError`, nunca `AxiosError` cru.
 */
export class ApiError extends Error {
  readonly status: number
  readonly code: ApiErrorCode
  readonly details: Record<string, string[]> | null
  readonly requestId: string | undefined

  constructor(params: {
    status: number
    code: ApiErrorCode
    message: string
    details?: Record<string, string[]> | null
    requestId?: string
  }) {
    super(params.message)
    this.name = 'ApiError'
    this.status = params.status
    this.code = params.code
    this.details = params.details ?? null
    this.requestId = params.requestId
  }

  static isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError
  }

  /** Converte uma falha do Axios (ou qualquer erro) em `ApiError`. */
  static fromAxios(error: AxiosError<ApiErrorBody>): ApiError {
    const rawBody = error.response?.data
    // O corpo pode ser HTML/string quando não há backend (ex.: host estático
    // devolvendo index.html) — nesse caso não há `message`, e o fallback abaixo
    // entrega uma mensagem contextual em vez de "Ocorreu um erro inesperado".
    const body =
      rawBody && typeof rawBody === 'object' && !Array.isArray(rawBody)
        ? (rawBody as ApiErrorBody)
        : undefined
    const status = error.response?.status ?? 0

    if (!error.response) {
      return new ApiError({
        status,
        code: error.code === 'ECONNABORTED' ? 'transient_error' : 'network_error',
        message:
          error.code === 'ECONNABORTED'
            ? 'A requisição excedeu o tempo limite.'
            : 'Não foi possível conectar ao servidor.',
      })
    }

    const fallbackMessage =
      status === 404
        ? 'Recurso não encontrado.'
        : status === 403
          ? 'Acesso negado pelo servidor.'
          : status >= 500
            ? 'O servidor está indisponível no momento.'
            : 'Ocorreu um erro inesperado.'

    return new ApiError({
      status,
      code: body?.code ?? 'transient_error',
      message: body?.message ?? fallbackMessage,
      details: body?.details ?? null,
      requestId: body?.requestId,
    })
  }
}
