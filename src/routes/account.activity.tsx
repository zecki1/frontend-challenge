import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { activityApi, queryKeys } from '@/api'
import type { ActivityAction } from '@/api/types'
import { requireAuthBeforeLoad } from '@/features/auth/require-auth'
import { useMswReady } from '@/lib/msw-ready'
import { AccountSidebar } from '@/components/account/account-sidebar'

export const Route = createFileRoute('/account/activity')({
  beforeLoad: requireAuthBeforeLoad,
  component: ActivityPage,
})

const ACTION_KEYS: Record<ActivityAction, string> = {
  view: 'account.activityView',
  favorite: 'account.activityFavorite',
  cart: 'account.activityCart',
  buy: 'account.activityBuy',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'agora'
  if (minutes < 60) return `${minutes} min atrás`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} h atrás`
  const days = Math.floor(hours / 24)
  return `${days} d atrás`
}

function ActivityPage() {
  const { t } = useTranslation()
  const mswReady = useMswReady()

  const { data: items, isLoading } = useQuery({
    queryKey: queryKeys.activity,
    queryFn: ({ signal }) => activityApi.list(signal),
    enabled: mswReady,
  })

  const emptyState = (
    <div className="py-24 text-center">
      <p className="text-lg text-kurio-cream">{t('account.emptyActivity')}</p>
    </div>
  )

  return (
    <div className="mx-auto max-w-content px-6 py-6">
      <div className="flex flex-col gap-7 lg:flex-row">
        <AccountSidebar active="activity" />
        <div className="min-w-0 flex-1 lg:max-w-[862px]">
          <h1 className="text-[17px] font-bold text-kurio-cream">{t('account.activity')}</h1>
          <p className="mt-2 text-sm leading-[15px] text-kurio-sand">{t('account.activitySubtitle')}</p>

          <div className="mt-6">
            {isLoading ? (
              <div className="h-8 w-48 skeleton rounded bg-kurio-surface" />
            ) : !items || items.length === 0 ? (
              emptyState
            ) : (
              <div className="space-y-4">
                {items.map(({ event, nft }) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 rounded-[3px] border border-kurio-surface bg-kurio-surface2 px-4 py-3"
                  >
                    <span className="rounded-full border border-kurio-copper/40 px-3 py-1 text-xs font-medium text-kurio-copper">
                      {t(ACTION_KEYS[event.action])}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-medium text-kurio-cream">{nft.name}</p>
                      <p className="text-xs text-kurio-sand">{t('account.activityCollection', { collection: nft.collection })}</p>
                    </div>
                    <span className="shrink-0 text-xs text-kurio-bronze">{timeAgo(event.at)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}