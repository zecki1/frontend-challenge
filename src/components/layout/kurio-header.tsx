import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Search, User } from 'lucide-react'
import { AiOutlineShoppingCart } from 'react-icons/ai'
import { cartApi, queryKeys } from '@/api'
import { useAuth } from '@/features/auth/auth-context'
import { LoginDialog } from '@/components/auth/login-dialog'
import { useMswReady } from '@/lib/msw-ready'

/**
 * Cabeçalho KURIO — Figma "Header With Divider" (1200×46 + divisor #d28a4c):
 * logo à esquerda (160px), nav centralizada (gap 40, Roboto Mono 16), ações
 * à direita (207px). Item ativo: bold + border-bottom 3px cobre.
 */
export function KurioHeader() {
  const { t } = useTranslation()
  const { isAuthenticated, session } = useAuth()

  const mswReady = useMswReady()

  const cartQuery = useQuery({
    queryKey: queryKeys.cart,
    queryFn: ({ signal }) => cartApi.get(signal),
    enabled: mswReady,
  })
  const itemsCart = cartQuery.data?.items ?? []
  const cartCount = itemsCart.reduce((total, item) => total + (item?.quantity ?? 0), 0)

  const itemBase =
    'flex h-[46px] items-center font-mono text-base transition-colors border-b-[3px]'
  const itemInactive = 'border-transparent font-normal text-kurio-cream2 hover:text-kurio-copperLight'
  const itemActive = 'border-b-kurio-copper font-bold text-kurio-cream2'

  return (
    <header className="sticky top-0 z-40 hidden bg-kurio-bg md:block">
        <div className="mx-auto flex h-[46px] max-w-content items-center border-b-[0.2px] border-kurio-copper px-4 sm:px-6">
          <Link
            to="/"
            className="flex w-[160px] shrink-0 items-center font-mono text-sm font-bold tracking-[0.1em] text-kurio-cream2"
            aria-label={t('nav.brand')}
          >
            {t('nav.brand')}
          </Link>

          <nav aria-label={t('nav.brand')} className="flex flex-1 items-center justify-center gap-10">
            <Link
              to="/"
              activeOptions={{ exact: true }}
              className={`${itemBase} ${itemInactive}`}
              activeProps={{ className: `${itemBase} ${itemActive}`, 'aria-current': 'page' }}
            >
              {t('nav.inicio')}
            </Link>
            <Link
              to="/mercado"
              className={`${itemBase} ${itemInactive}`}
              activeProps={{ className: `${itemBase} ${itemActive}`, 'aria-current': 'page' }}
            >
              {t('nav.mercado')}
            </Link>
            <span className={`${itemBase} ${itemInactive} opacity-60`} aria-disabled="true">
              {t('nav.criadores')}
            </span>
            <span className={`${itemBase} ${itemInactive} opacity-60`} aria-disabled="true">
              {t('nav.aprenda')}
            </span>
          </nav>

          <div className="flex w-[207px] shrink-0 items-center justify-end gap-7">
            <Link
              to="/mercado"
              className="flex h-5 w-5 items-center justify-center text-kurio-cream2 transition-colors hover:text-kurio-copperLight"
              aria-label={t('home.searchPlaceholder')}
            >
              <Search className="h-5 w-5" aria-hidden />
            </Link>

            <Link
              to="/cart"
              className="relative flex items-center justify-center text-kurio-cream2 transition-colors hover:text-kurio-copperLight"
              aria-label={`${t('nav.carrinho')} (${cartCount})`}
            >
              <AiOutlineShoppingCart className="h-6 w-6" aria-hidden />
              {cartCount > 0 ? (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-kurio-bg bg-kurio-copper px-0.5 font-mono text-[10px] font-medium leading-none text-kurio-bg">
                  {cartCount}
                </span>
              ) : null}
            </Link>

            {isAuthenticated ? (
              <Link
                to="/account/profile"
                className="flex items-center gap-2 font-mono text-sm text-kurio-cream2 hover:text-kurio-copperLight focus:outline-none focus:ring-2 focus:ring-kurio-copper rounded-md px-2 py-1"
                aria-label={t('nav.userMenu')}
              >
                <User className="h-4 w-4" aria-hidden />
                <span>{session?.user.name.split(' ')[0]}</span>
              </Link>
            ) : (
              <LoginDialog />
            )}
          </div>
        </div>
      </header>
  )
}