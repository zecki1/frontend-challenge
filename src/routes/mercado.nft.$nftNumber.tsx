import { createFileRoute } from '@tanstack/react-router'
import { NftDetailPage } from '@/components/nft/nft-detail-page'

export const Route = createFileRoute('/mercado/nft/$nftNumber')({
  component: MercadoNftDetailRoute,
  validateSearch: (search): { redirect?: string } => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
})

function MercadoNftDetailRoute() {
  const { nftNumber } = Route.useParams()
  return <NftDetailPage nftId={nftNumber} />
}