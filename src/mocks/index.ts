import { env } from '@/lib/env'
import { mockConfig } from './config'

let started = false

/**
 * Ativa a camada de mocks por configuração. Em build de demonstração
 * (`--mode demonstration`) e em desenvolvimento os mocks ficam ligados; em
 * produção, `VITE_ENABLE_MOCKS=false` desliga.
 */
export async function enableMocking(): Promise<void> {
  if (!env.enableMocks || started) return
  started = true

  // O worker (e o interceptor de WebSocket) precisa subir ANTES de importar
  // qualquer módulo que capture `globalThis.WebSocket` — o `engine.io-client`
  // faz isso no carregamento. Por isso os imports são sequenciais aqui.
  const { worker } = await import('./browser')
  await worker.start({
    onUnhandledRequest: 'bypass',
    // `quiet` silencia o log de requests do MSW no console (ruído de dev)
    quiet: true,
    serviceWorker: { url: '/mockServiceWorker.js' },
  })

  const { installMockDevtools } = await import('./devtools')
  mockConfig.setScenario(env.mockScenario)
  installMockDevtools()
}
