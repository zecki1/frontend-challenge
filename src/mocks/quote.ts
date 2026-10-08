import type {
  Cart,
  Coupon,
  Nft,
  Quote,
  QuoteChange,
} from '@/api/types'
import { addEth, compareEth, mulEth, subEth } from '@/lib/decimal'
import { scenario } from './config'
import { getDb, uid } from './db'

export const NETWORK_FEE_ETH = '0.016'
export const QUOTE_TTL_MS = 5 * 60 * 1000

export function findNft(nftId: string): Nft | undefined {
  return getDb().nfts.find((nft) => nft.id === nftId)
}

export function findEdition(nft: Nft, editionId: string) {
  return nft.editions.find((edition) => edition.id === editionId)
}

interface ResolvedCoupon {
  coupon: Coupon | null
  change: QuoteChange | null
}

function resolveCoupon(code: string | null): ResolvedCoupon {
  if (!code) return { coupon: null, change: null }

  const mode = scenario().couponMode
  if (mode === 'invalid') {
    return {
      coupon: null,
      change: {
        cartItemId: null,
        reason: 'coupon_invalid',
        message: `O cupom ${code} é inválido.`,
      },
    }
  }

  const seed = getDb().coupons.find((item) => item.code === code)
  const expiredByDate = seed?.expiresAt ? Date.parse(seed.expiresAt) < Date.now() : false

  if (!seed || mode === 'expired' || expiredByDate) {
    return {
      coupon: null,
      change: {
        cartItemId: null,
        reason: 'coupon_expired',
        message: `O cupom ${code} expirou ou não está mais disponível.`,
      },
    }
  }

  return { coupon: { code: seed.code, percentOff: seed.percentOff }, change: null }
}

/**
 * Constrói a cotação a partir do carrinho e do estado atual do catálogo.
 * Detecta mudanças de preço/disponibilidade em relação ao snapshot do carrinho.
 */
export function buildQuote(cart: Cart): Quote {
  const changes: QuoteChange[] = []

  const lines = cart.items.flatMap((item) => {
    const nft = findNft(item.nftId)
    if (!nft) {
      changes.push({
        cartItemId: item.id,
        reason: 'edition_unavailable',
        message: `O NFT ${item.name} não está mais disponível.`,
      })
      return []
    }

    const edition = findEdition(nft, item.editionId)
    if (!edition || edition.available <= 0) {
      changes.push({
        cartItemId: item.id,
        reason: 'out_of_stock',
        message: `${item.name} está esgotado.`,
      })
    } else {
      if (compareEth(edition.priceEth, item.unitPriceEth) !== 0) {
        changes.push({
          cartItemId: item.id,
          reason: 'price_changed',
          message: `O preço de ${item.name} mudou de ${item.unitPriceEth} para ${edition.priceEth} ETH.`,
        })
      }
      if (item.quantity > edition.available) {
        changes.push({
          cartItemId: item.id,
          reason: 'out_of_stock',
          message: `Só restam ${edition.available} unidade(s) de ${item.name}.`,
        })
      }
    }

    const unitPriceEth = edition?.priceEth ?? item.unitPriceEth
    const quantity = Math.max(1, Math.min(item.quantity, edition?.available ?? item.quantity))
    return [
      {
        cartItemId: item.id,
        nftId: item.nftId,
        editionId: item.editionId,
        name: item.name,
        imageUrl: item.imageUrl,
        unitPriceEth,
        quantity,
        lineTotalEth: mulEth(unitPriceEth, quantity),
      },
    ]
  })

  const subtotalEth = lines.length
    ? addEth(...lines.map((line) => line.lineTotalEth))
    : '0'

  const { coupon, change: couponChange } = resolveCoupon(cart.couponCode)
  if (couponChange) changes.push(couponChange)

  const discountEth = coupon
    ? mulEth(subtotalEth, coupon.percentOff / 100)
    : '0'

  const totalEth = addEth(subEth(subtotalEth, discountEth), NETWORK_FEE_ETH)

  return {
    id: uid('quote'),
    currency: 'ETH',
    lines,
    subtotalEth,
    discountEth,
    networkFeeEth: NETWORK_FEE_ETH,
    totalEth,
    coupon,
    changes,
    version: cart.version,
    expiresAt: new Date(Date.now() + QUOTE_TTL_MS).toISOString(),
  }
}
