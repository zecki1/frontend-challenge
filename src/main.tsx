import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import './i18n'
import { enableMocking } from './mocks'

/**
 * Os mocks são ativados por configuração (dev/demonstração) antes do primeiro
 * request. O app é importado dinamicamente *após* o MSW subir, para que o
 * `engine.io-client` capture o `WebSocket` já interceptado.
 */
async function bootstrap(): Promise<void> {
  await enableMocking()

  const [{ RouterProvider }, { router }, { AppProviders }] = await Promise.all([
    import('@tanstack/react-router'),
    import('./app/router'),
    import('./app/providers'),
  ])

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </React.StrictMode>,
  )
}

void bootstrap()
