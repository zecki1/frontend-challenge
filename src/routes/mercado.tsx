import { Outlet, createFileRoute } from '@tanstack/react-router'

/**
 * Layout de `/mercado`. O conteúdo do catálogo vive em `mercado.index.tsx`.
 *
 * Motivo: `mercado.nft.$nftNumber.tsx` é filho deste rote no arquivo de rotas,
 * então este componente precisa de um `<Outlet>` — sem ele, abrir
 * `/mercado/nft/001` renderizava só o pai (banner + `#catalogo` + filtros) e a
 * tela de detalhe nunca montava.
 */
export const Route = createFileRoute('/mercado')({
  component: () => <Outlet />,
})
