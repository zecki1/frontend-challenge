import { http } from 'msw'
import { env } from '@/lib/env'
import { applyNetworkConditions, jsonError, jsonOk } from './utils'

const API = env.apiUrl

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const newsletterHandlers = [
  /**
   * Assinatura da newsletter do footer. O e-mail é enviado pelo backend:
   * este handler reproduz o payload exato do `resend.emails.send(...)` para
   * que a integração real só precise trocar o `[mock:resend]` por uma chamada
   * com `RESEND_API_KEY` no servidor — a chave nunca chega ao navegador.
   */
  http.post(`${API}/newsletter/subscribe`, async ({ request }) => {
    const gate = await applyNetworkConditions()
    if (gate) return gate

    const body = (await request.json()) as { email?: string }
    const email = (body.email ?? '').trim().toLowerCase()
    if (!EMAIL_RE.test(email)) {
      return jsonError(422, 'validation_error', 'E-mail inválido.')
    }

    console.info('[mock:resend] emails.send', {
      from: 'Kurio <newsletter@kurio.art>',
      to: [email],
      subject: 'Confirmação de inscrição na newsletter Kurio',
      html: '<p>Obrigado por se inscrever na newsletter da Kurio.</p>',
    })

    return jsonOk({ ok: true }, 201)
  }),
]