import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import type { Nft } from '@/api/types'
import { formatEth } from '@/lib/decimal'

/** Grade de cards de NFT usada nas páginas do Meu perfil (favoritos, ofertas, atividade). */
export function NftGrid({ nfts }: { nfts: Nft[] }) {
  const { t } = useTranslation()
  if (nfts.length === 0) return null
  return (
    <ul className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
      {nfts.map((nft) => (
        <li key={nft.id} className="group">
          <Link
            to="/mercado/nft/$nftNumber"
            params={{ nftNumber: nft.id.replace('nft-', '') }}
            className="block"
          >
            <div className="overflow-hidden rounded-xl border border-kurio-surface bg-kurio-surface/40">
              <img
                src={nft.imageUrl.replace('-1280', '-384')}
                srcSet={`${nft.imageUrl.replace('-1280', '-384')} 384w, ${nft.imageUrl.replace('-1280', '-640')} 640w, ${nft.imageUrl} 1280w`}
                sizes="(max-width: 767px) 45vw, 258px"
                alt={`${t('favorites.alt')} ${nft.name}`}
                loading="lazy"
                className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </div>
            <div className="mt-3 space-y-1">
              <p className="text-base text-kurio-cream">{nft.name}</p>
              <p className="text-lg font-bold text-kurio-copper">
                {formatEth(nft.priceEth)} ETH
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}