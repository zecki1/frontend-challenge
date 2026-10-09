import { useSyncExternalStore } from 'react'

let mswReady = false
const listeners = new Set<() => void>()

/** Marca o MSW como pronto e notifica todos os subscribers. */
export function setMswReady(): void {
  mswReady = true
  listeners.forEach((listener) => listener())
}

export function isMswReady(): boolean {
  return mswReady
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): boolean {
  return mswReady
}

/** Hook reativo que retorna `true` quando o MSW está pronto. */
export function useMswReady(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot)
}
