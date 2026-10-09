import type { Socket } from 'socket.io-client'
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@/api/types'
import { env } from './env'

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>

let socket: Promise<AppSocket> | null = null

/**
 * Cliente Socket.IO único da aplicação.
 *
 * `socket.io-client` é importado dinamicamente para que o `engine.io-client`
 * (dentro do MSW) capture o `WebSocket` global antes — o MSW precisa estar
 * pronto antes de qualquer módulo que capture `globalThis.WebSocket`.
 *
 * `transports: ['websocket']` é obrigatório: o MSW intercepta WebSocket, não o
 * fallback de polling HTTP. Use `autoConnect: false` e conecte sob demanda.
 */
export function getSocket(): Promise<AppSocket> {
  if (!socket) {
    socket = import('socket.io-client').then(({ io }) =>
      io(env.socketUrl, {
        transports: ['websocket'],
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 500,
        reconnectionDelayMax: 4_000,
        timeout: 10_000,
      }) as AppSocket,
    )
  }
  return socket
}

/** Libera listeners e conexão — chamado em logout/troca de usuário. */
export async function resetSocket(): Promise<void> {
  if (socket) {
    const s = await socket
    s.removeAllListeners()
    s.disconnect()
  }
  socket = null
}
