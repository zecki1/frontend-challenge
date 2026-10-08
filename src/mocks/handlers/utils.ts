import { HttpResponse, delay } from 'msw'
import type { ApiErrorBody, ApiErrorCode } from '@/api/types'
import { currentUser, uid, type MockUserRecord } from '../db'
import { scenario } from '../config'

export function jsonOk<T>(data: T, status = 200): Response {
  return HttpResponse.json(data as never, { status })
}

export function jsonError(
  status: number,
  code: ApiErrorCode,
  message: string,
  details: Record<string, string[]> | null = null,
): Response {
  const body: ApiErrorBody = { code, message, details, requestId: uid('req') }
  return HttpResponse.json(body, { status })
}

/**
 * Aplica as condições de rede do cenário ativo. Retorna uma `Response` quando a
 * requisição deve ser interrompida (offline / falha transitória) ou `null` para
 * seguir com o handler normalmente.
 */
export async function applyNetworkConditions(): Promise<Response | null> {
  const config = scenario()

  if (config.latencyMs > 0 || config.jitterMs > 0) {
    await delay(config.latencyMs + Math.random() * config.jitterMs)
  }

  if (config.offline) {
    return HttpResponse.error()
  }

  if (config.failRate > 0 && Math.random() < config.failRate) {
    return jsonError(503, 'transient_error', 'Falha transitória simulada. Tente novamente.')
  }

  return null
}

export function getBearerToken(request: Request): string | null {
  const header = request.headers.get('Authorization')
  if (!header) return null
  return header.replace(/^Bearer\s+/i, '')
}

/** Garante sessão válida; devolve o usuário ou uma resposta 401. */
export function requireUser(request: Request): MockUserRecord | Response {
  if (scenario().forceSessionExpired) {
    return jsonError(401, 'session_expired', 'Sua sessão expirou. Entre novamente.')
  }
  const user = currentUser(getBearerToken(request))
  if (!user) {
    return jsonError(401, 'unauthenticated', 'Autenticação necessária.')
  }
  return user
}

export function isResponse(value: unknown): value is Response {
  return value instanceof Response
}
