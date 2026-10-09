import { apiClient } from './http'

interface NewsletterResult {
  success: boolean
  error?: string
}

/**
 * Assinatura de newsletter.
 *
 * O envio do e-mail acontece no BACKEND — em dev/demo o MSW simula o
 * `resend.emails.send` com o payload exato (ver src/mocks/handlers/newsletter.ts).
 * A chave da API Resend nunca entra no bundle do frontend: aqui apenas
 * informamos o backend do novo assinante.
 */
export async function subscribeNewsletter(email: string): Promise<NewsletterResult> {
  try {
    await apiClient.post('/newsletter/subscribe', { email })
    return { success: true }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Falha ao assinar a newsletter.'
    return { success: false, error: message }
  }
}