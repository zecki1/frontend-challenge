import { useState, useEffect } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ChevronDown, Wallet } from 'lucide-react'
import { cartApi, ordersApi, queryKeys, walletsApi } from '@/api'
import { ApiError } from '@/lib/api-error'
import { addEth, formatEth, mulEth } from '@/lib/decimal'
import { RequireAuth } from '@/components/auth/require-auth'
import { requireAuthBeforeLoad } from '@/features/auth/require-auth'
import { useAuth } from '@/features/auth/auth-context'
import { useMswReady } from '@/lib/msw-ready'

export const Route = createFileRoute('/checkout')({
  beforeLoad: requireAuthBeforeLoad,
  component: CheckoutPage,
})

type WalletProvider = 'connect' | 'metamask' | 'coinbase'

function Field({
  label,
  id,
  required = true,
  hideLabel = false,
  children,
}: {
  label: string
  id: string
  required?: boolean
  hideLabel?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="h-[69px]">
      <label htmlFor={id} className="flex h-[29px] items-center text-[15px] leading-[15px] text-kurio-cream">
        <span className={hideLabel ? 'sr-only' : undefined}>{label}</span>
        {required ? <span className="text-[22px] text-kurio-coral">*</span> : null}
      </label>
      {children}
    </div>
  )
}

function CheckoutPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { session } = useAuth()

  const [walletId, setWalletId] = useState('')
  const [provider, setProvider] = useState<WalletProvider>('coinbase')
  const [useOtherWallet, setUseOtherWallet] = useState(false)
  const [network, setNetwork] = useState('')
  const [walletType, setWalletType] = useState('')
  const [displayName, setDisplayName] = useState(session?.user.name || '')
  const [email, setEmail] = useState(session?.user.email || '')
  const [username, setUsername] = useState('')
  const [profileName, setProfileName] = useState(session?.user.name || '')
  const [walletAddress, setWalletAddress] = useState('')
  const [ensSecondary, setEnsSecondary] = useState('')
  const [referral, setReferral] = useState('')
  const [ensDomain, setEnsDomain] = useState('.eth')
  const [note, setNote] = useState('')

  const mswReady = useMswReady()

  const { data: cart } = useQuery({
    queryKey: queryKeys.cart,
    queryFn: ({ signal }) => cartApi.get(signal),
    enabled: mswReady,
  })

  const { data: wallets } = useQuery({
    queryKey: queryKeys.wallets,
    queryFn: ({ signal }) => walletsApi.list(signal),
    enabled: mswReady,
  })

  const { data: networks } = useQuery({
    queryKey: queryKeys.networks,
    queryFn: ({ signal }) => walletsApi.networks(signal),
    enabled: mswReady,
  })

  const items = cart?.items ?? []
  const subtotal = items.length
    ? addEth(...items.map((item) => mulEth(item.unitPriceEth, item.quantity)))
    : '0'
  const networkFee = '0.016'
  const total = addEth(subtotal, networkFee)

  const selectedWallet = wallets?.find((entry) => entry.id === walletId) ?? wallets?.[0]

  // Atualiza walletAddress e network quando walletId muda
  useEffect(() => {
    if (selectedWallet) {
      setWalletAddress(selectedWallet.address)
      setWalletType(selectedWallet.id)
      setNetwork(selectedWallet.networkId)
    }
  }, [selectedWallet])

  // Inicializa walletId com a primeira carteira disponível
  useEffect(() => {
    if (!walletId && wallets?.length) {
      setWalletId(wallets[0].id)
    }
  }, [wallets, walletId])

  const createOrder = useMutation({
    mutationFn: () => {
      const idempotencyKey = crypto.randomUUID()
      return ordersApi.create(
        {
          collector: {
            name: displayName.trim() || session?.user.name || 'Colecionadora Ada',
            email: email.trim() || session?.user.email || 'collector@example.com',
            document: '123.456.789-00',
            phone: '+55 11 90000-0001',
          },
          walletId: selectedWallet?.id ?? '',
          networkId: (network || selectedWallet?.networkId || 'ethereum') as
            | 'ethereum'
            | 'polygon'
            | 'base',
          quoteId: 'quote-checkout',
          expectedTotalEth: total,
        },
        idempotencyKey,
      )
    },
    onSuccess: (order) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart })
      void queryClient.setQueryData(queryKeys.orders.detail(order.id), order)
      void navigate({ to: '/orders/$orderId', params: { orderId: order.id } })
    },
  })

  const handleConfirm = () => {
    if (!selectedWallet) return
    createOrder.mutate()
  }

  const inputClass =
    'h-10 w-full rounded-[3px] border border-[#3f2319] bg-transparent px-[23px] text-sm text-kurio-cream placeholder:text-kurio-bronze'

  const error = createOrder.isError ? (
    <p role="alert" className="text-sm text-kurio-coral">
      {createOrder.error instanceof ApiError ? createOrder.error.message : t('common.error')}
    </p>
  ) : null

  return (
    <RequireAuth>
      <div className="md:hidden">
        <div className="flex min-h-[80vh] flex-col px-7 pb-8 pt-8">
          <div className="relative flex h-11 items-center justify-center">
            <button
              type="button"
              aria-label={t('nft.back')}
              onClick={() => window.history.back()}
              className="absolute left-0 flex size-[35px] items-center justify-center rounded-full border border-[#3f2319] bg-kurio-surface2 text-kurio-cream transition-colors hover:text-kurio-copper"
            >
              <ArrowLeft className="size-5" aria-hidden />
            </button>
            <h1 className="text-xl font-bold text-kurio-cream">{t('checkout.title')} com carteira</h1>
          </div>

          <div className="mt-4 flex items-baseline">
            <p className="text-base font-bold text-kurio-cream">{t('checkout.walletConnected')}</p>
            <Link
              to="/account/wallets"
              className="ml-auto text-sm font-bold text-kurio-copper hover:underline"
            >
              {t('checkout.switchWallet')}
            </Link>
          </div>

          <div className="mt-4 space-y-5" role="radiogroup" aria-label={t('checkout.walletAndNetwork')}>
            {(wallets ?? []).slice(0, 2).map((wallet) => {
              const checked = (selectedWallet?.id ?? '') === wallet.id
              return (
                <button
                  key={wallet.id}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  onClick={() => setWalletId(wallet.id)}
                  className="relative block h-[93px] w-full rounded-[14px] bg-kurio-surface text-left"
                >
                  <span className="absolute left-[19px] top-[38px] flex size-4 items-center justify-center rounded-full border-[1.2px] border-kurio-copper">
                    {checked ? <span className="size-2 rounded-full bg-kurio-copper" /> : null}
                  </span>
                  <span className="absolute left-[54px] top-[15px] text-base font-bold text-kurio-cream">
                    {wallet.label}
                  </span>
                  <span className="absolute left-[54px] top-[38px] text-sm leading-[22px] text-kurio-sand">
                    {wallet.address.slice(0, 6)}…{wallet.address.slice(-4)}
                    <br />
                    {networks?.find((entry) => entry.id === wallet.networkId)?.name ?? wallet.networkId}
                  </span>
                  <span
                    aria-hidden
                    className="absolute right-[19px] top-[39px] flex flex-col gap-[3px]"
                  >
                    <span className="size-[3px] rounded-full bg-kurio-sand" />
                    <span className="size-[3px] rounded-full bg-kurio-sand" />
                    <span className="size-[3px] rounded-full bg-kurio-sand" />
                  </span>
                </button>
              )
            })}
          </div>

          <div className="mt-4">
            <h2 className="text-base font-bold text-kurio-cream">{t('checkout.walletAndNetwork')}</h2>
            <div className="mt-4 space-y-4" role="radiogroup" aria-label={t('checkout.walletAndNetwork')}>
              <button
                type="button"
                role="radio"
                aria-checked={provider === 'connect'}
                onClick={() => setProvider('connect')}
                className="flex h-[65px] w-full items-center rounded-[15px] bg-kurio-surface px-[14px] text-left"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#3f2319] bg-kurio-surface2 text-sm font-bold text-kurio-copper">
                  W
                </span>
                <span className="ml-[11px] rounded-md border border-[#55321f] bg-[#38220f] px-2 py-[7px] text-[9px] font-bold leading-none text-kurio-copperLight">
                  {t('checkout.supportedBrands')}
                </span>
                <span className="ml-auto mr-[17px] flex size-4 items-center justify-center rounded-full border-[1.2px] border-[#55321f]">
                  {provider === 'connect' ? (
                    <span className="size-2 rounded-full bg-kurio-copper" />
                  ) : null}
                </span>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={provider === 'metamask'}
                onClick={() => setProvider('metamask')}
                className="flex h-[65px] w-full items-center rounded-[15px] bg-kurio-surface px-[14px] text-left"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#3f2319] bg-kurio-surface2 text-sm font-bold text-kurio-copper">
                  M
                </span>
                <span className="ml-[11px] text-sm text-kurio-cream">MetaMask</span>
                <span className="ml-auto mr-[17px] flex size-4 items-center justify-center rounded-full border-[1.2px] border-[#55321f]">
                  {provider === 'metamask' ? (
                    <span className="size-2 rounded-full bg-kurio-copper" />
                  ) : null}
                </span>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={provider === 'coinbase'}
                onClick={() => setProvider('coinbase')}
                className="flex h-[65px] w-full items-center rounded-[15px] bg-kurio-surface px-[14px] text-left"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#3f2319] bg-kurio-surface2 text-kurio-copper">
                  <Wallet className="size-6" aria-hidden />
                </span>
                <span className="ml-[11px] text-sm text-kurio-cream">Coinbase Wallet</span>
                <span className="ml-auto mr-[17px] flex size-4 items-center justify-center rounded-full border-[1.2px] border-kurio-copper">
                  {provider === 'coinbase' ? (
                    <span className="size-2 rounded-full bg-kurio-copper" />
                  ) : null}
                </span>
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-end gap-7">
            <span className="text-base font-bold text-kurio-cream">{t('cart.total')}:</span>
            <span className="text-lg font-bold text-kurio-copper">{formatEth(total)} ETH</span>
          </div>

          <div className="mt-auto pt-8">
            {error}
            <button
              type="button"
              disabled={!selectedWallet || createOrder.isPending}
              onClick={handleConfirm}
              className="mt-3 flex h-[60px] w-full items-center justify-center rounded-full bg-gradient-to-b from-kurio-copper to-kurio-copperLight text-base font-bold text-kurio-bg disabled:opacity-50"
            >
              {createOrder.isPending ? '…' : t('checkout.confirmPurchase')}
            </button>
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        <div className="mx-auto max-w-content px-6 pb-24 pt-6">
          <nav aria-label="Breadcrumb" className="text-[15px] font-bold text-kurio-cream">
            <Link to="/" className="hover:text-kurio-copper">{t('nav.inicio')}</Link>
            <span className="mx-2" aria-hidden>/</span>
            <Link to="/mercado" className="hover:text-kurio-copper">{t('nav.mercado')}</Link>
            <span className="mx-2" aria-hidden>/</span>
            <span>{t('checkout.title')}</span>
          </nav>

          <div className="mt-8 flex flex-col gap-8 xl:flex-row">
            <section className="min-w-0 flex-1">
              <h2 className="text-[17px] font-bold text-kurio-cream">{t('account.profileTitle')}</h2>

              <div className="mt-3 flex flex-col gap-6 sm:flex-row">
                <div className="grid flex-1 gap-y-3">
                  <Field label={t('account.displayName')} id="co-display-name">
                    <input
                      id="co-display-name"
                      type="text"
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      placeholder={t('account.displayName')}
                      className={inputClass}
                    />
                  </Field>
                  <Field label={t('checkout.networkLabel')} id="co-network">
                    <div className="relative">
                      <select
                        id="co-network"
                        value={network}
                        onChange={(event) => setNetwork(event.target.value)}
                        className={`${inputClass} appearance-none pr-10 placeholder:text-kurio-bronze`}
                      >
                        <option value="">{t('checkout.selectNetwork')}</option>
                        {(networks ?? []).map((entry) => (
                          <option key={entry.id} value={entry.id}>
                            {entry.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        className="pointer-events-none absolute right-3 top-1/2 size-[18px] -translate-y-1/2 text-kurio-bronze"
                        aria-hidden
                      />
                    </div>
                  </Field>
                  <Field label={t('checkout.walletAddress')} id="co-address">
                    <input
                      id="co-address"
                      type="text"
                      value={walletAddress || selectedWallet?.address || ''}
                      onChange={(event) => setWalletAddress(event.target.value)}
                      placeholder={t('checkout.walletAddressPlaceholder')}
                      className={inputClass}
                    />
                  </Field>
                  <Field label={t('checkout.walletType')} id="co-wallet-type">
                    <div className="relative">
                      <select
                        id="co-wallet-type"
                        value={walletType || selectedWallet?.id || ''}
                        onChange={(event) => {
                          setWalletType(event.target.value)
                          setWalletId(event.target.value)
                          setWalletAddress('')
                        }}
                        className={`${inputClass} appearance-none pr-10`}
                      >
                        <option value="">{t('checkout.selectWallet')}</option>
                        {(wallets ?? []).map((wallet) => (
                          <option key={wallet.id} value={wallet.id}>
                            {wallet.label} — {wallet.address.slice(0, 6)}…{wallet.address.slice(-4)}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        className="pointer-events-none absolute right-3 top-1/2 size-[18px] -translate-y-1/2 text-kurio-bronze"
                        aria-hidden
                      />
                    </div>
                  </Field>
                  <Field label={t('auth.email')} id="co-email">
                    <input
                      id="co-email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder={session?.user.email ?? t('auth.email')}
                      className={inputClass}
                    />
                  </Field>
                </div>

                <div className="grid flex-1 gap-y-3">
                  <Field label={t('account.username')} id="co-username">
                    <input
                      id="co-username"
                      type="text"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder={t('account.username')}
                      className={inputClass}
                    />
                  </Field>
                  <Field label={t('checkout.profileName')} id="co-profile-name">
                    <input
                      id="co-profile-name"
                      type="text"
                      value={profileName}
                      onChange={(event) => setProfileName(event.target.value)}
                      placeholder={t('checkout.profileName')}
                      className={inputClass}
                    />
                  </Field>
                  <Field label={t('checkout.ensSecondary')} id="co-ens-secondary" required={false} hideLabel>
                    <input
                      id="co-ens-secondary"
                      type="text"
                      value={ensSecondary}
                      onChange={(event) => setEnsSecondary(event.target.value)}
                      placeholder={t('checkout.ensSecondary')}
                      className={inputClass}
                    />
                  </Field>
                  <Field label={t('checkout.referral')} id="co-referral">
                    <input
                      id="co-referral"
                      type="text"
                      value={referral}
                      onChange={(event) => setReferral(event.target.value)}
                      placeholder={t('checkout.referral')}
                      className={inputClass}
                    />
                  </Field>
                  <Field label={t('checkout.ensName')} id="co-ens">
                    <div className="relative w-[78px]">
                      <select
                        id="co-ens"
                        value={ensDomain}
                        onChange={(event) => setEnsDomain(event.target.value)}
                        className={`${inputClass} appearance-none pl-[10px] pr-[30px]`}
                      >
                        <option value=".eth">.eth</option>
                      </select>
                      <ChevronDown
                        className="pointer-events-none absolute right-[9px] top-1/2 size-[18px] -translate-y-1/2 text-kurio-cream"
                        aria-hidden
                      />
                    </div>
                  </Field>
                </div>
              </div>

              <label className="mt-6 flex cursor-pointer items-center gap-2 text-[15px] text-kurio-cream">
                <input
                  type="radio"
                  name="other-wallet"
                  checked={useOtherWallet}
                  onChange={() => setUseOtherWallet(true)}
                  className="sr-only"
                />
                <span
                  aria-hidden
                  className={`flex size-[15px] items-center justify-center rounded-full border-2 ${
                    useOtherWallet ? 'border-kurio-copper' : 'border-kurio-copper/40'
                  }`}
                >
                  {useOtherWallet ? <span className="size-[7px] rounded-full bg-kurio-copper" /> : null}
                </span>
                {t('checkout.useAnotherWallet')}
              </label>

              <div className="mt-6 w-[350px] max-w-full">
                <label htmlFor="co-note" className="text-[15px] leading-[15px] text-kurio-cream">
                  {t('checkout.note')}
                </label>
                <textarea
                  id="co-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  className="mt-3 h-[152px] w-full resize-none rounded-[3px] border border-[#3f2319] bg-transparent p-3 text-sm text-kurio-cream placeholder:text-kurio-bronze"
                />
              </div>
            </section>

            <aside className="w-full shrink-0 xl:w-[405px]">
              <h2 className="text-[17px] font-bold text-kurio-cream">{t('checkout.yourNfts')}</h2>

              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between border-b border-kurio-copper pb-3 text-base text-kurio-cream">
                  <span className="font-bold">NFTs</span>
                  <span className="font-medium">{t('cart.subtotal')}</span>
                </div>

                <ul className="space-y-3">
                  {items.map((item) => (
                    <li key={item.id} className="flex h-[70px] items-center bg-kurio-surface pl-[3px] pr-[15px]">
                      <img
                        src={item.imageUrl.replace('-1280', '-256')}
                        alt={`NFT ${item.nftId.replace('nft-', '')}`}
                        className="size-[70px] shrink-0 rounded-lg object-cover"
                      />
                      <div className="ml-[7px] min-w-0">
                        <p className="truncate text-base font-bold text-kurio-cream">{item.name}</p>
                        <p className="mt-1.5 truncate text-sm text-kurio-bronze">
                          {t('nft.tokenId')}: #{item.nftId.replace('nft-', '').padStart(4, '0')}
                        </p>
                      </div>
                      <div className="ml-auto flex items-center gap-5">
                        <span className="text-sm text-kurio-sand">(x {item.quantity})</span>
                        <span className="text-lg font-bold text-kurio-copper">
                          {formatEth(mulEth(item.unitPriceEth, item.quantity))} ETH
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>

                <p className="text-center text-sm text-kurio-cream">{t('checkout.promoPrompt')}</p>

                <div className="space-y-3">
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
                    <p className="text-center text-xs text-kurio-copper">{t('cart.estimatedFee')}</p>
                  </div>
                  <div className="border-t border-kurio-copper pt-3">
                    <div className="mx-[42px] flex items-baseline justify-between">
                      <span className="text-base font-bold text-kurio-cream">{t('cart.total')}</span>
                      <span className="text-lg font-bold text-kurio-copper">{formatEth(total)} ETH</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <h3 className="text-center text-[17px] font-bold text-kurio-cream">
                    {t('checkout.walletAndNetwork')}
                  </h3>
                  <div className="mt-[19px] space-y-[15px]" role="radiogroup" aria-label={t('checkout.walletAndNetwork')}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={provider === 'connect'}
                      onClick={() => setProvider('connect')}
                      className="flex h-[45px] w-full items-center rounded-[3px] border border-[#3f2319] px-[11px] text-left"
                    >
                      <span className="flex size-4 shrink-0 items-center justify-center rounded-full border-[1.2px] border-kurio-copper">
                        {provider === 'connect' ? (
                          <span className="size-2.5 rounded-full bg-kurio-copper" />
                        ) : null}
                      </span>
                      <span className="ml-[10px] flex h-[26px] items-center rounded-md border border-[#55321f] bg-[#38220f] px-2 text-[9px] font-bold text-kurio-copperLight">
                        {t('checkout.supportedBrands')}
                      </span>
                    </button>

                    <button
                      type="button"
                      role="radio"
                      aria-checked={provider === 'metamask'}
                      onClick={() => setProvider('metamask')}
                      className="flex h-[45px] w-full items-center rounded-[3px] border border-[#3f2319] px-[11px] text-left"
                    >
                      <span className="flex size-4 shrink-0 items-center justify-center rounded-full border-[1.2px] border-kurio-copper">
                        {provider === 'metamask' ? (
                          <span className="size-2.5 rounded-full bg-kurio-copper" />
                        ) : null}
                      </span>
                      <span className="ml-[10px] text-[15px] text-kurio-cream">MetaMask</span>
                    </button>

                    <button
                      type="button"
                      role="radio"
                      aria-checked={provider === 'coinbase'}
                      onClick={() => setProvider('coinbase')}
                      className="flex h-[45px] w-full items-center rounded-[3px] border border-kurio-copper px-[11px] text-left"
                    >
                      <span className="flex size-4 shrink-0 items-center justify-center rounded-full border-[1.2px] border-kurio-copper">
                        {provider === 'coinbase' ? (
                          <span className="size-2.5 rounded-full bg-kurio-copper" />
                        ) : null}
                      </span>
                      <span className="ml-[10px] text-[15px] text-kurio-cream">Coinbase Wallet</span>
                    </button>

                    <div className="pt-[9px]">
                      {error}
                      <button
                        type="button"
                        disabled={!selectedWallet || createOrder.isPending}
                        onClick={handleConfirm}
                        className="mt-3 flex h-[45px] w-full items-center justify-center rounded-lg bg-kurio-copper text-[15px] font-bold text-kurio-bg transition-colors hover:bg-kurio-copperLight disabled:opacity-50"
                      >
                        {createOrder.isPending ? '…' : t('checkout.confirmPurchase')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </RequireAuth>
  )
}
