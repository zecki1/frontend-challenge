import { Link, useMatchRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Heart, House, ShoppingCart, User } from 'lucide-react'
import { RiQrScan2Line } from 'react-icons/ri'

/**
 * Tab Bar Mobile — 4 itens: Início, Favoritos, Carrinho, Perfil
 * Botão central flutuante: QR Code scanner (RiQrScan2Line)
 * O círculo central fica sobre a barra com espaçamento do retângulo base.
 */
export function MobileTabBar() {
  const { t } = useTranslation()
  const matchRoute = useMatchRoute()

  const itemClass = (active: boolean) =>
    active ? 'text-kurio-copper' : 'text-kurio-sand transition-colors hover:text-kurio-cream'

  return (
    <nav
      aria-label={t('nav.mobileTabs')}
      className="fixed inset-x-0 bottom-0 z-40 h-[126px] md:hidden"
    >
      {/* Retângulo base da barra (95px altura) */}
      <div className="absolute inset-x-0 bottom-0 h-[95px] border-t border-kurio-surface2 bg-kurio-surface" />

      {/* Botão central flutuante — QR Code Scanner (65x65, sobressai 31px) */}
      <button
        type="button"
        aria-label={t('nav.scanQr')}
        className="absolute left-1/2 top-[-31px] flex h-[65px] w-[65px] -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-b from-kurio-copper/25 to-kurio-copper text-kurio-bg shadow-lg shadow-kurio-bg/40"
      >
        <RiQrScan2Line className="h-7 w-7" aria-hidden />
      </button>

      {/* Itens da tab bar: Início, Favoritos, Carrinho, Perfil */}
      <ul className="relative flex h-full items-end justify-between px-9 pb-[35px]">
        <li>
          <Link
            to="/"
            aria-label={t('nav.inicio')}
            className={itemClass(Boolean(matchRoute({ to: '/', fuzzy: false })))}
          >
            <House className="h-5 w-5" aria-hidden />
          </Link>
        </li>
        <li>
          <Link
            to="/favorites"
            aria-label={t('nav.favorites')}
            className={itemClass(Boolean(matchRoute({ to: '/favorites' })))}
          >
            <Heart className="h-5 w-5" aria-hidden />
          </Link>
        </li>
        {/* Espaço para o botão central flutuante */}
        <li aria-hidden className="h-5 w-5" />
        <li>
          <Link
            to="/cart"
            aria-label={t('nav.carrinho')}
            className={itemClass(Boolean(matchRoute({ to: '/cart' })))}
          >
            <ShoppingCart className="h-5 w-5" aria-hidden />
          </Link>
        </li>
        <li>
          <Link
            to="/account/profile"
            aria-label={t('nav.perfil')}
            className={itemClass(
              Boolean(matchRoute({ to: '/account/profile' })) || Boolean(matchRoute({ to: '/account/wallets' })),
            )}
          >
            <User className="h-5 w-5" aria-hidden />
          </Link>
        </li>
      </ul>
    </nav>
  )
}