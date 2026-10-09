import { useState, type MouseEvent } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'
import { cartApi, favoritesApi, queryKeys } from '@/api'
import type { Nft, NftCategory, NftSort } from '@/api'
import { formatEth } from '@/lib/decimal'
import { useAuth } from '@/features/auth/auth-context'
import { useMswReady } from '@/lib/msw-ready'

export const TAB_SORTS: Record<'all' | 'new' | 'trending', NftSort> = {
  all: 'recent',
  new: 'recent',
  trending: 'rarity',
}

export const CATEGORIES: Array<{ key: NftCategory; count: number }> = [
  { key: 'art', count: 33 },
  { key: 'photography', count: 12 },
  { key: 'music', count: 65 },
  { key: '3d-art', count: 39 },
  { key: 'collectibles', count: 23 },
  { key: 'generative', count: 17 },
  { key: 'sports', count: 19 },
  { key: 'memberships', count: 13 },
  { key: 'utility', count: 18 },
]

export const NETWORKS = [
  { label: 'Ethereum', count: 119 },
  { label: 'Polygon', count: 78 },
  { label: 'Solana', count: 86 },
] as const

export const catalogSearchSchema = z.object({
  q: z.string().optional(),
  categories: z.string().optional(),
  rarities: z.string().optional(),
  network: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  sort: z
    .enum(['recent', 'price-asc', 'price-desc', 'name-asc', 'name-desc', 'rarity'])
    .optional(),
  tab: z.enum(['all', 'new', 'trending']).optional().catch('all'),
  page: z.coerce.number().int().min(1).optional().catch(1),
})

export type CatalogSearch = z.infer<typeof catalogSearchSchema>

export function parseList<T extends string>(value?: string): T[] | undefined {
  const parts = value?.split(',').map((item) => item.trim()).filter(Boolean) as T[] | undefined
  return parts && parts.length > 0 ? parts : undefined
}

export interface CatalogProps {
  tab: 'all' | 'new' | 'trending'
  sort: NftSort
  activeCategories: NftCategory[]
  activeNetworks: string[]
  onTabChange: (tab: 'all' | 'new' | 'trending') => void
  onSortChange: (sort: NftSort) => void
  onToggleCategory: (key: NftCategory) => void
  onToggleNetwork: (key: string) => void
  data?: { items: Nft[]; page: number; totalPages: number; total: number }
  isLoading: boolean
  isError: boolean
  errorMessage?: string
  onRetry: () => void
  page: number
  onPageChange: (page: number) => void
  /** Exibe o badge "RARO" nos cards (Marketplace Page do Figma). */
  showRarityBadge?: boolean
  minPrice?: string
  maxPrice?: string
  onPriceChange?: (min: string, max: string) => void
}

