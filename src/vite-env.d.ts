/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  /** Habilita a camada de mocks (MSW + Socket.IO). */
  readonly VITE_ENABLE_MOCKS: string
  /** URL base da API REST simulada. */
  readonly VITE_API_URL: string
  /** URL base do servidor Socket.IO simulado. */
  readonly VITE_SOCKET_URL: string
  /** Cenário de mocks inicial (ver src/mocks/scenarios.ts). */
  readonly VITE_MOCK_SCENARIO: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
