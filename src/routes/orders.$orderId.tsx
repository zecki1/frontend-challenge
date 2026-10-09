import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { HeartHandshake, X } from 'lucide-react'
import { ordersApi, queryKeys, walletsApi } from '@/api'
import { formatEth } from '@/lib/decimal'
import { requireAuthBeforeLoad } from '@/features/auth/require-auth'
import { useMswReady } from '@/lib/msw-ready'

export const Route = createFileRoute('/orders/$orderId')({
  beforeLoad: requireAuthBeforeLoad,
  component: OrderConfirmationPage,
})

const MONTHS = {
  pt: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  es: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
} as const

function formatDate(iso: string, language: string): string {
  const date = new Date(iso)
  const months = MONTHS[language.slice(0, 2) as keyof typeof MONTHS] ?? MONTHS.en
  const day = String(date.getDate()).padStart(2, '0')
  return `${day} ${months[date.getMonth()]}, ${date.getFullYear()}`
}

function OrderConfirmationPage() {
  const { orderId } = Route.useParams()
  const { t, i18n } = useTranslation()

  const mswReady = useMswReady()

  const { data: order, isLoading, isError } = useQuery({
    queryKey: queryKeys.orders.detail(orderId),
    queryFn: ({ signal }) => ordersApi.get(orderId, signal),
    enabled: mswReady,
  })

  const { data: wallets } = useQuery({
    queryKey: queryKeys.wallets,
    queryFn: ({ signal }) => walletsApi.list(signal),
    enabled: mswReady,
  })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-content px-4 py-10 sm:px-6">
        <div className="h-8 w-48 skeleton rounded bg-kurio-surface" />
      </div>
    )
  }

  if (isError || !order) {
    return (
      <section role="alert" className="mx-auto max-w-content px-4 py-24 text-center sm:px-6">
        <p className="text-kurio-coral">{t('common.error')}</p>
      </section>
    )
  }

  const isConfirmed = order.status === 'confirmed'
  const isPending = order.status === 'pending'
  const walletLabel = wallets?.find((entry) => entry.id === order.walletId)?.label ?? 'MetaMask'
  const txHash = order.txHash
    ? `${order.txHash.slice(0, 6)}…${order.txHash.slice(-4)}`
    : '—'

  const statusTitle = isConfirmed
    ? t('orders.inWallet')
    : isPending
      ? t('orders.pendingTitle')
      : t('orders.rejectedTitle')

  const statusNote = isConfirmed
    ? t('orders.confirmedNote')
    : isPending
      ? null
      : (order.failureReason ?? t('common.error'))

  return (
    <div className="px-4 pb-16 pt-16">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-status-title"
        className="mx-auto w-full max-w-[578px] overflow-hidden bg-kurio-surface"
      >
        <header className="relative px-11 pb-[22px] pt-[22px]">
          <Link
            to="/"
            aria-label={t('common.close')}
            className="absolute right-[14px] top-[17px] text-kurio-sand transition-colors hover:text-kurio-cream"
          >
            <X className="size-[18px]" aria-hidden />
          </Link>
          <HeartHandshake
            className={`mx-auto size-20 ${isConfirmed ? 'text-kurio-copper' : 'text-kurio-coral'}`}
            strokeWidth={1.25}
            aria-hidden
          />
          <p
            id="order-status-title"
            className="mt-4 text-center text-base font-bold text-kurio-sand"
          >
            {statusTitle}
          </p>
        </header>

        <div className="border-t border-kurio-copper" />

        <div className="flex h-[65px] items-center justify-between px-9">
          <div>
            <p className="text-sm font-bold text-kurio-sand">{t('orders.transactionId')}</p>
            <p className="text-[15px] text-kurio-sand">{txHash}</p>
          </div>
          <span className="h-[31px] w-px bg-kurio-copper" aria-hidden />
          <div>
            <p className="text-sm text-kurio-sand">{t('orders.date')}</p>
            <p className="text-[15px] text-kurio-sand">
              {formatDate(order.createdAt, i18n.language)}
            </p>
          </div>
          <span className="h-[31px] w-px bg-kurio-copper" aria-hidden />
          <div>
            <p className="text-sm text-kurio-sand">{t('orders.total')}</p>
            <p className="text-[15px] text-kurio-sand">{formatEth(order.totalEth)} ETH</p>
          </div>
          <span className="h-[31px] w-px bg-kurio-copper" aria-hidden />
          <div>
            <p className="text-sm font-bold text-kurio-sand">{t('orders.wallet')}</p>
            <p className="text-[15px] text-kurio-sand">{walletLabel}</p>
          </div>
        </div>

        <div className="border-t border-kurio-copper" />

        <div className="px-11 pb-4 pt-5">
          <h2 className="text-[15px] font-bold text-kurio-cream">{t('orders.txDetails')}</h2>

          <div className="mt-3 grid grid-cols-[1fr_93px_100px] border-b-[0.3px] border-kurio-copper pb-3 text-base text-kurio-cream">
            <span className="font-bold">NFTs</span>
            <span className="font-bold">{t('cart.editions')}</span>
            <span className="text-right font-medium">{t('cart.subtotal')}</span>
          </div>

          <ul className="mt-3 space-y-3">
            {(Array.isArray(order?.items) ? order.items : []).map((item) => (
              <li
                key={`${item.nftId}-${item.editionId}`}
                className="grid h-[70px] grid-cols-[1fr_93px_100px] items-center bg-kurio-surface pl-3 pr-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <img
                    src={item.imageUrl.replace('-1280', '-256')}
                    alt={`NFT ${item.nftId.replace('nft-', '')}`}
                    className="size-[70px] shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold text-kurio-cream">{item.name}</p>
                    <p className="mt-1.5 truncate text-sm text-kurio-bronze">
                      {t('nft.tokenId')}: #{item.nftId.replace('nft-', '').padStart(4, '0')}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-kurio-sand">(x {item.quantity})</span>
                <span className="text-right text-lg font-bold text-kurio-copper">
                  {formatEth(item.lineTotalEth)} ETH
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-3 border-t-[0.3px] border-kurio-copper pt-3">
            <div className="ml-auto w-[321px] max-w-full space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-[15px] text-kurio-cream">{t('cart.networkFee')}</span>
                <span className="text-lg text-kurio-cream">{order.networkFeeEth} ETH</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-base font-bold text-kurio-cream">{t('cart.total')}</span>
                <span className="text-lg font-bold text-kurio-copper">
                  {formatEth(order.totalEth)} ETH
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 text-center">
            {statusNote ? (
              <p className="text-sm leading-[22px] text-kurio-sand">{statusNote}</p>
            ) : null}
            {isConfirmed && order.explorerUrl ? (
              <a
                href={order.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mx-auto mt-5 flex h-12 w-[186px] items-center justify-center rounded-[5px] bg-kurio-copper text-base font-bold text-kurio-bg transition-colors hover:bg-kurio-copperLight"
              >
                {t('orders.viewOnExplorer')}
              </a>
            ) : null}
          </div>
        </div>

        <div className="h-[10px] bg-kurio-copper" />
      </section>
    </div>
  )
}