export function CatalogSection(props: CatalogProps) {
  const { t } = useTranslation()
  const tabs: Array<{ key: 'all' | 'new' | 'trending'; label: string }> = [
    { key: 'all', label: t('home.tabs.all') },
    { key: 'new', label: t('home.tabs.new') },
    { key: 'trending', label: t('home.tabs.trending') },
  ]

  return (
    <section id="catalogo" className="mx-auto max-w-content px-4 pt-12 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[310px_1fr]">
        <Sidebar {...props} />

        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1 md:gap-5" role="tablist" aria-label={t('home.tabs.all')}>
              {tabs.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={props.tab === item.key}
                  onClick={() => props.onTabChange(item.key)}
                  className={
                    props.tab === item.key
                      ? 'border-b-2 border-kurio-copper pb-1.5 text-base text-kurio-copper'
                      : 'border-b-2 border-transparent pb-1.5 text-base text-kurio-cream transition-colors hover:text-kurio-copperLight'
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>
            <label className="hidden cursor-pointer items-center gap-1.5 text-base text-kurio-cream md:flex">
              <span>{t('home.sort.label')}</span>
              <select
                value={props.sort}
                onChange={(event) => props.onSortChange(event.target.value as NftSort)}
                aria-label={t('home.sort.label')}
                className="cursor-pointer appearance-none bg-transparent pr-4 text-base text-kurio-cream outline-none"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%23d28a4c' stroke-width='1.5' fill='none'/%3E%3C/svg%3E\")",
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right center',
                }}
              >
                <option className="bg-kurio-surface2" value="recent">{t('home.sort.recent')}</option>
                <option className="bg-kurio-surface2" value="price-asc">{t('home.sort.priceAsc')}</option>
                <option className="bg-kurio-surface2" value="price-desc">{t('home.sort.priceDesc')}</option>
                <option className="bg-kurio-surface2" value="rarity">{t('home.sort.rarity')}</option>
              </select>
            </label>
          </div>

          {props.isError ? (
            <div role="alert" className="rounded-lg border border-kurio-coral/40 bg-kurio-coral/5 p-4">
              <p className="text-sm text-kurio-coral">{props.errorMessage ?? t('common.error')}</p>
              <button
                type="button"
                onClick={props.onRetry}
                className="mt-2 rounded-md border border-kurio-surface px-3 py-1.5 text-xs text-kurio-cream"
              >
                {t('common.retry')}
              </button>
            </div>
          ) : null}

          {props.isLoading ? (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 md:gap-x-[34px] md:gap-y-[72px] max-md:[&>*:nth-child(even)]:mt-8">
              {Array.from({ length: 6 }).map((_, index) => (
                <li key={index} className="space-y-3">
                  <div className="h-[200px] w-full skeleton rounded-xl bg-kurio-surface md:h-[300px]" />
                  <div className="h-4 w-3/4 skeleton rounded bg-kurio-surface" />
                  <div className="h-4 w-1/3 skeleton rounded bg-kurio-surface" />
                </li>
              ))}
            </ul>
          ) : props.data && props.data.items.length === 0 ? (
            <p className="rounded-lg border border-dashed border-kurio-surface p-8 text-center text-sm text-kurio-sand">
              {t('common.empty')}
            </p>
          ) : props.data ? (
            <>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 md:gap-x-[34px] md:gap-y-[72px] max-md:[&>*:nth-child(even)]:mt-8">
                {props.data.items.map((nft) => (
                  <NftCard key={nft.id} nft={nft} showRarityBadge={props.showRarityBadge} />
                ))}
              </ul>

              <nav aria-label={t('home.pagination.nav')} className="mt-10 flex items-center justify-end gap-2">
                {(props.data.totalPages > 0 ? Array.from({ length: props.data.totalPages }) : [1]).map(
                  (_, index) => {
                    const pageNumber = index + 1
                    const active = pageNumber === props.page
                    return (
                      <button
                        key={pageNumber}
                        type="button"
                        aria-current={active ? 'page' : undefined}
                        onClick={() => props.onPageChange(pageNumber)}
                        className={
                          active
                            ? 'flex h-[35px] w-[35px] items-center justify-center rounded-[4px] bg-kurio-copper text-sm font-bold text-kurio-bg'
                            : 'flex h-[35px] w-[35px] items-center justify-center rounded-[4px] border border-[#3f2319] text-sm text-kurio-cream transition-colors hover:bg-kurio-surface'
                        }
                      >
                        {pageNumber}
                      </button>
                    )
                  },
                )}
                <button
                  type="button"
                  disabled={props.page >= props.data.totalPages}
                  onClick={() => props.onPageChange(props.page + 1)}
                  aria-label={t('home.pagination.next')}
                  className="flex h-[35px] w-[35px] items-center justify-center rounded-[4px] border border-[#3f2319] text-kurio-cream transition-colors hover:bg-kurio-surface disabled:opacity-40"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </button>
              </nav>
            </>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function Sidebar({
  activeCategories,
  activeNetworks,
  onToggleCategory,
  onToggleNetwork,
  minPrice,
  maxPrice,
  onPriceChange,
}: Pick<
  CatalogProps,
  'activeCategories' | 'activeNetworks' | 'onToggleCategory' | 'onToggleNetwork' | 'minPrice' | 'maxPrice' | 'onPriceChange'
>) {
  const { t, i18n } = useTranslation()
  const fmt = new Intl.NumberFormat(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const [min, setMin] = useState(() => Number(minPrice ?? 0.02))
  const [max, setMax] = useState(() => Number(maxPrice ?? 12.3))
  const clamp = (value: number, other: number, isMin: boolean) =>
    isMin ? Math.min(value, other - 0.01) : Math.max(value, other + 0.01)
  const pct = (value: number) => `${((value - 0.02) / (12.3 - 0.02)) * 100}%`

  return (
    <aside className="hidden space-y-6 lg:block" aria-label={t('home.filters')}>
      <div className="bg-kurio-surface p-5">
        <p className="font-mono text-[18px] font-bold text-kurio-cream2">{t('home.filters')}</p>

        <ul className="mt-3 -mx-3">
          {CATEGORIES.map((category) => {
            const active = activeCategories.includes(category.key)
            return (
              <li key={category.key}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => onToggleCategory(category.key)}
                  className={`mx-3 flex h-10 w-[calc(100%-1.5rem)] items-center justify-between text-[15px] transition-colors ${
                    active ? 'text-kurio-copperLight' : 'text-kurio-sand hover:text-kurio-cream'
                  }`}
                >
                  <span>{t(`home.categories.${category.key}`)}</span>
                  <span className="font-bold">({category.count})</span>
                </button>
              </li>
            )
          })}
        </ul>

        <p className="mt-10 font-mono text-[18px] font-bold text-kurio-cream2">{t('home.priceRange')}</p>
        <div className="mt-3 px-3">
          {/* h-6 (24px): casa com a altura mínima de alvo do Lighthouse. */}
          <div className="relative h-6 w-full">
            <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-kurio-surface2" aria-hidden />
            <div
              className="absolute top-1/2 h-1 -translate-y-1/2 bg-kurio-copper"
              style={{ left: pct(min), right: `calc(100% - ${pct(max)})` }}
              aria-hidden
            />
            <input
              type="range"
              min={0.02}
              max={12.3}
              step={0.01}
              value={min}
              onChange={(event) => setMin(clamp(Number(event.target.value), max, true))}
              aria-label={t('home.priceRange')}
              className="range-thumb pointer-events-none absolute inset-0 h-6 w-full appearance-none bg-transparent"
            />
            <input
              type="range"
              min={0.02}
              max={12.3}
              step={0.01}
              value={max}
              onChange={(event) => setMax(clamp(Number(event.target.value), min, false))}
              aria-label={t('home.priceRange')}
              className="range-thumb pointer-events-none absolute inset-0 h-6 w-full appearance-none bg-transparent"
            />
          </div>
          <p className="mt-3 text-[15px] text-kurio-cream2">
            {t('home.priceRangeLabel', { min: fmt.format(min), max: fmt.format(max) })}
          </p>
          <button
            type="button"
            onClick={() => onPriceChange?.(String(min), String(max))}
            className="mt-3 h-9 w-[92px] rounded-md bg-kurio-copper text-base font-bold text-kurio-bg transition-colors hover:bg-kurio-copperLight"
          >
            {t('home.apply')}
          </button>
        </div>

        <p className="mt-10 font-mono text-[18px] font-bold text-kurio-cream2">{t('home.network')}</p>
        <ul className="mt-3 -mx-3">
          {NETWORKS.map((network) => (
            <li
              key={network.label}
              className="mx-3 flex h-10 w-[calc(100%-1.5rem)] items-center justify-between text-[15px] transition-colors"
            >
              <button
                type="button"
                onClick={() => onToggleNetwork?.(network.label)}
                className={`flex w-full items-center justify-between ${activeNetworks.includes(network.label) ? 'text-kurio-copperLight' : 'text-kurio-sand hover:text-kurio-cream'}`}
              >
                <span>{network.label}</span>
                <span className="font-bold">({network.count})</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <FeaturedBanner />
    </aside>
  )
}

export function FeaturedBanner() {
  const { t } = useTranslation()
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-kurio-copper/10 to-kurio-copper/[0.03] pt-6">
      <div className="px-5">
        <p className="font-mono text-2xl font-bold text-kurio-copperLight">{t('home.featured')}</p>
        <p className="mt-4 text-center font-mono text-[22px] font-bold text-kurio-cream2">{t('home.limited')}</p>
      </div>
      <img
        src="/nfts/nft-artwork-04-640.webp"
        alt={t('home.featured')}
        width={640}
        height={368}
        className="mt-4 h-[368px] w-full rounded-[22px] object-cover"
        loading="lazy"
      />
      <span
        aria-hidden
        className="absolute left-[38px] top-[105px] h-[15px] w-[15px] rounded-full bg-gradient-to-br from-kurio-copper/30 to-transparent"
      />
      <span
        aria-hidden
        className="absolute left-[248px] top-[343px] h-[45px] w-[45px] rounded-full bg-gradient-to-br from-kurio-copper/30 to-transparent"
      />
    </div>
  )
}

export function NftCard({ nft, showRarityBadge = false }: { nft: Nft; showRarityBadge?: boolean }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const mswReady = useMswReady()
  const art640 = nft.imageUrl.replace('-1280', '-640')
  const nftNumber = nft.id.replace('nft-', '')
  const queryClient = useQueryClient()

  // Query para verificar se é favorito
  const { data: favorites } = useQuery({
    queryKey: queryKeys.favorites,
    queryFn: ({ signal }) => favoritesApi.list(signal),
    enabled: mswReady && isAuthenticated,
  })
  const isFavorite = isAuthenticated && (favorites?.nftIds.includes(nft.id) ?? false)

  const addToCart = useMutation({
    mutationFn: (editionId: string) =>
      cartApi.addItem({ nftId: nft.id, editionId, quantity: 1 }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart })
      toast.success(t('nft.added'))
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t('common.error'))
    },
  })

  const toggleFavorite = useMutation({
    mutationFn: () => (isFavorite ? favoritesApi.remove(nft.id) : favoritesApi.add(nft.id)),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.favorites })
      const previous = queryClient.getQueryData<{ nftIds: string[] }>(queryKeys.favorites)
      queryClient.setQueryData<{ nftIds: string[] }>(queryKeys.favorites, (old) =>
        old
          ? {
              nftIds: isFavorite
                ? old.nftIds.filter((id) => id !== nft.id)
                : [...old.nftIds, nft.id],
            }
          : old,
      )
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.favorites, context.previous)
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.favorites })
    },
  })

  const handleAddToCart = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    const edition =
      nft.editions.find((entry) => entry.available > 0) ?? nft.editions[0]
    if (edition) addToCart.mutate(edition.id)
  }

  const handleToggleFavorite = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (!isAuthenticated) {
      void navigate({ to: '/login', search: { redirect: `/mercado/nft/${nftNumber}` } })
      return
    }
    toggleFavorite.mutate()
  }
  return (
    <li data-aos="fade-up" className="group">
      <Link to="/mercado/nft/$nftNumber" params={{ nftNumber }} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kurio-copper">
        <div className="relative h-[200px] overflow-hidden rounded-xl bg-gradient-to-b from-kurio-surface to-kurio-surface2 md:h-[300px]">
          <img
            src={nft.imageUrl}
            srcSet={`${art640} 640w, ${nft.imageUrl} 1280w`}
            sizes="(max-width: 768px) 45vw, 258px"
            alt={`Arte do NFT ${nft.name}`}
            width={250}
            height={250}
            loading="lazy"
            className="mx-auto mt-3 h-[168px] w-[168px] rounded-xl object-cover transition-transform duration-300 group-hover:scale-[1.03] md:absolute md:left-1/2 md:top-[31px] md:mt-0 md:h-[250px] md:w-[250px] md:-translate-x-1/2 md:rounded-none"
          />
          {nft.rarity === 'legendary' ? (
            <span
              className={`absolute left-0 top-4 flex h-8 w-[68px] items-center justify-center rounded-r-md bg-kurio-copper text-sm font-bold text-kurio-bg md:top-3.5 md:h-[29px] md:w-20 md:text-[13px] md:font-medium${
                showRarityBadge ? '' : ' md:hidden'
              }`}
            >
              {t('nft.badgeRarity')}
            </span>
          ) : null}
          <div className="absolute right-2.5 top-3 flex flex-col gap-2 md:opacity-0 md:transition-opacity md:group-hover:opacity-100 md:group-focus-within:opacity-100">
            <button
              type="button"
              aria-label={t('nft.addToCart')}
              onClick={handleAddToCart}
              disabled={nft.totalAvailable === 0 || addToCart.isPending}
              className="hidden h-9 w-9 items-center justify-center rounded-lg bg-kurio-surface2/90 text-kurio-cream transition-colors hover:text-kurio-copper disabled:cursor-not-allowed disabled:opacity-50 md:flex"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6zM3 6h18M16 10a4 4 0 0 1-8 0" />
              </svg>
            </button>
            <button
              type="button"
              aria-label={isFavorite ? t('nft.unfavorite') : t('nft.favorite')}
              onClick={handleToggleFavorite}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-kurio-surface2/90 transition-colors md:h-9 md:w-9"
              style={{ color: isFavorite ? '#f87171' : 'inherit' }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={isFavorite ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={1.8}
                aria-hidden
              >
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21.2l7.7-7.7 1.1-1a5.5 5.5 0 0 0 0-7.9z" />
              </svg>
            </button>
          </div>
        </div>
        <div className="mt-2 space-y-0.5 px-2 md:mt-3 md:space-y-3 md:px-0">
          <p className="font-mono text-[15px] text-kurio-cream md:text-base">{nft.name}</p>
          <p className="flex items-baseline gap-3 font-mono text-base font-bold text-kurio-copper md:text-[18px]">
            {formatEth(nft.priceEth)} ETH
            {nft.oldPriceEth ? (
              <span className="text-sm font-normal text-kurio-bronze line-through">{nft.oldPriceEth} ETH</span>
            ) : null}
          </p>
        </div>
      </Link>
    </li>
  )
}
