/**
 * Armazenamento do token de sessão.
 *
 * Fica isolado do cliente HTTP e das features para evitar dependências
 * circulares. Nunca armazenamos senha em claro — apenas o token opaco devolvido
 * pela API simulada.
 */
const STORAGE_KEY = 'nft-marketplace.session-token'

export const sessionToken = {
  get(): string | null {
    try {
      return window.localStorage.getItem(STORAGE_KEY)
    } catch {
      return null
    }
  },
  set(token: string): void {
    try {
      window.localStorage.setItem(STORAGE_KEY, token)
    } catch {
      /* storage indisponível (SSR/privado) — sessão apenas em memória */
    }
  },
  clear(): void {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  },
}
