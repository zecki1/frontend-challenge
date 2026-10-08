import { env } from '@/lib/env'

const RESEND_API_URL = 'https://api.resend.com/emails'

interface SendEmailParams {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail({ to, subject, html, from = 'Kurio <newsletter@kurio.art>' }: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  const apiKey = env.resendApiKey

  if (!apiKey) {
    console.warn('[Resend] API key not configured. Email not sent.', { to, subject })
    return { success: false, error: 'Resend API key not configured' }
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('[Resend] Failed to send email:', error)
      return { success: false, error: error.message || 'Failed to send email' }
    }

    const data = await response.json()
    console.log('[Resend] Email sent successfully:', data)
    return { success: true }
  } catch (error) {
    console.error('[Resend] Error sending email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function sendNewsletterConfirmation(email: string): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to: email,
    subject: 'Confirmação de inscrição na newsletter Kurio',
    html: `
      <div style="font-family: 'Roboto Mono', monospace; max-width: 600px; margin: 0 auto; padding: 24px; background: #140D0A; color: #F7F3EC;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #D28A4C; font-size: 24px; font-weight: bold; margin: 0;">KURIO</h1>
          <p style="color: #CFB28C; font-size: 14px; margin: 8px 0 0;">Feito para colecionadores, criadores e cultura</p>
        </div>
        <div style="background: #241612; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h2 style="color: #F7F3EC; font-size: 18px; font-weight: bold; margin: 0 0 12px;">Inscrição confirmada!</h2>
          <p style="color: #CFB28C; font-size: 14px; line-height: 1.6; margin: 0;">
            Obrigado por se inscrever na newsletter da Kurio. Você receberá lançamentos selecionados, histórias de criadores e novidades do mercado.
          </p>
        </div>
        <div style="text-align: center; color: #CFB28C; font-size: 12px;">
          <p style="margin: 0 0 8px;">Kurio - Propriedade digital para todos</p>
          <p style="margin: 0;">contato@email.com | +55 11 4002 8922</p>
        </div>
      </div>
    `,
  })
}