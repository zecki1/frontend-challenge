import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Camera, Image as ImageIcon, LifeBuoy, Loader2, Send, X } from 'lucide-react'
import { queryKeys, supportApi } from '@/api'
import type { SupportCategory, SupportTicket, SupportUrgency } from '@/api/types'
import { ApiError } from '@/lib/api-error'

const STORAGE_KEY = 'kurio.support-enabled'
export const SUPPORT_ENABLED_EVENT = 'kurio:support-enabled'

export function isSupportEnabled(): boolean {
  return window.localStorage.getItem(STORAGE_KEY) === 'true'
}

export function setSupportEnabled(enabled: boolean): void {
  window.localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false')
  window.dispatchEvent(new CustomEvent(SUPPORT_ENABLED_EVENT, { detail: { enabled } }))
}

/** Urgência sugerida por categoria (o usuário pode mudar depois). */
const SUGGESTED_URGENCY: Record<SupportCategory, SupportUrgency> = {
  bug: 'media',
  pedido: 'alta',
  conta: 'media',
  nft: 'baixa',
  sugestao: 'baixa',
  outro: 'media',
}

const CATEGORIES: SupportCategory[] = ['bug', 'pedido', 'conta', 'nft', 'sugestao', 'outro']
const URGENCIES: SupportUrgency[] = ['baixa', 'media', 'alta', 'critica']

/**
 * Widget de suporte (canto inferior direito). Tira um print da tela, coleta a
 * descrição, categoria e urgência e abre uma OS que é "enviada" via Resend
 * (simulado no handler de mocks).
 */
