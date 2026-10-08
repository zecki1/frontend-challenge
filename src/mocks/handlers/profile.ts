import { http } from 'msw'
import type {
  ChangePasswordPayload,
  Profile,
  UpdateProfilePayload,
} from '@/api/types'
import { env } from '@/lib/env'
import { getDb, hashPassword, persistDb, verifyPassword } from '../db'
import { applyNetworkConditions, jsonError, jsonOk, requireUser } from './utils'

const API = env.apiUrl
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const profileHandlers = [
  http.get(`${API}/profile`, async ({ request }) => {
    const gate = await applyNetworkConditions()
    if (gate) return gate
    const user = requireUser(request)
    if (user instanceof Response) return user
    return jsonOk<Profile>(user.profile)
  }),

  http.patch(`${API}/profile`, async ({ request }) => {
    const gate = await applyNetworkConditions()
    if (gate) return gate
    const user = requireUser(request)
    if (user instanceof Response) return user

    const body = (await request.json()) as UpdateProfilePayload
    const details: Record<string, string[]> = {}
    if (body.name !== undefined && body.name.trim().length < 2) {
      details.name = ['Informe um nome com pelo menos 2 caracteres.']
    }
    if (body.email !== undefined && !EMAIL_RE.test(body.email)) {
      details.email = ['Informe um e-mail válido.']
    }
    if (Object.keys(details).length > 0) {
      return jsonError(422, 'validation_error', 'Verifique os campos.', details)
    }

    if (body.email && body.email.toLowerCase() !== user.profile.email.toLowerCase()) {
      const conflict = getDb().users.some(
        (item) =>
          item.id !== user.id &&
          item.profile.email.toLowerCase() === body.email!.toLowerCase(),
      )
      if (conflict) {
        return jsonError(409, 'email_conflict', 'Este e-mail já está em uso.', {
          email: ['Este e-mail já está em uso.'],
        })
      }
    }

    const updated: Profile = {
      ...user.profile,
      ...body,
      email: body.email ? body.email.toLowerCase() : user.profile.email,
    }
    user.profile = updated
    persistDb()
    return jsonOk(updated)
  }),

  http.post(`${API}/profile/password`, async ({ request }) => {
    const gate = await applyNetworkConditions()
    if (gate) return gate
    const user = requireUser(request)
    if (user instanceof Response) return user

    const body = (await request.json()) as ChangePasswordPayload
    const details: Record<string, string[]> = {}
    if (!body.currentPassword || !verifyPassword(body.currentPassword, user.passwordHash)) {
      details.currentPassword = ['Senha atual incorreta.']
    }
    if (!body.newPassword || body.newPassword.length < 8) {
      details.newPassword = ['A nova senha deve ter pelo menos 8 caracteres.']
    }
    if (body.newPassword && body.newPassword === body.currentPassword) {
      details.newPassword = ['A nova senha deve ser diferente da atual.']
    }
    if (Object.keys(details).length > 0) {
      return jsonError(422, 'validation_error', 'Verifique os campos.', details)
    }

    user.passwordHash = hashPassword(body.newPassword)
    persistDb()
    return new Response(null, { status: 204 })
  }),
]
