import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { favoritesApi, nftsApi, queryKeys } from '@/api'
import { requireAuthBeforeLoad } from '@/features/auth/require-auth'
import { useMswReady } from '@/lib/msw-ready'
import { AccountSidebar } from '@/components/account/account-sidebar'
import { NftGrid } from '@/components/account/nft-grid'

export const Route = createFileRoute('/account/watchlist')({
  beforeLoad: requireAuthBeforeLoad,
  component: WatchlistPage,
})

function WatchlistPage() {
  const { t } = useTranslation()
  const mswReady = useMswReady()

  const { data: favorites } = useQuery({
    queryKey: queryKeys.favorites,
    queryFn: ({ signal }) => favoritesApi.list(signal),
    enabled: mswReady,
  })
  const { data: nfts } = useQuery({
    queryKey: queryKeys.nfts.list({ page: 1, pageSize: 48, sort: 'recent' }),
    queryFn: ({ signal }) => nftsApi.list({ page: 1, pageSize: 48, sort: 'recent' }, signal),
    enabled: mswReady,
  })

  const favoriteNfts = (nfts?.items ?? []).filter((nft) =>
    (favorites?.nftIds ?? []).includes(nft.id),
  )

  return (
    <div className="mx-auto max-w-content px-6 py-6">
      <div className="flex flex-col gap-7 lg:flex-row">
        <AccountSidebar active="watchlist" />
        <div className="min-w-0 flex-1 lg:max-w-[862px]">
          <h1 className="text-[17px] font-bold text-kurio-cream">{t('account.watchlist')}</h1>
          <p className="mt-2 text-sm leading-[15px] text-kurio-sand">{t('account.watchlistSubtitle')}</p>

          <div className="mt-6">
            {favoriteNfts.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-lg text-kurio-cream">{t('favorites.empty')}</p>
              </div>
            ) : (
              <NftGrid nfts={favoriteNfts} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}