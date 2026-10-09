import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { favoritesApi, nftsApi, queryKeys } from '@/api'
import { formatEth } from '@/lib/decimal'
import { requireAuthBeforeLoad } from '@/features/auth/require-auth'
import { useMswReady } from '@/lib/msw-ready'

export const Route = createFileRoute('/favorites')({
  beforeLoad: requireAuthBeforeLoad,
  component: FavoritesPage,
})

function FavoritesPage() {
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
    favorites?.nftIds.includes(nft.id),
  )

  return (
    <div className="mx-auto max-w-content px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-2xl font-bold text-kurio-cream">
        {t('favorites.title')}
      </h1>

      {favoriteNfts.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-lg text-kurio-cream">{t('favorites.empty')}</p>
          <Link to="/" className="mt-4 inline-block text-kurio-copper underline">
            {t('favorites.explore')}
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {favoriteNfts.map((nft) => (
            <li key={nft.id} className="group">
              <Link to="/mercado/nft/$nftNumber" params={{ nftNumber: nft.id.replace('nft-', '') }} className="block">
                <div className="overflow-hidden rounded-xl border border-kurio-surface bg-kurio-surface/40">
                  <img
                    src={nft.imageUrl}
                    alt={`Arte do NFT ${nft.name}`}
                    loading="lazy"
                    className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-3 space-y-1">
                  <p className="text-base text-kurio-cream">{nft.name}</p>
                  <p className="text-lg font-bold text-kurio-copper">
                    {formatEth(nft.priceEth)} ETH
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