export function SupportWidget() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [enabled, setEnabledState] = useState(false)
  const [open, setOpen] = useState(false)
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [capturing, setCapturing] = useState(false)
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<SupportCategory>('bug')
  const [urgency, setUrgency] = useState<SupportUrgency>('media')
  const [ticket, setTicket] = useState<SupportTicket | null>(null)

  useEffect(() => {
    const sync = () => setEnabledState(isSupportEnabled())
    sync()
    window.addEventListener(SUPPORT_ENABLED_EVENT, sync)
    return () => window.removeEventListener(SUPPORT_ENABLED_EVENT, sync)
  }, [])

  const submit = useMutation({
    mutationFn: () =>
      supportApi.create({ description, category, urgency, screenshot }),
    onSuccess: (data) => {
      setTicket(data)
      // Refresca a tabela de OS da página de Suporte
      void queryClient.invalidateQueries({ queryKey: queryKeys.support })
    },
  })

  const captureScreen = async () => {
    setCapturing(true)
    try {
      // Import dinâmico: html2canvas (~200 kB) só é baixado ao capturar a tela
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(document.body, { useCORS: true, logging: false })
      setScreenshot(canvas.toDataURL('image/png'))
    } catch (error) {
      console.warn('Falha ao capturar a tela.', error)
    } finally {
      setCapturing(false)
    }
  }

  const resetForm = () => {
    setDescription('')
    setScreenshot(null)
    setTicket(null)
    setCategory('bug')
    setUrgency('media')
  }

  const onOpen = () => {
    setOpen((value) => !value)
    if (!open) resetForm()
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    submit.mutate()
  }

  if (!enabled) return null

  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-kurio-copper text-kurio-bg shadow-lg shadow-black/40 transition-transform hover:scale-105"
        aria-label={t('support.open')}
      >
        <LifeBuoy className="h-6 w-6" aria-hidden />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label={t('support.title')}
        >
          <div className="max-h-[90dvh] w-full max-w-[520px] overflow-y-auto rounded-xl border border-kurio-surface bg-kurio-surface2 p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-[17px] font-bold text-kurio-cream">{t('support.title')}</h2>
                <p className="mt-1 text-sm leading-[15px] text-kurio-sand">{t('support.subtitle')}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-kurio-sand transition-colors hover:text-kurio-cream"
                aria-label={t('support.close')}
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            {ticket ? (
              <div className="mt-6 rounded-lg border border-kurio-copper/40 bg-kurio-surface p-4">
                <p className="text-base font-bold text-kurio-copper">{t('support.osCreated')}</p>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-kurio-sand">{t('support.osNumber')}</dt>
                    <dd className="font-bold text-kurio-cream">{ticket.osNumber}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-kurio-sand">{t('support.level')}</dt>
                    <dd className="font-bold text-kurio-cream">{ticket.level}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-kurio-sand">{t('support.channel')}</dt>
                    <dd className="font-bold text-kurio-cream">{ticket.channel}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-kurio-sand">{t('support.estimated')}</dt>
                    <dd className="font-bold text-kurio-cream">
                      {ticket.estimatedResponseHrs} {t('support.hours')}
                    </dd>
                  </div>
                </dl>
                <button
                  type="button"
                  onClick={resetForm}
                  className="mt-4 h-9 rounded-[3px] bg-kurio-copper px-4 text-sm font-bold text-kurio-bg transition-colors hover:bg-kurio-copperLight"
                >
                  {t('support.newTicket')}
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
                <div className="rounded-lg border border-kurio-surface bg-kurio-surface p-3">
                  {screenshot ? (
                    <div className="relative overflow-hidden rounded-md">
                      <img src={screenshot} alt={t('support.screenshot')} className="max-h-48 w-full object-cover" />
                      <ImageIcon className="absolute right-2 top-2 h-5 w-5 text-kurio-cream" aria-hidden />
                    </div>
                  ) : (
                    <p className="text-center text-sm text-kurio-sand">{t('support.noScreenshot')}</p>
                  )}
                  <button
                    type="button"
                    onClick={captureScreen}
                    disabled={capturing}
                    className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-kurio-copper transition-colors hover:text-kurio-copperLight disabled:opacity-50"
                  >
                    {capturing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Camera className="h-4 w-4" aria-hidden />}
                    {screenshot ? t('support.recapture') : t('support.capture')}
                  </button>
                </div>

                <div>
                  <label htmlFor="support-description" className="mb-1 block text-sm font-medium text-kurio-cream">
                    {t('support.description')}
                  </label>
                  <textarea
                    id="support-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder={t('support.descriptionPlaceholder')}
                    rows={4}
                    className="w-full resize-none rounded-[3px] border border-kurio-surface bg-kurio-surface px-3 py-2 text-sm text-kurio-cream placeholder:text-kurio-bronze focus:border-kurio-copper focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="support-category" className="mb-1 block text-sm font-medium text-kurio-cream">
                      {t('support.category')}
                    </label>
                    <select
                      id="support-category"
                      value={category}
                      onChange={(event) => {
                        const value = event.target.value as SupportCategory
                        setCategory(value)
                        setUrgency(SUGGESTED_URGENCY[value])
                      }}
                      className="w-full rounded-[3px] border border-kurio-surface bg-kurio-surface px-3 py-2 text-sm text-kurio-cream focus:border-kurio-copper focus:outline-none"
                    >
                      {CATEGORIES.map((entry) => (
                        <option key={entry} value={entry}>
                          {t(`support.categories.${entry}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="support-urgency" className="mb-1 block text-sm font-medium text-kurio-cream">
                      {t('support.urgency')}
                    </label>
                    <select
                      id="support-urgency"
                      value={urgency}
                      onChange={(event) => setUrgency(event.target.value as SupportUrgency)}
                      className="w-full rounded-[3px] border border-kurio-surface bg-kurio-surface px-3 py-2 text-sm text-kurio-cream focus:border-kurio-copper focus:outline-none"
                    >
                      {URGENCIES.map((entry) => (
                        <option key={entry} value={entry}>
                          {t(`support.urgencies.${entry}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {submit.isError ? (
                  <p role="alert" className="text-sm text-kurio-coral">
                    {submit.error instanceof ApiError ? submit.error.message : t('support.error')}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={submit.isPending}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[3px] bg-kurio-copper text-[14px] font-bold text-kurio-bg transition-colors hover:bg-kurio-copperLight disabled:opacity-50"
                >
                  {submit.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Send className="h-4 w-4" aria-hidden />
                  )}
                  {submit.isPending ? t('support.sending') : t('support.send')}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  )
}