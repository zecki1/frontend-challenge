import { createFileRoute } from '@tanstack/react-router'
import { NftDetailPage } from '@/routes/nfts.$nftId'

export const Route = createFileRoute('/mercado/nft/$nftNumber')({
  component: NftDetailPage,
  validateSearch: (search): { redirect?: string } => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
})