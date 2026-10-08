import type { OrderStatus } from '@/api/types'

/**
 * API de controle exposta em `window.__mocks` (apenas com mocks habilitados).
 * Facilita demonstrações manuais e é usada pelos cenários do Playwright para
 * selecionar cenários, resetar e disparar eventos de tempo real.
 */
export interface MockDevtools {
  getConfig(): Promise<unknown>
  setScenario(name: string): Promise<unknown>
  reset(): Promise<unknown>
  emitNftPriceChange(nftId: string, factor?: number): Promise<unknown>
  selloutNft(nftId: string): Promise<unknown>
  updateOrder(orderId: string, status: OrderStatus): Promise<unknown>
}

async function control(path: string, body?: unknown): Promise<unknown> {
  const response = await fetch(`/__mocks__${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!response.ok) {
    throw new Error(`Mock control falhou: ${response.status}`)
  }
  return response.json()
}

declare global {
  interface Window {
    __mocks?: MockDevtools
  }
}

export function installMockDevtools(): void {
  window.__mocks = {
    getConfig: async () => (await fetch('/__mocks__/config')).json(),
    setScenario: (name) => control('/scenario', { name }),
    reset: () => control('/reset'),
    emitNftPriceChange: (nftId, factor) =>
      control('/nft', { nftId, action: 'price-up', factor }),
    selloutNft: (nftId) => control('/nft', { nftId, action: 'sellout' }),
    updateOrder: (orderId, status) => control('/order', { orderId, status }),
  }
}
