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
import { MobileSearchBar } from '@/components/layout/mobile-search-bar'
import { useMswReady } from '@/lib/msw-ready'

export const Route = createFileRoute('/')({
  validateSearch: (search): CatalogSearch => {
    const parsed = catalogSearchSchema.safeParse(search)
    return parsed.success ? parsed.data : {}
  },
  component: HomePage,
})

function HomePage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const mswReady = useMswReady()

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
    pageSize: 12,
  }

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.nfts.list(params),
    queryFn: ({ signal }) => nftsApi.list(params, signal),
    placeholderData: (previous) => previous,
    enabled: mswReady,
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
    <div className="md:pb-24">
      <HeroSection onSearch={(query) => updateSearch({ q: query || undefined, page: undefined })} />
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
      />
      <PromosSection />
      <BlogSection />
    </div>
  )
}

/* ------------------------------------------------------------------ */

function HeroSection({ onSearch }: { onSearch?: (query: string) => void }) {
  const { t } = useTranslation()
  return (
    <>
      <section className="md:hidden">
        <MobileSearchBar onSearch={onSearch} />
        <div className="relative mx-6 mt-4 h-[190px] overflow-hidden rounded-2xl bg-gradient-to-br from-kurio-copper/20 via-kurio-surface to-kurio-copper/10">
          <span
            aria-hidden
            className="absolute -left-20 -top-8 h-[248px] w-[248px] rounded-full bg-gradient-to-br from-kurio-copper/25 to-transparent blur-[2px]"
          />
          <span
            aria-hidden
            className="absolute -right-6 -top-2.5 h-[248px] w-[248px] rounded-full bg-gradient-to-br from-kurio-copper/10 to-transparent"
          />
          <div className="relative z-10 flex h-full items-start justify-between gap-2 px-4 pt-1.5">
            <div className="w-[188px]">
              <p className="text-sm font-medium leading-4 text-kurio-cream">{t('home.welcome')}</p>
              <h1 className="mt-1.5 whitespace-pre-line text-lg font-bold leading-[29px] text-kurio-cream">
                {t('home.heroTitleMobile')}
              </h1>
              <p className="mt-1.5 text-xs leading-[18px] text-kurio-sand">{t('home.heroSubtitleMobile')}</p>
              <a
                href="#catalogo"
                className="mt-0 inline-flex items-center gap-2 text-sm font-bold text-kurio-copper"
              >
                {t('home.explore')}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <div className="relative mt-[5px] h-[146px] w-[138px] shrink-0">
              <img
                src="/nfts/nft-artwork-03-276.webp"
                alt="Arte do NFT Emerald Ape #042"
                width={138}
                height={138}
                fetchPriority="high"
                className="h-[138px] w-[138px] rounded-2xl object-cover"
              />
              <img
                src="/nfts/nft-artwork-04-128.webp"
                alt="Arte do NFT Sage Nomad #009"
                width={58}
                height={58}
                className="absolute bottom-0 left-3.5 h-[58px] w-[58px] rounded-xl object-cover"
              />
            </div>
          </div>
          <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 gap-[4.5px]" aria-hidden>
            <span className="h-[7px] w-[7px] rounded-full bg-kurio-copper" />
            <span className="h-[7px] w-[7px] rounded-full bg-kurio-copper" />
            <span className="h-[7px] w-[7px] rounded-full bg-kurio-copper" />
          </div>
        </div>
      </section>
      <section data-aos="fade-up" className="mx-auto hidden max-w-content px-4 pt-6 sm:px-6 md:block">
        <div className="grid min-h-[450px] items-center gap-8 md:grid-cols-[minmax(0,600px)_450px] md:gap-x-[110px]">
          <div className="flex flex-col items-start py-8">
            <p className="text-sm font-medium text-kurio-cream">{t('home.welcome')}</p>
            <h1 className="mt-2 whitespace-pre-line text-[34px] font-bold leading-[1.3] text-kurio-cream sm:text-[43px] sm:leading-[70px]">
              {t('home.heroTitle')}
            </h1>
            <p className="mt-1 max-w-[557px] text-sm leading-relaxed text-kurio-sand">{t('home.heroSubtitle')}</p>
            <a
              href="#catalogo"
              className="mt-8 inline-flex h-10 w-35 items-center justify-center rounded-md bg-kurio-copper text-base font-bold tracking-wide text-kurio-bg transition-colors hover:bg-kurio-copperLight px-4"
            >
              {t('home.explore')}
            </a>
            <div className="mt-11 flex w-full justify-end gap-2" aria-hidden>
              <span className="h-2 w-2 rounded-full bg-kurio-copper" />
              <span className="h-2 w-2 rounded-full bg-kurio-copper" />
              <span className="h-2 w-2 rounded-full bg-kurio-copper" />
            </div>
          </div>
          <img
            src="/nfts/nft-artwork-03-1280.webp"
            alt="Arte de destaque da coleção Kurio"
            className="h-[450px] w-full rounded-3xl object-cover"
            width={450}
            height={450}
            loading="lazy"
          />
        </div>
      </section>
    </>
  )
}

