import { http } from 'msw'
import type {
  SupportCategory,
  SupportLevel,
  SupportTicket,
  SupportTicketPayload,
  SupportUrgency,
} from '@/api/types'
import { env } from '@/lib/env'
import { getDb, persistDb, type SupportTicketRecord } from '../db'
import { applyNetworkConditions, jsonError, jsonOk, requireUser } from './utils'

const API = env.apiUrl

/** Urgência -> nível de prioridade da OS (P1 crítica … P4 baixa). */
const URGENCY_LEVEL: Record<SupportUrgency, SupportLevel> = {
  baixa: 'P4',
  media: 'P3',
  alta: 'P2',
  critica: 'P1',
}

/** SLA de resposta (em horas) por categoria. */
const CATEGORY_RESPONSE_HRS: Record<SupportCategory, number> = {
  pedido: 4,
  bug: 8,
  conta: 12,
  nft: 24,
  sugestao: 48,
  outro: 24,
}

/** Remove o campo interno `userId` antes de devolver ao cliente. */
function toApi(ticket: SupportTicketRecord): SupportTicket {
  return {
    osNumber: ticket.osNumber,
    status: ticket.status,
    level: ticket.level,
    category: ticket.category,
    urgency: ticket.urgency,
    description: ticket.description,
    estimatedResponseHrs: ticket.estimatedResponseHrs,
    channel: ticket.channel,
    createdAt: ticket.createdAt,
  }
}

export const supportHandlers = [
  http.post(`${API}/support/tickets`, async ({ request }) => {
    const gate = await applyNetworkConditions()
    if (gate) return gate
    const user = requireUser(request)
    if (user instanceof Response) return user

    const body = (await request.json()) as Partial<SupportTicketPayload>
    const description = (body.description ?? '').trim()
    if (description.length < 10) {
      return jsonError(
        422,
        'validation_error',
        'Descreva o problema com pelo menos 10 caracteres.',
      )
    }
    const category = (body.category ?? 'outro') as SupportCategory
    const urgency = (body.urgency ?? 'media') as SupportUrgency

    const db = getDb()
    const sequence = db.supportTickets.length + 1
    const osNumber = `OS-${new Date().getFullYear()}-${String(sequence).padStart(4, '0')}`
    const record: SupportTicketRecord = {
      osNumber,
      status: 'aberta',
      level: URGENCY_LEVEL[urgency],
      category,
      urgency,
      description,
      estimatedResponseHrs: CATEGORY_RESPONSE_HRS[category],
      channel: 'resend',
      createdAt: new Date().toISOString(),
      userId: user.id,
    }
    db.supportTickets.push(record)
    persistDb()

    // Integração Resend (simulada): este é exatamente o payload que seria
    // enviado por `resend.emails.send(...)` em um backend com RESEND_API_KEY.
    const emailPayload = {
      from: 'KURIO Suporte <suporte@kurio.art>',
      to: ['suporte@kurio.art'],
      subject: `[${osNumber}] ${category} · prioridade ${record.level} (${urgency})`,
      html:
        `<h1>${osNumber}</h1>` +
        `<p><strong>Categoria:</strong> ${category}</p>` +
        `<p><strong>Urgência:</strong> ${urgency} (${record.level})</p>` +
        `<p><strong>Usuário:</strong> ${user.profile.name} &lt;${user.profile.email}&gt;</p>` +
        `<p><strong>Descrição:</strong><br/>${description.replace(/\n/g, '<br/>')}</p>` +
        (body.screenshot
          ? `<p><strong>Print da tela:</strong></p><img src="${body.screenshot}" alt="Print da tela" style="max-width:100%" />`
          : ''),
    }
    console.info('[mock:resend] emails.send', emailPayload)

    return jsonOk(toApi(record), 201)
  }),

  http.get(`${API}/support/tickets`, async ({ request }) => {
    const gate = await applyNetworkConditions()
    if (gate) return gate
    const user = requireUser(request)
    if (user instanceof Response) return user

    const db = getDb()
    const tickets = db.supportTickets
      .filter((ticket) => ticket.userId === user.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(toApi)
    return jsonOk<SupportTicket[]>(tickets)
  }),

  http.patch(`${API}/support/tickets/:osNumber`, async ({ request, params }) => {
    const gate = await applyNetworkConditions()
    if (gate) return gate
    const user = requireUser(request)
    if (user instanceof Response) return user

    const body = (await request.json()) as { status?: SupportTicket['status'] }
    const status = body.status
    if (!status || !['aberta', 'em_andamento', 'resolvida'].includes(status)) {
      return jsonError(422, 'validation_error', 'Status inválido.')
    }

    const db = getDb()
    const ticket = db.supportTickets.find(
      (entry) => entry.osNumber === params.osNumber && entry.userId === user.id,
    )
    if (!ticket) {
      return jsonError(404, 'not_found', 'Ordem de serviço não encontrada.')
    }
    ticket.status = status
    persistDb()
    return jsonOk(toApi(ticket))
  }),
]