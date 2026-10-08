import { useRef } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Minus, Plus, Trash2 } from 'lucide-react'
import { cartApi, nftsApi, queryKeys } from '@/api'
import { addEth, formatEth, mulEth } from '@/lib/decimal'
import type { CartItem } from '@/api/types'

export const Route = createFileRoute('/cart')({
  component: CartPage,
})

function CartPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const couponDesktopRef = useRef<HTMLInputElement>(null)
  const couponMobileRef = useRef<HTMLInputElement>(null)

  const { data: cart, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.cart,
    queryFn: ({ signal }) => cartApi.get(signal),
  })

  const updateItem = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateItem(itemId, { quantity }),
    onSuccess: (data) => queryClient.setQueryData(queryKeys.cart, data),
  })

  const removeItem = useMutation({
    mutationFn: (itemId: string) => cartApi.removeItem(itemId),
    onSuccess: (data) => queryClient.setQueryData(queryKeys.cart, data),
  })

  const applyCoupon = useMutation({
    mutationFn: (code: string) => cartApi.applyCoupon({ code }),
    onSuccess: (data) => queryClient.setQueryData(queryKeys.cart, data),
  })

  const items = cart?.items ?? []
  const subtotal = items.length
    ? addEth(...items.map((item) => mulEth(item.unitPriceEth, item.quantity)))
    : '0'
  const networkFee = '0.016'
  const total = addEth(subtotal, networkFee)

  const changeQuantity = (item: CartItem, next: number) => {
    updateItem.mutate({
      itemId: item.id,
      quantity: Math.min(item.maxQuantity, Math.max(1, next)),
    })
  }

  const onApplyCoupon = (ref: { current: HTMLInputElement | null }) => {
    const value = ref.current?.value.trim()
    if (value) applyCoupon.mutate(value)
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-content px-4 py-10 sm:px-6">
        <div className="h-8 w-48 skeleton rounded bg-kurio-surface" />
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 skeleton rounded-lg bg-kurio-surface" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <section role="alert" className="mx-auto max-w-content px-4 py-24 text-center sm:px-6">
        <p className="text-kurio-coral">{error instanceof Error ? error.message : t('common.error')}</p>
      </section>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-content px-4 py-24 text-center sm:px-6">
        <p className="text-lg text-kurio-cream">{t('cart.empty')}</p>
        <Link to="/" className="mt-4 inline-block text-kurio-copper underline">
          {t('cart.explore')}
        </Link>
      </div>
    )
  }

  const summary = (
    <>
      <div className="mt-6">
        <label htmlFor="coupon-desktop" className="text-sm font-bold text-kurio-cream">
          {t('cart.promoCode')}
        </label>
        <div className="relative mt-2">
          <input
            id="coupon-desktop"
            ref={couponDesktopRef}
            type="text"
            placeholder={t('cart.couponPlaceholder')}
            onKeyDown={(event) => {
              if (event.key === 'Enter') onApplyCoupon(couponDesktopRef)
            }}
            className="h-10 w-full rounded-[3px] border border-kurio-copper bg-kurio-surface pl-2 pr-[110px] text-sm text-kurio-cream placeholder:text-kurio-bronze"
          />
          <button
            type="button"
            onClick={() => onApplyCoupon(couponDesktopRef)}
            className="absolute right-0 top-0 h-10 w-[102px] rounded-[3px] bg-kurio-copper text-sm font-bold text-kurio-bg transition-colors hover:bg-kurio-copperLight"
          >
            {t('cart.apply')}
          </button>
        </div>
        {applyCoupon.isError ? (
          <p className="mt-2 text-xs text-kurio-coral">
            {applyCoupon.error instanceof Error ? applyCoupon.error.message : t('common.error')}
          </p>
        ) : null}
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-[15px] text-kurio-cream">{t('cart.subtotal')}</span>
          <span className="text-lg text-kurio-cream">{formatEth(subtotal)} ETH</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-[15px] text-kurio-cream">{t('cart.discount')}</span>
          <span className="text-[15px] text-kurio-cream">(-) 00.00</span>
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-[15px] text-kurio-cream">{t('cart.networkFee')}</span>
            <span className="text-lg text-kurio-cream">{networkFee} ETH</span>
          </div>
          <p className="mt-1 text-right text-xs text-kurio-copper">{t('cart.estimatedFee')}</p>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-base font-bold text-kurio-cream">{t('cart.total')}</span>
          <span className="text-lg font-bold text-kurio-copper">{formatEth(total)} ETH</span>
        </div>
      </div>
    </>
  )

  return (
    <>
      <div className="md:hidden">
        <div className="px-7 pt-8">
          <div className="relative flex h-11 items-center justify-center">
            <button
              type="button"
              aria-label={t('nft.back')}
              onClick={() => window.history.back()}
              className="absolute left-0 flex size-[35px] items-center justify-center rounded-full border border-[#3f2319] bg-kurio-surface2 text-kurio-cream transition-colors hover:text-kurio-copper"
            >
              <ArrowLeft className="size-5" aria-hidden />
            </button>
            <h1 className="text-xl font-bold text-kurio-cream">{t('cart.heading')}</h1>
          </div>

          <ul className="mt-3 space-y-5">
            {items.map((item) => (
              <li
                key={item.id}
                className="relative h-[100px] overflow-hidden rounded-[14px] bg-gradient-to-br from-kurio-surface to-kurio-surface2"
              >
                <img
                  src={item.imageUrl.replace('-1280', '-640')}
                  alt=""
                  aria-hidden
                  className="absolute left-0 top-0 size-[100px] rounded-[14px] object-cover"
                />
                <p className="absolute left-[109px] top-[13px] max-w-[145px] truncate text-[15px] font-bold text-kurio-cream">
                  {item.name}
                </p>
                <p className="absolute left-[109px] top-[35px] text-sm text-kurio-sand">
                  <EditionLabel nftId={item.nftId} editionId={item.editionId} />
                </p>
                <p className="absolute left-[109px] top-[69px] text-lg font-bold text-kurio-copper">
                  {formatEth(mulEth(item.unitPriceEth, item.quantity))} ETH
                </p>
                <div className="absolute right-4 top-[38px] flex w-[81px] items-center justify-between">
                  <button
                    type="button"
                    aria-label={`${t('nft.decrease')} (${item.name})`}
                    disabled={item.quantity <= 1 || updateItem.isPending}
                    onClick={() => changeQuantity(item, item.quantity - 1)}
                    className="flex size-6 items-center justify-center rounded-full bg-kurio-copper text-kurio-bg transition-opacity disabled:opacity-50"
                  >
                    <Minus className="size-3.5" aria-hidden />
                  </button>
                  <span className="text-center text-base text-kurio-cream" aria-live="polite">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label={`${t('nft.increase')} (${item.name})`}
                    disabled={item.quantity >= item.maxQuantity || updateItem.isPending}
                    onClick={() => changeQuantity(item, item.quantity + 1)}
                    className="flex size-6 items-center justify-center rounded-full bg-kurio-copper text-kurio-bg transition-opacity disabled:opacity-50"
                  >
                    <Plus className="size-3.5" aria-hidden />
                  </button>
                </div>
                <button
                  type="button"
                  aria-label={`${t('cart.remove')} (${item.name})`}
                  onClick={() => removeItem.mutate(item.id)}
                  className="absolute right-[21px] top-[13px] text-kurio-sand transition-colors hover:text-kurio-coral"
                >
                  <Trash2 className="size-6" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-1 bg-kurio-surface px-6 pb-9 pt-6">
          <div className="relative">
            <label htmlFor="coupon-mobile" className="sr-only">
              {t('cart.promoCode')}
            </label>
            <input
              id="coupon-mobile"
              ref={couponMobileRef}
              type="text"
              placeholder={t('cart.couponPlaceholder')}
              onKeyDown={(event) => {
                if (event.key === 'Enter') onApplyCoupon(couponMobileRef)
              }}
              className="h-[50px] w-full rounded-full border border-[#3f2319] bg-kurio-surface pl-4 pr-[111px] text-sm text-kurio-cream placeholder:text-kurio-bronze"
            />
            <button
              type="button"
              onClick={() => onApplyCoupon(couponMobileRef)}
              className="absolute right-0 top-0 h-[50px] w-[97px] rounded-full bg-gradient-to-b from-kurio-copper to-kurio-copperLight text-sm font-bold text-kurio-bg"
            >
              {t('cart.apply')}
            </button>
          </div>
          {applyCoupon.isError ? (
            <p className="mt-2 text-xs text-kurio-coral">
              {applyCoupon.error instanceof Error ? applyCoupon.error.message : t('common.error')}
            </p>
          ) : null}

          <div className="mt-3 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-[15px] text-kurio-cream">{t('cart.subtotal')}</span>
              <span className="text-base text-kurio-cream">{formatEth(subtotal)} ETH</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-[15px] text-kurio-cream">{t('cart.discount')}</span>
              <span className="text-[15px] text-kurio-cream">(-) 00.00</span>
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-[15px] text-kurio-cream">{t('cart.networkFee')}</span>
                <span className="text-base text-kurio-cream">{networkFee} ETH</span>
              </div>
              <p className="text-right text-xs text-kurio-copper">{t('cart.estimatedFee')}</p>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-base font-bold text-kurio-cream">{t('cart.total')}</span>
              <span className="text-lg font-bold text-kurio-copper">{formatEth(total)} ETH</span>
            </div>
          </div>

          <Link
            to="/checkout"
            className="mt-8 flex h-[60px] items-center justify-center rounded-full bg-gradient-to-b from-kurio-copper to-kurio-copperLight text-base font-bold text-kurio-bg"
          >
            {t('checkout.connectAndFinish')}
          </Link>
        </div>
      </div>

      <div className="hidden md:block">
        <div className="mx-auto max-w-content px-6 pb-24 pt-6">
          <nav aria-label="Breadcrumb" className="text-[15px] font-bold text-kurio-cream">
            <Link to="/" className="hover:text-kurio-copper">{t('nav.inicio')}</Link>
            <span className="mx-2" aria-hidden>/</span>
            <Link to="/mercado" className="hover:text-kurio-copper">{t('nav.mercado')}</Link>
            <span className="mx-2" aria-hidden>/</span>
            <span>{t('cart.title')}</span>
          </nav>

          <div className="mt-3 flex flex-col gap-8 xl:flex-row xl:gap-[86px]">
            <div className="min-w-0 flex-1">
              <div className="grid grid-cols-[minmax(180px,1fr)_138px_136px_148px_48px] border-b border-kurio-copper pb-3 text-base text-kurio-cream">
                <span className="font-bold">NFTs</span>
                <span className="font-medium">{t('cart.price')}</span>
                <span className="font-bold">{t('cart.editions')}</span>
                <span className="font-medium">{t('cart.total')}</span>
                <span aria-hidden />
              </div>

              <ul className="mt-3 space-y-3">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="grid h-[70px] grid-cols-[minmax(180px,1fr)_138px_136px_148px_48px] items-center bg-kurio-surface"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <img
                        src={item.imageUrl.replace('-1280', '-640')}
                        alt=""
                        aria-hidden
                        className="size-[70px] shrink-0 rounded-md object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-base font-bold text-kurio-cream">{item.name}</p>
                        <p className="mt-1.5 truncate text-sm text-kurio-bronze">
                          {t('nft.tokenId')}: #{item.nftId.replace('nft-', '').padStart(4, '0')}
                        </p>
                      </div>
                    </div>
                    <p className="text-base font-bold text-kurio-sand">
                      {formatEth(item.unitPriceEth)} ETH
                    </p>
                    <div className="flex w-[75px] items-center justify-between">
                      <button
                        type="button"
                        aria-label={`${t('nft.decrease')} (${item.name})`}
                        disabled={item.quantity <= 1 || updateItem.isPending}
                        onClick={() => changeQuantity(item, item.quantity - 1)}
                        className="flex h-[30px] w-5 items-center justify-center rounded-full bg-kurio-copper text-kurio-bg transition-opacity disabled:opacity-50"
                      >
                        <Minus className="size-3.5" aria-hidden />
                      </button>
                      <span className="text-center text-[17px] text-kurio-cream" aria-live="polite">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={`${t('nft.increase')} (${item.name})`}
                        disabled={item.quantity >= item.maxQuantity || updateItem.isPending}
                        onClick={() => changeQuantity(item, item.quantity + 1)}
                        className="flex h-[30px] w-5 items-center justify-center rounded-full bg-kurio-copper text-kurio-bg transition-opacity disabled:opacity-50"
                      >
                        <Plus className="size-3.5" aria-hidden />
                      </button>
                    </div>
                    <p className="text-base font-bold text-kurio-copper">
                      {formatEth(mulEth(item.unitPriceEth, item.quantity))} ETH
                    </p>
                    <button
                      type="button"
                      aria-label={`${t('cart.remove')} (${item.name})`}
                      onClick={() => removeItem.mutate(item.id)}
                      className="flex size-6 items-center justify-center text-kurio-sand transition-colors hover:text-kurio-coral"
                    >
                      <Trash2 className="size-6" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <aside className="w-full shrink-0 xl:w-[332px]">
              <h2 className="border-b border-kurio-copper pb-3 text-lg font-bold text-kurio-cream">
                {t('cart.walletSummary')}
              </h2>
              {summary}
              <Link
                to="/checkout"
                className="mt-6 flex h-10 items-center justify-center rounded-[3px] bg-kurio-copper text-sm font-bold text-kurio-bg transition-colors hover:bg-kurio-copperLight"
              >
                {t('checkout.connectAndFinish')}
              </Link>
              <Link
                to="/"
                className="mt-3 block text-center text-[15px] text-kurio-copper hover:underline"
              >
                {t('orders.continueExploring')}
              </Link>
            </aside>
          </div>

          <RelatedProducts />
        </div>
      </div>
    </>
  )
}

function EditionLabel({ nftId, editionId }: { nftId: string; editionId: string }) {
  const { t } = useTranslation()
  const { data: nft } = useQuery({
    queryKey: queryKeys.nfts.detail(nftId),
    queryFn: ({ signal }) => nftsApi.detail(nftId, signal),
    staleTime: 60_000,
  })

  const edition = nft?.editions.find((entry) => entry.id === editionId)
  if (!edition) return null

  return (
    <span>
      {t('cart.editionLabel', {
        edition: edition.total === 1 ? '1/1' : `1/${edition.total}`,
      })}
    </span>
  )
}

function RelatedProducts() {
  const { t } = useTranslation()
  const { data } = useQuery({
    queryKey: queryKeys.nfts.list({ page: 1, pageSize: 5, sort: 'recent' }),
    queryFn: ({ signal }) => nftsApi.list({ page: 1, pageSize: 5, sort: 'recent' }, signal),
  })

  const items = data?.items ?? []

  if (!items.length) return null

  return (
    <section className="mt-24">
      <h2 className="border-b border-kurio-copper pb-3 text-[17px] font-bold text-kurio-copper">
        {t('nft.related')}
      </h2>
      <ul className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5 lg:gap-[26px]">
        {items.map((nft) => (
          <li key={nft.id} className="group">
            <Link to="/nfts/$nftId" params={{ nftId: nft.id }} className="block">
              <div className="h-[255px] overflow-hidden rounded-md bg-kurio-surface px-[14.5px] py-1.5">
                <img
                  src={nft.imageUrl}
                  alt={t('nft.mainImageAria', { name: nft.name })}
                  loading="lazy"
                  className="h-full w-full rounded-[15px] object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <div className="mt-2">
                <p className="text-[15px] leading-5 text-kurio-cream">{nft.name}</p>
                <p className="mt-2 text-base font-bold text-kurio-copper">
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
    </section>
  )
}
