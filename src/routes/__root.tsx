import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { KurioHeader } from '@/components/layout/kurio-header'
import { KurioFooter } from '@/components/layout/kurio-footer'
import { SupportWidget } from '@/components/support-widget'
import { VlibrasWidget } from '@/components/vlibras-widget'

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
})

function RootLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-kurio-bg text-kurio-cream">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-kurio-copper focus:px-3 focus:py-2 focus:text-kurio-bg"
      >
        Pular para o conteúdo
      </a>
      <KurioHeader />
      <main id="conteudo" className="flex-1">
        <Outlet />
      </main>
      <KurioFooter />
      <SupportWidget />
      <VlibrasWidget />
      {import.meta.env.DEV ? <TanStackRouterDevtools position="bottom-right" /> : null}
    </div>
  )
}

function NotFoundPage() {
  return (
    <section className="mx-auto flex max-w-content flex-col items-center gap-3 px-4 py-24 text-center">
      <h1 className="text-4xl font-bold text-kurio-cream">404</h1>
      <p className="text-kurio-sand">A página que você procura não existe.</p>
      <Link to="/" className="text-kurio-copper underline">
        Voltar ao catálogo
      </Link>
    </section>
  )
}
