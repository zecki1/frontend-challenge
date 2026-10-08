/**
 * Cenários determinísticos de mocks.
 *
 * Cada cenário ajusta latência/falhas e alguns comportamentos de negócio para
 * exercitar carregamento, erros, recuperação e tempo real. Podem ser trocados em
 * runtime pelo endpoint de controle `POST /__mocks__/scenario`.
 */

export type OrderOutcome = 'auto' | 'approve' | 'decline' | 'timeout-after-create'
export type CouponMode = 'normal' | 'invalid' | 'expired'
export type NftMutation = 'none' | 'price-up' | 'sellout'

export interface MockScenario {
  /** Latência base aplicada a toda resposta REST. */
  latencyMs: number
  /** Variação aleatória somada à latência (respostas fora de ordem). */
  jitterMs: number
  /** Fração (0..1) de requisições que falham com 503 transitório. */
  failRate: number
  /** Simula ausência de conexão (erro de rede). */
  offline: boolean
  /** Força 401 `session_expired` em rotas autenticadas. */
  forceSessionExpired: boolean
  /** Catálogo sempre vazio (testa estado vazio). */
  emptyCatalog: boolean
  /** Resultado do pagamento simulado. */
  orderOutcome: OrderOutcome
  /** Comportamento da validação de cupom. */
  couponMode: CouponMode
  /** Mutação aplicada aos NFTs durante o checkout (tempo real). */
  nftMutation: NftMutation
}

export const defaultScenario: MockScenario = {
  latencyMs: 120,
  jitterMs: 80,
  failRate: 0,
  offline: false,
  forceSessionExpired: false,
  emptyCatalog: false,
  orderOutcome: 'auto',
  couponMode: 'normal',
  nftMutation: 'none',
}

export const scenarios: Record<string, Partial<MockScenario>> = {
  default: {},
  'fast': { latencyMs: 0, jitterMs: 0 },
  'slow-network': { latencyMs: 2_000, jitterMs: 1_200 },
  'flaky': { failRate: 0.5 },
  'offline': { offline: true },
  'empty-catalog': { emptyCatalog: true },
  'session-expired': { forceSessionExpired: true },
  'coupon-invalid': { couponMode: 'invalid' },
  'coupon-expired': { couponMode: 'expired' },
  'price-changed': { nftMutation: 'price-up' },
  'edition-soldout': { nftMutation: 'sellout' },
  'payment-declined': { orderOutcome: 'decline' },
  'payment-approved': { orderOutcome: 'approve' },
  'order-timeout': { orderOutcome: 'timeout-after-create' },
}

export function resolveScenario(name: string): MockScenario {
  const partial = scenarios[name] ?? scenarios.default
  return { ...defaultScenario, ...partial }
}
