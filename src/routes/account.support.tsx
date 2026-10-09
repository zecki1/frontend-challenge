import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, LifeBuoy } from 'lucide-react'
import { queryKeys, supportApi } from '@/api'
import type { SupportTicket } from '@/api/types'
import { requireAuthBeforeLoad } from '@/features/auth/require-auth'
import { useMswReady } from '@/lib/msw-ready'
import { AccountSidebar } from '@/components/account/account-sidebar'
import { isSupportEnabled, setSupportEnabled, SUPPORT_ENABLED_EVENT } from '@/components/support-widget'

export const Route = createFileRoute('/account/support')({
  beforeLoad: requireAuthBeforeLoad,
  component: SupportPage,
})

const STATUS_KEYS: Record<SupportTicket['status'], string> = {
  aberta: 'support.tickets.statusAberta',
  em_andamento: 'support.tickets.statusEmAndamento',
  resolvida: 'support.tickets.statusResolvida',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function SupportPage() {
  const { t } = useTranslation()
  const mswReady = useMswReady()
  const queryClient = useQueryClient()
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const sync = () => setEnabled(isSupportEnabled())
    sync()
    window.addEventListener(SUPPORT_ENABLED_EVENT, sync)
    return () => window.removeEventListener(SUPPORT_ENABLED_EVENT, sync)
  }, [])

  const { data: tickets, isLoading } = useQuery({
    queryKey: queryKeys.support,
    queryFn: ({ signal }) => supportApi.list(signal),
    enabled: mswReady,
  })

  const resolve = useMutation({
    mutationFn: (osNumber: string) => supportApi.updateStatus(osNumber, 'resolvida'),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.support }),
  })

  return (
    <div className="mx-auto max-w-content px-6 py-6">
      <div className="flex flex-col gap-7 lg:flex-row">
        <AccountSidebar active="support" />
        <div className="min-w-0 flex-1 lg:max-w-[862px]">
          <h1 className="text-[17px] font-bold text-kurio-cream">{t('account.support')}</h1>
          <p className="mt-2 text-sm leading-[15px] text-kurio-sand">{t('support.subtitle')}</p>

          <div className="mt-6 max-w-[560px] rounded-[3px] border border-kurio-surface bg-kurio-surface2 p-5">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-kurio-copper/15 text-kurio-copper">
                <LifeBuoy className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-[15px] font-medium text-kurio-cream">{t('support.widgetHint')}</p>
                <p className="mt-1 text-sm leading-[15px] text-kurio-sand">{t('support.widgetSteps')}</p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-4 border-t-[0.3px] border-kurio-copper pt-5">
              <p className="text-sm text-kurio-sand">
                {enabled ? t('support.enabled') : t('support.disabled')}
              </p>
              <button
                type="button"
                onClick={() => setSupportEnabled(!enabled)}
                aria-pressed={enabled}
                className="h-10 rounded-[3px] bg-kurio-copper px-4 text-sm font-bold text-kurio-bg transition-colors hover:bg-kurio-copperLight"
              >
                {enabled ? t('support.disable') : t('support.enable')}
              </button>
            </div>
          </div>

          {/* Tabela de OS */}
          <div className="mt-8">
            <h2 className="text-[15px] font-bold text-kurio-cream">{t('support.tickets.title')}</h2>
            <div className="mt-3 overflow-x-auto rounded-[3px] border border-kurio-surface">
              {isLoading ? (
                <div className="h-40 animate-pulse bg-kurio-surface/60" />
              ) : !tickets || tickets.length === 0 ? (
                <div className="py-12 text-center text-sm text-kurio-sand">
                  {t('support.tickets.empty')}
                </div>
              ) : (
                <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-kurio-surface/80 text-[13px] text-kurio-bronze">
                      <th scope="col" className="px-4 py-3 font-medium">{t('support.tickets.os')}</th>
                      <th scope="col" className="px-4 py-3 font-medium">{t('support.tickets.date')}</th>
                      <th scope="col" className="px-4 py-3 font-medium">{t('support.tickets.description')}</th>
                      <th scope="col" className="px-4 py-3 font-medium">{t('support.tickets.urgency')}</th>
                      <th scope="col" className="px-4 py-3 font-medium">{t('support.tickets.status')}</th>
                      <th scope="col" className="px-4 py-3 font-medium">{t('support.tickets.action')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-kurio-surface">
                    {tickets.map((ticket) => {
                      const isResolved = ticket.status === 'resolvida'
                      return (
                        <tr key={ticket.osNumber} className="bg-kurio-surface2/60">
                          <td className="whitespace-nowrap px-4 py-3 font-bold text-kurio-copper">
                            {ticket.osNumber}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-kurio-sand">
                            {formatDate(ticket.createdAt)}
                          </td>
                          <td className="max-w-[220px] px-4 py-3 text-kurio-cream">
                            <p className="truncate" title={ticket.description}>
                              {ticket.description}
                            </p>
                            <span className="text-xs text-kurio-bronze">
                              {t(`support.categories.${ticket.category}`)} · {ticket.level}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-kurio-sand">
                            {t(`support.urgencies.${ticket.urgency}`)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
                                isResolved
                                  ? 'border-kurio-copper/50 text-kurio-copper'
                                  : 'border-kurio-coral/50 text-kurio-coral'
                              }`}
                            >
                              {t(STATUS_KEYS[ticket.status])}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            {isResolved ? (
                              <span className="text-xs text-kurio-bronze" aria-hidden>
                                —
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => resolve.mutate(ticket.osNumber)}
                                disabled={resolve.isPending}
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-kurio-copper transition-colors hover:text-kurio-copperLight disabled:opacity-50"
                              >
                                <CheckCircle2 className="h-4 w-4" aria-hidden />
                                {t('support.tickets.resolve')}
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}