/**
 * Configuração de ambiente da aplicação.
 *
 * Os valores vêm de variáveis `VITE_*` (ver `.env.example`). Quando os mocks
 * estão habilitados, a API/REST e o Socket.IO apontam para os handlers do MSW.
 */

const truthy = new Set(['1', 'true', 'yes', 'on'])

function bool(value: string | undefined, fallback = false): boolean {
  if (value === undefined) return fallback
  return truthy.has(value.toLowerCase())
}

const mode = import.meta.env.MODE

export const env = {
  appTitle: import.meta.env.VITE_APP_TITLE ?? 'NFT Marketplace',
  /** Mocks ligados por padrão em desenvolvimento e no build de demonstração. */
  enableMocks:
    bool(import.meta.env.VITE_ENABLE_MOCKS, import.meta.env.DEV) ||
    mode === 'demonstration',
  apiUrl: import.meta.env.VITE_API_URL ?? '/api',
  socketUrl:
    import.meta.env.VITE_SOCKET_URL ||
    (typeof window !== 'undefined' ? window.location.origin : ''),
  mockScenario: import.meta.env.VITE_MOCK_SCENARIO ?? 'default',
  isDemo: mode === 'demonstration',
  resendApiKey: import.meta.env.VITE_RESEND_API_KEY ?? '',
} as const

export type Env = typeof env
