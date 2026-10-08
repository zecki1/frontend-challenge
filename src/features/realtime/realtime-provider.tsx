import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Nft, NftUpdatedEvent, Order, OrderUpdatedEvent } from '@/api'
import { queryKeys } from '@/api'
import { getSocket } from '@/lib/socket'
import { useAuth } from '@/features/auth/auth-context'

/**
 * Conecta o `socket.io-client` apenas para usuários autenticados e sincroniza o
 * cache do TanStack Query com os eventos. Eventos duplicados/antigos são
 * descartados por versão. Após reconexão, reconcilia via REST.
 */
export function RealtimeProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) return

    const socket = getSocket()
    const versions = new Map<string, number>()

    const shouldApply = (resourceId: string, version: number): boolean => {
      const last = versions.get(resourceId)
      if (last !== undefined && version <= last) return false
      versions.set(resourceId, version)
      return true
    }

    const onNftUpdated = (event: NftUpdatedEvent) => {
      if (!shouldApply(event.resourceId, event.version)) return
      queryClient.setQueryData<Nft | undefined>(
        queryKeys.nfts.detail(event.resourceId),
        (prev) =>
          prev
            ? {
                ...prev,
                priceEth: event.priceEth,
                totalAvailable: event.totalAvailable,
                editions: event.editions,
                version: event.version,
              }
            : prev,
      )
      void queryClient.invalidateQueries({ queryKey: queryKeys.nfts.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart })
    }

    const onOrderUpdated = (event: OrderUpdatedEvent) => {
      if (!shouldApply(event.resourceId, event.version)) return
      queryClient.setQueryData<Order | undefined>(
        queryKeys.orders.detail(event.resourceId),
        (prev) =>
          prev
            ? {
                ...prev,
                status: event.status,
                txHash: event.txHash,
                failureReason: event.failureReason,
                version: event.version,
              }
            : prev,
      )
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart })
    }

    // Reconciliação completa após (re)conexão.
    const onReconnect = () => {
      void queryClient.invalidateQueries()
    }

    socket.on('nft.updated', onNftUpdated)
    socket.on('order.updated', onOrderUpdated)
    socket.on('connect', onReconnect)
    if (!socket.connected) socket.connect()

    return () => {
      socket.off('nft.updated', onNftUpdated)
      socket.off('order.updated', onOrderUpdated)
      socket.off('connect', onReconnect)
      socket.disconnect()
    }
  }, [isAuthenticated, queryClient])

  return <>{children}</>
}
