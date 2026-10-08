import type { Network } from '@/api/types'

export const seedNetworks: Network[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    explorerUrlTemplate: 'https://etherscan.io/tx/{hash}',
  },
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    explorerUrlTemplate: 'https://polygonscan.com/tx/{hash}',
  },
  {
    id: 'base',
    name: 'Base',
    symbol: 'ETH',
    explorerUrlTemplate: 'https://basescan.org/tx/{hash}',
  },
]

export function explorerUrl(networkId: string, hash: string): string {
  const network = seedNetworks.find((item) => item.id === networkId)
  const template = network?.explorerUrlTemplate ?? 'https://example.com/tx/{hash}'
  return template.replace('{hash}', hash)
}
