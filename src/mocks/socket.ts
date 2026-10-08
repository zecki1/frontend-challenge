import { ws } from 'msw'
import { toSocketIo } from '@mswjs/socket.io-binding'
import type {
  NftUpdatedEvent,
  OrderUpdatedEvent,
  ServerToClientEvents,
} from '@/api/types'

/**
 * Integração de tempo real dos mocks.
 *
 * O transporte é o WebSocket interceptado pelo MSW, com o protocolo Socket.IO
 * aplicado por `@mswjs/socket.io-binding`. Limitação do binding: apenas o
 * namespace default e eventos textuais (sem acks/anexos binários). Os cenários
 * exercitam o `socket.io-client` real — não há atalhos via cache.
 */
type Emit = (event: string, payload: unknown) => void

const connections = new Set<Emit>()

export const socketHandlers = [
  // O MSW normaliza URLs de Socket.IO removendo o prefixo `/socket.io/` antes
  // de casar o padrão (WebSocketHandler.parse). Por isso o matcher é amplo; a
  // app usa um único WebSocket (socket.io-client).
  ws.link(/.*/).addEventListener('connection', (connection) => {
    const { client } = toSocketIo(connection)

    const emit: Emit = (event, payload) => {
      client.emit(event, payload)
    }
    connections.add(emit)

    client.on('subscribe', () => {
      // Namespaces default; nada a fazer — eventos são broadcast.
    })

    connection.client.addEventListener('close', () => {
      connections.delete(emit)
    })
  }),
]

/** Envia um evento para todos os clientes Socket.IO conectados. */
export function broadcast<Event extends keyof ServerToClientEvents>(
  event: Event,
  payload: Parameters<ServerToClientEvents[Event]>[0],
): void {
  for (const emit of connections) {
    emit(event as string, payload)
  }
}

export function broadcastNftUpdated(payload: NftUpdatedEvent): void {
  broadcast('nft.updated', payload)
}

export function broadcastOrderUpdated(payload: OrderUpdatedEvent): void {
  broadcast('order.updated', payload)
}

/** Usado apenas em testes/controle para inspecionar conexões ativas. */
export function activeConnectionCount(): number {
  return connections.size
}
