import { io, type Socket } from 'socket.io-client'
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@/api/types'
import { env } from './env'

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>

let socket: AppSocket | null = null

/**
 * Cliente Socket.IO único da aplicação.
 *
 * `transports: ['websocket']` é obrigatório: o MSW intercepta WebSocket, não o
 * fallback de polling HTTP. Use `autoConnect: false` e conecte sob demanda.
 */
export function getSocket(): AppSocket {
  if (!socket) {
    socket = io(env.socketUrl, {
      transports: ['websocket'],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
      reconnectionDelayMax: 4_000,
      timeout: 10_000,
    })
  }
  return socket
}

/** Libera listeners e conexão — chamado em logout/troca de usuário. */
export function resetSocket(): void {
  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
  }
  socket = null
}
