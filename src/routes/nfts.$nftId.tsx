import { createFileRoute } from '@tanstack/react-router'
import { NftDetailPage } from '@/components/nft/nft-detail-page'

export const Route = createFileRoute('/nfts/$nftId')({
  component: NftDetailRoute,
})

function NftDetailRoute() {
  const { nftId } = Route.useParams()
  return <NftDetailPage nftId={nftId} />
}