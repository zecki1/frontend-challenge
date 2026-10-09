import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { nftsApi, queryKeys } from '@/api'
import { requireAuthBeforeLoad } from '@/features/auth/require-auth'
import { useMswReady } from '@/lib/msw-ready'
import { AccountSidebar } from '@/components/account/account-sidebar'
import { NftGrid } from '@/components/account/nft-grid'

export const Route = createFileRoute('/account/offers')({
  beforeLoad: requireAuthBeforeLoad,
  component: OffersPage,
})

function OffersPage() {
  const { t } = useTranslation()
  const mswReady = useMswReady()

  const { data: nfts, isLoading } = useQuery({
    queryKey: queryKeys.nfts.list({ page: 1, pageSize: 48, sort: 'price-asc' }),
    queryFn: ({ signal }) => nftsApi.list({ page: 1, pageSize: 48, sort: 'price-asc' }, signal),
    enabled: mswReady,
  })

  return (
    <div className="mx-auto max-w-content px-6 py-6">
      <div className="flex flex-col gap-7 lg:flex-row">
        <AccountSidebar active="offers" />
        <div className="min-w-0 flex-1 lg:max-w-[862px]">
          <h1 className="text-[17px] font-bold text-kurio-cream">{t('account.offers')}</h1>
          <p className="mt-2 text-sm leading-[15px] text-kurio-sand">{t('account.offersSubtitle')}</p>

          <div className="mt-6">
            {isLoading ? (
              <div className="h-8 w-48 skeleton rounded bg-kurio-surface" />
            ) : !nfts || nfts.items.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-lg text-kurio-cream">{t('account.emptyOffers')}</p>
              </div>
            ) : (
              <NftGrid nfts={nfts.items} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}