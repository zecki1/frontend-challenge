import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Nft, NftUpdatedEvent, Order, OrderUpdatedEvent } from '@/api'
import { queryKeys } from '@/api'
import { getSocket } from '@/lib/socket'
import { useAuth } from '@/features/auth/auth-context'
import { useMswReady } from '@/lib/msw-ready'

/**
 * Conecta o `socket.io-client` apenas para usuários autenticados e sincroniza o
 * cache do TanStack Query com os eventos. Eventos duplicados/antigos são
 * descartados por versão. Após reconexão, reconcilia via REST.
 *
 * Espera o MSW estar pronto antes de conectar: o `socket.io-client` captura o
 * `WebSocket` global no carregamento, e o MSW precisa estar pronto antes.
 */
export function RealtimeProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()
  const mswReady = useMswReady()

  useEffect(() => {
    if (!isAuthenticated || !mswReady) return

    let cancelled = false
    let socket: Awaited<ReturnType<typeof getSocket>> | null = null

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

    const onReconnect = () => {
      void queryClient.invalidateQueries()
    }

    void getSocket().then((s) => {
      if (cancelled) {
        s.disconnect()
        return
      }
      socket = s
      socket.on('nft.updated', onNftUpdated)
      socket.on('order.updated', onOrderUpdated)
      socket.on('connect', onReconnect)
      if (!socket.connected) socket.connect()
    })

    return () => {
      cancelled = true
      if (socket) {
        socket.off('nft.updated', onNftUpdated)
        socket.off('order.updated', onOrderUpdated)
        socket.off('connect', onReconnect)
        socket.disconnect()
      }
    }
  }, [isAuthenticated, mswReady, queryClient])

  return <>{children}</>
}
