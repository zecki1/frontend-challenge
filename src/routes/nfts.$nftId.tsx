import { useRef, useState } from 'react'
import { createFileRoute, Link, useNavigate, useRouter } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Heart,
  Linkedin,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  Twitter,
} from 'lucide-react'
import { cartApi, favoritesApi, nftsApi, queryKeys } from '@/api'
import { ApiError } from '@/lib/api-error'
import { formatEth } from '@/lib/decimal'
import { useAuth } from '@/features/auth/auth-context'

export const Route = createFileRoute('/nfts/$nftId')({
  component: NftDetailPage,
})

const REVIEW_COUNT = 19

function NftDetailPage() {
  const { nftId } = Route.useParams()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [quantity, setQuantity] = useState(1)
  const [editionId, setEditionId] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [mobileSlide, setMobileSlide] = useState(0)
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details')
  const galleryRef = useRef<HTMLDivElement>(null)

  const { data: nft, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.nfts.detail(nftId),
    queryFn: ({ signal }) => nftsApi.detail(nftId, signal),
    retry: false,
  })

  const { data: favorites } = useQuery({
    queryKey: queryKeys.favorites,
    queryFn: ({ signal }) => favoritesApi.list(signal),
    enabled: isAuthenticated,
  })

  const isFavorite = isAuthenticated && (favorites?.nftIds.includes(nftId) ?? false)

  const addToCart = useMutation({
    mutationFn: (selectedEditionId: string) =>
      cartApi.addItem({ nftId, editionId: selectedEditionId, quantity }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart })
    },
  })

  const toggleFavorite = useMutation({
    mutationFn: () => (isFavorite ? favoritesApi.remove(nftId) : favoritesApi.add(nftId)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.favorites })
    },
  })

  const onToggleFavorite = () => {
    if (!isAuthenticated) {
      void navigate({ to: '/login', search: { redirect: `/nfts/${nftId}` } })
      return
    }
    toggleFavorite.mutate()
  }

  const onGalleryScroll = () => {
    const el = galleryRef.current
    if (!el || el.clientWidth === 0) return
    setMobileSlide(Math.round(el.scrollLeft / el.clientWidth))
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-content px-4 py-10 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-2xl bg-kurio-surface motion-reduce:animate-none" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded bg-kurio-surface motion-reduce:animate-none" />
            <div className="h-6 w-1/3 animate-pulse rounded bg-kurio-surface motion-reduce:animate-none" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !nft) {
    const notFound = error instanceof ApiError && error.code === 'not_found'
    return (
      <section role="alert" className="mx-auto max-w-content px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-kurio-cream">
          {notFound ? t('nft.notFoundTitle') : t('common.error')}
        </h1>
        <p className="mt-2 text-kurio-sand">
          {notFound ? t('nft.notFoundText') : (error instanceof Error ? error.message : t('common.error'))}
        </p>
        <Link to="/" className="mt-4 inline-block text-kurio-copper underline">
          {t('nft.backToCatalog')}
        </Link>
      </section>
    )
  }

  const selectedEdition =
    nft.editions.find((edition) => edition.id === editionId) ?? nft.editions[0]
  const maxQuantity = Math.max(1, selectedEdition?.available ?? 1)
  const isSoldOut = !selectedEdition || selectedEdition.available <= 0
  const images = nft.gallery.length > 0 ? nft.gallery : [nft.imageUrl]

  const selectEdition = (id: string) => {
    setEditionId(id)
    setQuantity(1)
  }

  const editionChips = (
    <>
      {nft.editions.map((edition) => {
        const selected = selectedEdition?.id === edition.id
        return (
          <button
            key={edition.id}
            type="button"
            disabled={isSoldOut}
            onClick={() => selectEdition(edition.id)}
            aria-pressed={selected}
            className={`flex h-7 items-center rounded-full border px-2.5 text-sm transition-colors disabled:opacity-50 ${
              selected
                ? 'border-kurio-copper font-medium text-kurio-copper'
                : 'border-[#3f2319] text-kurio-sand hover:border-kurio-copper'
            }`}
          >
            {edition.total === 1 ? '1/1' : `1/${edition.total}`}
          </button>
        )
      })}
      <span className="flex h-7 items-center rounded-full border border-[#3f2319] px-2.5 text-sm text-kurio-sand">
        {t('nft.openEdition')}
      </span>
    </>
  )

  const stepperButtons = (className: string) => (
    <>
      <button
        type="button"
        aria-label={t('nft.decrease')}
        disabled={quantity <= 1 || isSoldOut}
        onClick={() => setQuantity((current) => Math.max(1, current - 1))}
        className={`flex items-center justify-center bg-kurio-copper text-black transition-opacity disabled:opacity-50 ${className}`}
      >
        <Minus className="size-4" aria-hidden />
      </button>
      <span className="text-center font-medium text-kurio-cream" aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        aria-label={t('nft.increase')}
        disabled={quantity >= maxQuantity || isSoldOut}
        onClick={() => setQuantity((current) => Math.min(maxQuantity, current + 1))}
        className={`flex items-center justify-center bg-kurio-copper text-black transition-opacity disabled:opacity-50 ${className}`}
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </>
  )

  const cartMessage = addToCart.isSuccess ? (
    <p role="status" className="text-sm text-kurio-copper">
      {t('nft.added')}{' '}
      <Link to="/cart" className="underline">{t('nft.viewCart')}</Link>
    </p>
  ) : null

  const cartError = addToCart.isError ? (
    <p role="alert" className="text-sm text-kurio-coral">
      {addToCart.error instanceof Error ? addToCart.error.message : t('common.error')}
    </p>
  ) : null

  return (
    <>
      <div className="md:hidden">
        <div className="relative overflow-hidden bg-gradient-to-br from-kurio-copper/20 via-kurio-surface to-kurio-copper/10 pb-[84px] pt-[23px]">
          <div className="flex h-[35px] items-center justify-between px-7">
            <button
              type="button"
              aria-label={t('nft.back')}
              onClick={() => router.history.back()}
              className="flex size-[35px] items-center justify-center rounded-full border border-[#3f2319] bg-kurio-surface2 text-kurio-cream transition-colors hover:text-kurio-copper"
            >
              <ArrowLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              aria-label={`${t('nft.favorite')} ${nft.name}`}
              aria-pressed={isFavorite}
              onClick={onToggleFavorite}
              className="flex size-[35px] items-center justify-center rounded-full border border-[#3f2319] bg-kurio-surface2 transition-colors"
            >
              <Heart
                aria-hidden
                className={
                  isFavorite
                    ? 'size-4 fill-kurio-copper text-kurio-copper'
                    : 'size-4 text-kurio-copper'
                }
              />
            </button>
          </div>
          <div className="relative mx-7 mt-2 h-[356px]">
            <div
              ref={galleryRef}
              onScroll={onGalleryScroll}
              className="flex h-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {images.map((image, index) => (
                <img
                  key={`${image}-${index}`}
                  src={image}
                  alt={
                    index === 0
                      ? t('nft.mainImageAria', { name: nft.name })
                      : t('nft.galleryAria', { index: index + 1 })
                  }
                  className="h-full w-full shrink-0 snap-center rounded-3xl object-cover"
                />
              ))}
            </div>
            <div className="absolute inset-x-0 bottom-[50px] flex justify-center gap-2" aria-hidden>
              {images.map((_, index) =>
                index === mobileSlide ? (
                  <span key={index} className="h-[7px] w-7 rounded-full bg-kurio-copper" />
                ) : (
                  <span key={index} className="size-[7px] rounded-full bg-kurio-copper" />
                ),
              )}
            </div>
          </div>
        </div>

        <div className="relative z-10 -mt-[114px] bg-kurio-surface px-6 pt-8">
          <div className="flex h-[27px] items-center justify-between gap-3">
            <h1 className="truncate text-xl font-bold text-kurio-cream">{nft.name}</h1>
            <span className="flex h-[27px] shrink-0 items-center gap-1 rounded-full border border-kurio-copper px-2 text-sm">
              <Star className="size-3.5 fill-kurio-copper text-kurio-copper" aria-hidden />
              <span className="font-medium text-kurio-cream">{t('nft.rating')}</span>
              <span className="text-kurio-sand">({REVIEW_COUNT})</span>
            </span>
          </div>

          <p className="mt-3 text-sm leading-6 text-kurio-sand">{t('nft.aboutText')}</p>

          <div className="mt-3">
            <p className="text-[15px] font-bold text-kurio-cream">{t('nft.edition')}</p>
            <div className="mt-2 flex flex-wrap gap-3">{editionChips}</div>
          </div>

          <div className="mt-3 space-y-3 text-[15px] leading-5 text-kurio-bronze">
            <p>{t('nft.tokenId')}: #{nft.id.replace('nft-', '').padStart(4, '0')}</p>
            <p>{t('nft.collectionLabel')}: {nft.collection}</p>
            <p>{t('nft.attributesLabel')}: {t('nft.attributesValue')}</p>
          </div>

          <div className="mt-[38px] pb-[34px]">
            <div className="flex h-[30px] items-center justify-between gap-4">
              <div
                role="group"
                aria-label={t('nft.quantity')}
                className="flex items-center gap-2.5"
              >
                <span className="text-[15px] font-medium text-kurio-sand">{t('nft.qtyShort')}</span>
                <div className="flex items-center gap-2.5">{stepperButtons('h-[30px] w-5 rounded-full')}</div>
              </div>
              <span className="text-xl font-bold text-kurio-copper">
                {formatEth(nft.priceEth)} ETH
              </span>
            </div>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                disabled={isSoldOut || addToCart.isPending}
                onClick={() => selectedEdition && addToCart.mutate(selectedEdition.id)}
                className="h-[60px] w-[196px] rounded-full bg-gradient-to-b from-kurio-copper to-kurio-copperLight text-base font-bold text-kurio-bg transition-opacity disabled:opacity-50"
              >
                {isSoldOut ? t('nft.soldOut') : addToCart.isPending ? t('nft.adding') : t('nft.buyNow')}
              </button>
              <Link
                to="/cart"
                aria-label={t('nav.carrinho')}
                className="flex size-[60px] items-center justify-center rounded-full border border-[#3f2319] bg-kurio-surface2 text-kurio-cream transition-colors hover:text-kurio-copper"
              >
                <ShoppingBag className="size-5" aria-hidden />
              </Link>
            </div>
            {cartError ? <div className="mt-3">{cartError}</div> : null}
            {cartMessage ? <div className="mt-3">{cartMessage}</div> : null}
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        <div className="mx-auto max-w-content px-6 pb-24 pt-6">
          <nav aria-label="Breadcrumb" className="text-[15px] font-bold text-kurio-cream">
            <Link to="/" className="hover:text-kurio-copper">{t('nav.inicio')}</Link>
            <span className="mx-2" aria-hidden>/</span>
            <Link to="/mercado" className="hover:text-kurio-copper">{t('nav.mercado')}</Link>
          </nav>

          <div className="mt-3 flex flex-col gap-8 lg:flex-row">
            <div className="flex w-full max-w-[573px] gap-7 lg:w-[573px]">
              {images.length > 1 ? (
                <ul className="flex w-[100px] shrink-0 flex-col gap-4" aria-label={t('nft.thumbnailAria')}>
                  {images.map((image, index) => (
                    <li key={`${image}-${index}`}>
                      <button
                        type="button"
                        onClick={() => setSelectedImage(index)}
                        aria-label={t('nft.galleryAria', { index: index + 1 })}
                        aria-pressed={selectedImage === index}
                        className={`block size-[100px] overflow-hidden rounded-md bg-kurio-surface opacity-100 ring-2 ring-offset-2 ring-offset-kurio-bg transition ${
                          selectedImage === index
                            ? 'ring-kurio-copper'
                            : 'opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={image} alt="" aria-hidden className="size-full object-cover" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="relative h-[444px] flex-1 rounded-md bg-kurio-surface p-5">
                <img
                  src={images[selectedImage] ?? nft.imageUrl}
                  alt={t('nft.mainImageAria', { name: nft.name })}
                  className="size-full rounded-3xl object-cover"
                />
                <button
                  type="button"
                  aria-label={`${t('nft.favorite')} ${nft.name}`}
                  aria-pressed={isFavorite}
                  onClick={onToggleFavorite}
                  className="absolute right-3 top-[13px] flex size-[30px] items-center justify-center rounded-full bg-kurio-surface2 transition-colors hover:text-kurio-copper"
                >
                  <Heart
                    aria-hidden
                    className={
                      isFavorite
                        ? 'size-5 fill-kurio-copper text-kurio-copper'
                        : 'size-5 text-kurio-cream'
                    }
                  />
                </button>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-[28px] font-bold leading-[37px] text-kurio-cream">{nft.name}</h1>
              <div className="mt-3 flex items-center justify-between gap-4">
                <p className="text-[22px] font-bold text-kurio-copper">
                  {formatEth(nft.priceEth)} ETH
                </p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      aria-hidden
                      className="size-[15px] fill-kurio-copper text-kurio-copper"
                    />
                  ))}
                  <span className="ml-1 text-[15px] text-kurio-cream">
                    {t('nft.reviewCount', { count: REVIEW_COUNT })}
                  </span>
                </div>
              </div>
              <div className="mt-3 w-full max-w-[573px] border-b border-kurio-copper" />

              <div className="mt-3.5">
                <p className="text-[15px] font-bold text-kurio-cream">{t('nft.about')}</p>
                <p className="mt-3 max-w-[574px] text-sm leading-6 text-kurio-sand">
                  {t('nft.aboutText')}
                </p>
              </div>

              <div className="mt-3.5">
                <p className="text-[15px] font-bold text-kurio-cream">{t('nft.edition')}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">{editionChips}</div>
              </div>

              <div className="mt-3.5 flex items-center justify-between gap-4">
                <div
                  role="group"
                  aria-label={t('nft.quantity')}
                  className="flex w-[103px] items-center justify-between"
                >
                  {stepperButtons('h-[49.5px] w-[33px] rounded-full')}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={isSoldOut || addToCart.isPending}
                    onClick={() => selectedEdition && addToCart.mutate(selectedEdition.id)}
                    className="flex h-10 w-[130px] items-center justify-center rounded-md bg-kurio-copper text-sm font-bold text-kurio-bg transition-colors hover:bg-kurio-copperLight disabled:opacity-50"
                  >
                    {isSoldOut ? t('nft.soldOut') : addToCart.isPending ? t('nft.adding') : t('nft.buy')}
                  </button>
                  <button
                    type="button"
                    aria-pressed={isFavorite}
                    onClick={onToggleFavorite}
                    className="flex h-10 w-[130px] items-center justify-center gap-2 rounded-md border border-kurio-copper text-sm font-medium text-kurio-copper transition-colors hover:bg-kurio-copper/10"
                  >
                    <Heart
                      aria-hidden
                      className={isFavorite ? 'size-5 fill-kurio-copper' : 'size-5'}
                    />
                    {t('nft.favorite')}
                  </button>
                </div>
              </div>

              {cartError ? <div className="mt-3">{cartError}</div> : null}
              {cartMessage ? <div className="mt-3">{cartMessage}</div> : null}

              <div className="mt-3.5 space-y-3 text-[15px] leading-5 text-kurio-bronze">
                <p>{t('nft.tokenId')}: #{nft.id.replace('nft-', '').padStart(4, '0')}</p>
                <p>{t('nft.collectionLabel')}: {nft.collection}</p>
                <p>{t('nft.attributesLabel')}: {t('nft.attributesValue')}</p>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <p className="text-[15px] font-bold text-kurio-cream">{t('nft.share')}</p>
                <button
                  type="button"
                  aria-label="LinkedIn"
                  className="text-kurio-cream transition-colors hover:text-kurio-copper"
                >
                  <Linkedin className="size-[18px]" aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label="Message"
                  className="text-kurio-cream transition-colors hover:text-kurio-copper"
                >
                  <MessageCircle className="size-[18px]" aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label="X"
                  className="text-kurio-cream transition-colors hover:text-kurio-copper"
                >
                  <Twitter className="size-[18px]" aria-hidden />
                </button>
              </div>
            </div>
          </div>

          <section className="mt-24">
            <div className="flex gap-8 border-b border-kurio-copper" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'details'}
                onClick={() => setActiveTab('details')}
                className={`pb-3 text-[17px] transition-colors ${
                  activeTab === 'details'
                    ? 'font-bold text-kurio-copper shadow-[inset_0_-2px_0_#d28a4c]'
                    : 'text-kurio-cream hover:text-kurio-copper'
                }`}
              >
                {t('nft.detailsTab')}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'reviews'}
                onClick={() => setActiveTab('reviews')}
                className={`pb-3 text-[17px] transition-colors ${
                  activeTab === 'reviews'
                    ? 'font-bold text-kurio-copper shadow-[inset_0_-2px_0_#d28a4c]'
                    : 'text-kurio-cream hover:text-kurio-copper'
                }`}
              >
                {t('nft.reviewsTab', { count: REVIEW_COUNT })}
              </button>
            </div>
            <div className="mt-3">
              {activeTab === 'details' ? (
                <>
                  <div className="space-y-6 text-sm leading-6 text-kurio-sand">
                    <p>{nft.description}</p>
                    <p>{t('nft.descriptionP2')}</p>
                  </div>
                  <div className="mt-3 space-y-3 text-sm leading-6">
                    <div>
                      <p className="font-bold text-kurio-cream">{t('nft.networkLabel')}</p>
                      <p className="text-kurio-sand">{t('nft.networkText')}</p>
                    </div>
                    <div>
                      <p className="font-bold text-kurio-cream">{t('nft.contractLabel')}</p>
                      <p className="text-kurio-sand">{t('nft.contractText')}</p>
                    </div>
                    <div>
                      <p className="font-bold text-kurio-cream">{t('nft.copyrightLabel')}</p>
                      <p className="text-kurio-sand">{t('nft.copyrightText')}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-4 rounded-md border border-kurio-surface2 p-6">
                  <span className="text-3xl font-bold text-kurio-copper">{t('nft.rating')}</span>
                  <div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          aria-hidden
                          className="size-[15px] fill-kurio-copper text-kurio-copper"
                        />
                      ))}
                    </div>
                    <p className="mt-1 text-sm text-kurio-sand">
                      {t('nft.reviewCount', { count: REVIEW_COUNT })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="mt-24">
            <h2 className="border-b border-kurio-copper pb-3 text-[17px] font-bold text-kurio-copper">
              {t('nft.relatedTitle')}
            </h2>
            <RelatedNfts currentId={nft.id} />
          </section>
        </div>
      </div>
    </>
  )
}

function RelatedNfts({ currentId }: { currentId: string }) {
  const { t } = useTranslation()
  const { data } = useQuery({
    queryKey: queryKeys.nfts.list({ page: 1, pageSize: 5, sort: 'recent' }),
    queryFn: ({ signal }) => nftsApi.list({ page: 1, pageSize: 5, sort: 'recent' }, signal),
  })

  const items = (data?.items ?? []).filter((nft) => nft.id !== currentId).slice(0, 5)

  if (!items.length) return null

  return (
    <>
      <ul className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5 lg:gap-[26px]">
        {items.map((nft) => (
          <li key={nft.id} className="group">
            <Link to="/nfts/$nftId" params={{ nftId: nft.id }} className="block">
              <div className="h-[255px] overflow-hidden rounded-md bg-kurio-surface">
                <img
                  src={nft.imageUrl}
                  alt={t('nft.mainImageAria', { name: nft.name })}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <div className="mt-3">
                <p className="text-[15px] leading-5 text-kurio-cream">{nft.name}</p>
                <p className="text-base font-bold text-kurio-copper">
                  {formatEth(nft.priceEth)} ETH
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex justify-center gap-2" aria-hidden>
        <span className="size-3 rounded-full border border-kurio-copper" />
        <span className="size-3 rounded-full bg-kurio-copper" />
        <span className="size-3 rounded-full border border-kurio-copper" />
      </div>
    </>
  )
}
