# NFT Marketplace — Frontend Challenge

Implementação do **NFT Marketplace** em React + TypeScript seguindo o [layout no Figma](https://www.figma.com/design/Ff0SksUi7UFtPWUO8kyNtw/Frontend-Challenge?node-id=0-1). O enunciado completo está em [`docs/ENUNCIADO.md`](./docs/ENUNCIADO.md).

## Stack Obrigatória

| Responsabilidade | Tecnologia |
| --- | --- |
| Interface | React 19 |
| Linguagem | TypeScript |
| Roteamento | TanStack Router (file-based + search params validados com Zod) |
| Estado remoto | TanStack Query v5 |
| Cliente HTTP | Axios |
| Integração de dados | REST APIs |
| Tempo real | Socket.IO (cliente) + mock via MSW + `@mswjs/socket.io-binding` |
| Estilização | Tailwind CSS v3 |
| Componentes | shadcn/ui (Radix) |
| Formulários | react-hook-form + Zod |
| Mocking | MSW (REST + WebSocket) |
| Testes E2E / regressão visual | Playwright |
| Auditoria de performance | Lighthouse / Lighthouse CI |

---

## Requisitos

- Node.js 20+ (validado com Node 24)
- npm 10+
- Google Chrome instalado (apenas para auditoria Lighthouse)

---

## Setup

```bash
npm install          # instala dependências e o worker do MSW
npm run dev          # http://localhost:5173 (mocks ligados por padrão em dev)
```

### Variáveis de Ambiente

Copie `.env.example` para `.env` se quiser sobrescrever os padrões:

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `VITE_APP_TITLE` | `NFT Marketplace` | Título da aplicação |
| `VITE_ENABLE_MOCKS` | `true` em dev | Liga MSW + Socket.IO mockado |
| `VITE_API_URL` | `/api` | Base da API REST simulada |
| `VITE_SOCKET_URL` | mesma origem | URL do Socket.IO simulado |
| `VITE_MOCK_SCENARIO` | `default` | Cenário inicial de mocks |

Em desenvolvimento os mocks ligam automaticamente. No **build de demonstração** (`--mode demonstration`) também. Em produção (`npm run build`), ficam desligados.

---

## Credenciais Fictícias

| Usuário | E-mail | Senha |
| --- | --- | --- |
| Colecionadora | `collector@example.com` | `password123` |
| Investidor | `leo@example.com` | `senha123` |

Cadastro também está disponível e cria um novo usuário no mock.

---

## Comandos

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento (mocks ligados) |
| `npm run build` | Build de produção (mocks desligados) |
| `npm run build:demo` | Build de demonstração (mocks ligados) — use para publicar |
| `npm run preview` | Serve o build (`dist/`) |
| `npm run typecheck` | Gera rotas + `tsc -b` |
| `npm run lint` | ESLint |
| `npm run test:e2e` | Playwright (desktop + mobile) |
| `npm run test:e2e:report` | Abre o relatório HTML do Playwright |
| `npm run lighthouse` | Auditoria Lighthouse mobile + desktop (3 medições/página) |
| `npm run routes:generate` | Regenera `src/routeTree.gen.ts` |

---

## Cenários de Mocks

Configuráveis em runtime e reproduzíveis (ver `src/mocks/scenarios.ts`):

| Cenário | Efeito |
| --- | --- |
| `default` | Estado normal |
| `fast` / `slow-network` | Sem latência / latência alta e variável |
| `flaky` | ~50% de falhas transitórias (503) |
| `offline` | Erro de rede em todas as requisições |
| `empty-catalog` | Catálogo vazio |
| `session-expired` | 401 `session_expired` nas rotas autenticadas |
| `coupon-invalid` / `coupon-expired` | Cupom inválido / expirado |
| `price-changed` / `edition-soldout` | NFT muda de preço / esgota |
| `payment-declined` / `payment-approved` | Pagamento recusado / confirmado |
| `order-timeout` | Timeout após criar o pedido (recuperação por idempotência) |

Seleção/reset/eventos via `window.__mocks` (habilitado com mocks ligados):

```js
await window.__mocks.setScenario('slow-network')
await window.__mocks.reset()                     // restaura o estado conhecido
await window.__mocks.emitNftPriceChange('nft-001', 1.5)  // dispara nft.updated
await window.__mocks.selloutNft('nft-002')
await window.__mocks.updateOrder('<orderId>', 'confirmed') // dispara order.updated
```

Também há endpoints de controle (`/__mocks__/scenario`, `/__mocks__/reset`, `/__mocks__/nft`, `/__mocks__/order`, `/__mocks__/config`).

### Reproduzir Fluxos de Falha

```bash
npm run dev
# no console do navegador:
await window.__mocks.setScenario('offline')        # erro de rede + retry
await window.__mocks.setScenario('slow-network')   # skeletons de carregamento
await window.__mocks.setScenario('payment-declined')
await window.__mocks.setScenario('session-expired') # expiração de sessão
```

---

## Telas Implementadas (Base Arquitetural)

A base arquitetural está completa e validada. As rotas e integrações existem; agora o foco é aplicar a fidelidade visual conforme o Figma e completar os testes.

| Tela | Rota | Status |
| --- | --- | --- |
| Início | `/` | Rotas, catálogo, busca, filtros, ordenação, paginação, navegação para NFT |
| Mercado (Catálogo completo) | `/mercado` | Mesma base do Início com grid 3 colunas |
| Detalhes do NFT | `/nfts/:nftId` | Galeria, informações, edição, quantidade, favoritos, compra |
| Carrinho | `/cart` | Edição quantidades, remoção, cupom, resumo valores |
| Pagamento | `/checkout` | Dados colecionador, carteira, rede, revisão, envio |
| Confirmação | `/orders/:orderId` | Resultado, transação, itens, taxas, total |
| Login | `/login` | Autenticação, validação, retorno fluxo anterior |
| Cadastro | `/register` | Criação conta, validação, conflito |
| Perfil | `/account/profile` | Edição dados, avatar, senha |
| Carteiras | `/account/wallets` | Cadastro/edição carteira principal e secundária |

**Observação:** Perfil, Carteiras e Confirmação também funcionam em mobile (adaptados dos frames desktop).

---

## Estado da Implementação

### ✅ Base Arquitetural Completa

- **Stack obrigatória** integrada e funcionando: React/TS, TanStack Router, TanStack Query, Axios, MSW (REST + WebSocket), Socket.IO, Tailwind + shadcn/ui, Playwright, Lighthouse.
- **Contratos tipados** em `src/api/types.ts` (DTOs REST e eventos tempo real).
- **Endpoints REST** encapsulados em `src/api/endpoints/*` sem dados fictícios.
- **Mocks MSW** com estado consistente entre catálogo, favoritos, carrinho, perfil, carteiras e pedidos; persistência em `localStorage`; reset para cenário semente.
- **Cenários determinísticos** para todos os requisitos do enunciado (sucesso/vazio, latência, falhas, sessão expirada, conflito cadastro, cupom inválido/expirado, preço alterado/edição esgotada, timeout/idempotência, pagamento confirmado/recusado).
- **Tempo real Socket.IO** com eventos `nft.updated` e `order.updated`; identidade estável + versão; tolerância a duplicatas/antigos; reconciliação via REST após reconexão; isolamento por sessão.
- **Sessão e carrinho**: login/cadastro/logout, recuperação após refresh, expiração tratada no interceptor Axios, merge carrinho visitante→autenticado, snapshots de preço/disponibilidade, cotação bloqueia confirmação se houver mudança.
- **Precisão monetária**: ETH como strings decimais; `big.js` para aritmética; `Number` proibido em cálculos.
- **Acessibilidade parcial**: semântica (header/nav/main/footer), `fieldset`/`legend`, `aria-invalid` + mensagens associadas, `role="alert"`/`role="status"`, skeletons com `animate-pulse` + `motion-reduce:animate-none`, foco visível, "pular para o conteúdo".
- **Evidências**: typecheck, lint, build produção, build demo, 12/12 testes E2E passando (Chromium desktop + mobile).

### 🎯 Próximos Passos (Parte Visual + Testes Completos)

1. **Fidelidade visual 100% ao Figma** em todas as telas (desktop 1440px, tablet 768px, mobile 390px):
   - Ajustar cores, tipografia (Roboto Mono + Inter), espaçamentos, hierarquia, imagens, proporções, composição.
   - Adaptar componentes shadcn/ui à identidade visual KURIO (paleta: fundo creme `#F7F3EC`, cobre `#D28A4C`, textos escuros `#140D0A`, coral `#F0805F`).
   - Hero, catálogo (cards NFT com imagens/títulos/preços exatos), filtros (categorias, faixa de preço, rede funcional), seção Promos (2 cards textos alinhados à direita), Blog "Diário da Cunhagem", Footer completo (newsletter, features, colunas links, carteiras compatíveis, copyright).

2. **Interações faltantes**:
   - Botão "Entrar" no header abre modal de login (não navega para `/login`).
   - Filtro "Rede" funcional (clicar em Ethereum/Polygon/Solana filtra apenas NFTs da respectiva rede).
   - Clique no NFT navega para `/mercado/nft-<numero>` (detalhe).
   - Modal de cadastro (aba "Criar conta" no mesmo modal).

3. **Hooks de domínio** com atualização otimista (favoritos, quantidade carrinho) + rollback.

4. **Cobertura completa dos 12 cenários Playwright** + baselines de regressão visual (início, detalhe, carrinho, pagamento).

5. **Auditoria Lighthouse** executada e versionada (metas: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90).

---

## Deploy

Publique o **build de demonstração** para manter mocks e tempo real ativos:

```bash
npm run build:demo && npm run preview
```

Em Vercel/Netlify/Cloudflare Pages use o comando de build `npm run build:demo`. O roteamento é client-side com SPA fallback (necessário para acesso direto e refresh das rotas).

---

## Estrutura do Projeto

```
src/
├── api/            # contratos tipados, endpoints REST, query-keys
├── app/            # providers (Query/Auth/Realtime) e router
├── components/     # ui (shadcn) e componentes compartilhados
├── features/       # auth, realtime, catálogo, carrinho, checkout...
├── lib/            # axios, query-client, decimal (ETH), socket, env, erros
├── mocks/          # db, fixtures, handlers REST, socket, cenários
├── routes/         # rotas file-based TanStack Router
└── main.tsx        # bootstrap (mocks antes do app)
```

Consulte [`ARCHITECTURE.md`](./ARCHITECTURE.md) para contratos, política de sessão/cache, reconciliação REST↔Socket.IO e limitações dos mocks.

---

## Branches e Workflow Git

```
main      → produção (build estático; nunca push direto)
homolog   → validação/release de PRs (staging)
develop   → integração diária (merges das branches feat/*)
feature   → feat/<assunto> + PR para develop (boas práticas de código limpo)
```

**Commits:** `feat:`, `fix:`, `test:`, `docs:`, `design:`, `ops:`, `backend:` (conventional commits)  
**PRs:** sempre via pull request template; revisados e mergeados por milestone  
**main:** protegida — merge somente via PR de `homolog`

As branches `main`, `homolog` e `develop` possuem proteção com checks obrigatórios (`typecheck`, `lint`, `test:e2e`).

---

## Assets e Otimização

- **4 artes reais** extraídas do Figma (PNG 1254×1254) → `design/assets/` → convertidas para WebP (640 e 1280) via `npm run images:optimize` (~95% redução).
- **112 ícones/vetores** extraídos como SVG → `design/icons/` e `public/icons/`.
- **Specs por tela** (posições, tamanhos, textos, cores) → `design/screens/`.
- Tokens de design (fonte, paleta, tamanhos) → `design/README.md`.
- Fontes do Figma: **Roboto Mono** (Regular/Bold/Medium) + **Inter** (Semi Bold). Plano: self-host `.woff2`.

---

## Acessibilidade (WCAG 2.1 AA)

- Navegação por teclado e foco visível (`focus-visible:ring`) em todos os controles.
- Semântica adequada (`header/nav/main/footer`, `fieldset/legend`, `aria-label`, `aria-invalid`).
- Alternativas textuais em imagens relevantes; ícones decorativos com `aria-hidden`.
- Contraste legível; nenhum estado depende só de cor.
- Skeletons preservam dimensões (evita layout shift); respeita `prefers-reduced-motion`.
- Sem overflow horizontal indevido; sem perda de conteúdo com zoom até 200%.

---

## Performance

- Vite com code-splitting automático (TanStack Router).
- Chunk MSW (~320 KB) carregado lazy apenas quando mocks ligados.
- Imagens WebP com `srcset`/`sizes` (640 para cards, 1280 para herói/detalhe).
- Lighthouse CI configurado (`lighthouserc*.cjs` + `scripts/lighthouse.mjs`).
- Metas: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90.
- Registrar LCP, CLS, TBT; justificar desvios.

---

## Documentação Complementar

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — contratos REST, eventos, sessão, carrinho, cache, mocks, limitações, desvios do Figma.
- [`docs/ENUNCIADO.md`](./docs/ENUNCIADO.md) — enunciado completo do desafio.
- `design/README.md` — tokens de design extraídos do Figma.
- `design/screens/*.json` — specs por tela (desktop/mobile).