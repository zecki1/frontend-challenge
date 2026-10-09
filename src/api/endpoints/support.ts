import { apiClient } from '@/lib/http'
import type { SupportTicket, SupportTicketPayload } from '../types'

export const supportApi = {
  create: (payload: SupportTicketPayload) =>
    apiClient.post<SupportTicket>('/support/tickets', payload),
  list: (signal?: AbortSignal) =>
    apiClient.get<SupportTicket[]>('/support/tickets', { signal }),
  updateStatus: (osNumber: string, status: SupportTicket['status']) =>
    apiClient.patch<SupportTicket>(`/support/tickets/${osNumber}`, { status }),
}