/* ------------------------------------------------------------------ */

function PromosSection() {
  const { t } = useTranslation()
  const promos = [
    { title: t('home.promos.genesisTitle'), text: t('home.promos.genesisText'), image: '/nfts/nft-artwork-03-640.webp', nftName: 'Emerald Ape #042' },
    { title: t('home.promos.curatedTitle'), text: t('home.promos.curatedText'), image: '/nfts/nft-artwork-05-640.webp', nftName: 'Neon Vessel #552' },
  ]
  return (
    <section className="mx-auto mt-24 max-w-content px-4 sm:px-6">
      <div className="grid gap-7 md:grid-cols-2">
        {promos.map((promo, index) => (
          <article
            key={index}
            data-aos="fade-up"
            className="flex min-h-[250px] overflow-hidden rounded-xl bg-kurio-surface"
          >
            {/* Primeira imagem não-lazy e com prioridade alta: é o LCP na home mobile */}
            <img
              src={promo.image}
              srcSet={`${promo.image.replace('-640', '-384')} 384w, ${promo.image} 640w, ${promo.image.replace('-640', '-1280')} 1280w`}
              sizes="(max-width: 767px) 44vw, 340px"
              alt={`Arte do NFT ${promo.nftName}`}
              width={640}
              height={500}
              className="w-1/2 object-cover"
              loading={index === 0 ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : 'auto'}
            />
            <div className="flex flex-1 flex-col items-end justify-between px-6 py-6 text-right">
              <div>
                <p className="whitespace-pre-line text-lg font-bold leading-6 text-kurio-cream">{promo.title}</p>
                <p className="mt-2 text-sm leading-[1.6] text-kurio-sand">{promo.text}</p>
              </div>
              <span className="mt-6 inline-flex h-10 w-35 shrink-0 items-center justify-center gap-1 rounded-md bg-kurio-copper text-sm font-medium text-kurio-bg px-4">
                {t('home.promos.exploreButton')}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */

function BlogSection() {
  const { t } = useTranslation()
  const articles = t('home.blog.articles', { returnObjects: true }) as unknown as Array<{
    date: string
    readTime: string
    title: string
    description: string
  }>
  const images = [
    '/nfts/nft-artwork-05-640.webp',
    '/nfts/nft-artwork-03-640.webp',
    '/nfts/nft-artwork-04-640.webp',
    '/nfts/nft-artwork-09-640.webp',
  ]

  return (
    <section className="mx-auto mt-24 max-w-content px-4 sm:px-6">
      <div className="space-y-3 text-center">
        <h2 className="text-[28px] font-bold leading-tight text-kurio-cream2">{t('home.blog.title')}</h2>
        <p className="text-sm text-kurio-sand">{t('home.blog.subtitle')}</p>
      </div>
      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {articles.map((article, index) => (
          <li
            key={article.title}
            data-aos="fade-up"
            className="flex flex-col justify-between overflow-hidden rounded-lg bg-kurio-surface"
          >
            <img
              src={images[index % images.length]}
              alt={article.title}
              width={640}
              height={195}
              className="h-[195px] w-full object-cover"
              loading="lazy"
            />
            <div className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-3">
              <p className="text-xs font-medium text-kurio-sand">
                {article.date}&nbsp;&nbsp;|&nbsp;&nbsp;{article.readTime}
              </p>
              <p className="text-base font-semibold leading-snug text-kurio-cream2">{article.title}</p>
              <p className="text-xs font-medium leading-normal text-kurio-sand">{article.description}</p>
              <span className="mt-auto text-xs font-semibold text-kurio-copperLight">
                {t('common.seeMore')}
                <span className="ml-1.5" aria-hidden>→</span>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}