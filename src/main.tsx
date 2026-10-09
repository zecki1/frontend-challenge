import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import './i18n'
import { enableMocking } from './mocks'
import { setMswReady } from '@/lib/msw-ready'

/**
 * O app é renderizado imediatamente (sem esperar o MSW) para que o hero e a
 * imagem LCP apareçam o mais cedo possível. O MSW é ativado em background e,
 * quando pronto, as queries de API são habilitadas automaticamente.
 */
async function bootstrap(): Promise<void> {
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

  // Ativa o MSW em background — não bloqueia o render inicial
  await enableMocking()
  setMswReady()
}

void bootstrap()
