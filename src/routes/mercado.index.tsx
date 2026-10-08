import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { nftsApi, queryKeys, type NftCategory, type NftListParams } from '@/api'
import {
  catalogSearchSchema,
  parseList,
  CatalogSection,
  TAB_SORTS,
  type CatalogSearch,
} from '@/components/catalog/catalog'

export const Route = createFileRoute('/mercado/')({
  validateSearch: (search): CatalogSearch => {
    const parsed = catalogSearchSchema.safeParse(search)
    return parsed.success ? parsed.data : {}
  },
  component: MarketplacePage,
})

function MarketplacePage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const page = search.page ?? 1
  const tab = search.tab ?? 'all'
  const activeCategories = parseList<NftCategory>(search.categories)
  const activeNetworks = parseList(search.network)
  const params: NftListParams = {
    q: search.q,
    categories: activeCategories,
    rarities: parseList(search.rarities),
    networks: activeNetworks,
    minPrice: search.minPrice,
    maxPrice: search.maxPrice,
    sort: search.sort ?? TAB_SORTS[tab],
    page,
    pageSize: 9,
  }

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.nfts.list(params),
    queryFn: ({ signal }) => nftsApi.list(params, signal),
    placeholderData: (previous) => previous,
  })

  const updateSearch = (patch: Partial<CatalogSearch>) => {
    void navigate({ search: (previous) => ({ ...previous, ...patch }) })
  }

  const toggleCategory = (key: NftCategory) => {
    const current = new Set(activeCategories ?? [])
    if (current.has(key)) current.delete(key)
    else current.add(key)
    updateSearch({
      categories: current.size ? [...current].join(',') : undefined,
      page: undefined,
    })
  }

  const toggleNetwork = (key: string) => {
    const current = new Set(activeNetworks ?? [])
    if (current.has(key)) current.delete(key)
    else current.add(key)
    updateSearch({
      network: current.size ? [...current].join(',') : undefined,
      page: undefined,
    })
  }

  return (
    <div className="pb-24">
      <MarketplaceBanner />
      <CatalogSection
        tab={tab}
        sort={search.sort ?? TAB_SORTS[tab]}
        activeCategories={activeCategories ?? []}
        activeNetworks={activeNetworks ?? []}
        onTabChange={(next) => updateSearch({ tab: next, sort: undefined, page: undefined })}
        onSortChange={(sort) => updateSearch({ sort, page: undefined })}
        onToggleCategory={toggleCategory}
        onToggleNetwork={toggleNetwork}
        minPrice={search.minPrice}
        maxPrice={search.maxPrice}
        onPriceChange={(min, max) => updateSearch({ minPrice: min, maxPrice: max, page: undefined })}
        data={data}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error instanceof Error ? error.message : undefined}
        onRetry={() => void refetch()}
        page={page}
        onPageChange={(nextPage) => updateSearch({ page: nextPage })}
        showRarityBadge
      />
    </div>
  )
}

/** Main Banner (1200x450) da Marketplace Page do Figma. */
function MarketplaceBanner() {
  const { t } = useTranslation()
  return (
    <section data-aos="fade-up" className="mx-auto max-w-content px-4 pt-6 sm:px-6">
      <div className="relative min-h-[380px] md:min-h-[450px]">
        <div className="relative z-10 max-w-[600px] px-8 pt-[68px] md:px-10">
          <p className="text-sm font-medium text-kurio-cream2">{t('home.welcome')}</p>
          <h1 className="mt-2 whitespace-pre-line text-[30px] font-bold leading-[1.25] text-kurio-cream sm:text-[43px] sm:leading-[70px]">
            {t('home.heroTitle')}
          </h1>
          <p className="mt-1 max-w-[557px] text-sm leading-relaxed text-kurio-sand">
            {t('home.marketplaceSubtitle')}
          </p>
          <a
            href="#catalogo"
            className="mt-11 inline-flex h-10 w-[140px] items-center justify-center rounded-md bg-kurio-copper text-base font-bold tracking-wide text-kurio-bg transition-colors hover:bg-kurio-copperLight"
          >
            {t('home.explore')}
          </a>
        </div>
        <img
          src="/nfts/nft-artwork-03-1280.webp"
          alt=""
          aria-hidden
          className="absolute right-0 top-0 hidden h-full w-[450px] rounded-2xl object-cover md:block"
          width={450}
          height={450}
        />
        <img
          src="/nfts/nft-artwork-03-640.webp"
          alt=""
          aria-hidden
          className="absolute right-[260px] top-[280px] hidden h-[120px] w-[120px] rounded-2xl object-cover md:block"
          width={120}
          height={120}
        />
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2" aria-hidden>
          <span className="h-2 w-2 rounded-full bg-kurio-copper" />
          <span className="h-2 w-2 rounded-full bg-kurio-copper" />
          <span className="h-2 w-2 rounded-full bg-kurio-copper" />
        </div>
      </div>
    </section>
  )
}
