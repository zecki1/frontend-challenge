import { apiClient } from '@/lib/http'
import type { Network, Wallet, WalletPayload } from '../types'

export const walletsApi = {
  list: (signal?: AbortSignal) =>
    apiClient.get<Wallet[]>('/wallets', { signal }),
  networks: (signal?: AbortSignal) =>
    apiClient.get<Network[]>('/networks', { signal }),
  create: (payload: WalletPayload) =>
    apiClient.post<Wallet>('/wallets', payload),
  update: (id: string, payload: Partial<WalletPayload>) =>
    apiClient.patch<Wallet>(`/wallets/${id}`, payload),
}
