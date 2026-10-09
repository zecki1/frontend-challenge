import { Link, useMatchRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { RiHeartLine, RiHome5Line, RiQrScan2Line, RiShoppingCartLine, RiUserLine } from 'react-icons/ri'

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
      className="fixed inset-x-0 bottom-0 z-40 h-[95px] md:hidden"
    >
      {/*
        Retângulo base da barra (95px). Tem um recorte vazado (mask) no topo-central,
        exatamente onde o círculo do QR Scanner atravessa a barra — o círculo não
        "encosta" no retângulo, como no Figma/CodePen.
      */}
      <div
        className="absolute inset-x-0 bottom-0 h-full border-t border-kurio-surface2 bg-kurio-surface [-webkit-mask-image:radial-gradient(circle_at_50%_0,transparent_36px,black_37px)] [mask-image:radial-gradient(circle_at_50%_0,transparent_36px,black_37px)] rounded-t-3xl"
      />

      {/* Botão central flutuante — QR Code Scanner (65x65, alinhado à borda superior do frame; corte de 34px na base, como no Figma) */}
      <button
        type="button"
        aria-label={t('nav.scanQr')}
        className="absolute left-1/2 top-[-18px] flex h-[65px] w-[65px] -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-b from-kurio-copper to-kurio-copper text-kurio-bg shadow-lg shadow-kurio-bg/40"
      >
        <RiQrScan2Line className="h-7 w-7" aria-hidden />
      </button>

      {/* Itens da tab bar: Início, Favoritos, Carrinho, Perfil */}
      <ul className="relative flex h-full items-center justify-between px-9">
        <li>
          <Link
            to="/"
            aria-label={t('nav.inicio')}
            className={itemClass(Boolean(matchRoute({ to: '/', fuzzy: false })))}
          >
            <RiHome5Line className="h-5 w-5" aria-hidden />
          </Link>
        </li>
        <li>
          <Link
            to="/favorites"
            aria-label={t('nav.favorites')}
            className={itemClass(Boolean(matchRoute({ to: '/favorites' })))}
          >
            <RiHeartLine className="h-5 w-5" aria-hidden />
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
            <RiShoppingCartLine className="h-5 w-5" aria-hidden />
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
            <RiUserLine className="h-5 w-5" aria-hidden />
          </Link>
        </li>
      </ul>
    </nav>
  )
}