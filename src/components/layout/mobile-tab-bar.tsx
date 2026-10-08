import { Link, useMatchRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Heart, House, LayoutGrid, ShoppingCart, User } from 'lucide-react'

/**
 * Tab Bar do Figma "Mobile / Início" (414×126): fundo #241612 com 95px,
 * CTA central 65×65 sobressaindo 31px, ícones 20px a 35px do rodapé.
 * Obs.: no Figma os ícones têm cor #2f1d15 (praticamente invisíveis);
 * usamos sand/copperLight para manter a usabilidade (documentado no README).
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
      <div className="absolute inset-x-0 bottom-0 h-[95px] border-t border-kurio-surface2 bg-kurio-surface" />
      <Link
        to="/cart"
        aria-label={t('nav.carrinho')}
        className="absolute left-1/2 top-0 flex h-[65px] w-[65px] -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-b from-kurio-copper/25 to-kurio-copper text-kurio-bg shadow-lg shadow-kurio-bg/40"
      >
        <ShoppingCart className="h-6 w-6" aria-hidden />
      </Link>
      <ul className="relative flex h-full items-end justify-between px-9 pb-[35px]">
        <li>
          <Link to="/" aria-label={t('nav.inicio')} className={itemClass(Boolean(matchRoute({ to: '/', fuzzy: false })))}>
            <House className="h-5 w-5" aria-hidden />
          </Link>
        </li>
        <li>
          <Link to="/mercado" aria-label={t('nav.mercado')} className={itemClass(Boolean(matchRoute({ to: '/mercado' })))}>
            <LayoutGrid className="h-5 w-5" aria-hidden />
          </Link>
        </li>
        <li aria-hidden className="h-5 w-5" />
        <li>
          <Link to="/favorites" aria-label={t('nav.favorites')} className={itemClass(Boolean(matchRoute({ to: '/favorites' })))}>
            <Heart className="h-5 w-5" aria-hidden />
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
