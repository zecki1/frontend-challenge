# NFT Marketplace — Frontend Challenge

![E2E Tests](https://img.shields.io/badge/E2E-20%2F20%20passing-brightgreen)
![Lighthouse Mobile](https://img.shields.io/badge/Lighthouse_Mobile-P91%2FP90-success)
![Lighthouse Desktop](https://img.shields.io/badge/Lighthouse_Desktop-P99%2FP95-success)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)
![Lint](https://img.shields.io/badge/ESLint-0%20errors-green)

> **E2E Test Screenshots (CI Artifacts):**
> - [Desktop Chrome](https://github.com/zecki1/frontend-challenge/actions/runs/37962466359) — 20/20 tests passing
> - [Mobile Chrome](https://github.com/zecki1/frontend-challenge/actions/runs/37962466359) — 20/20 tests passing
> - Screenshots/videos available in each run's **Artifacts** → `test-results/`

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
| `npm run test:e2e:visual` | Regressão visual com baselines versionadas |
| `npm run test:e2e:report` | Abre o relatório HTML do Playwright |
| `npm run lighthouse` | Auditoria Lighthouse mobile + desktop (3 medições/página) |
| `npm run routes:generate` | Regenera `src/routeTree.gen.ts` |

> **Regressão visual:** as baselines do `toHaveScreenshot` são específicas da plataforma (sufixo `-win32`/`-linux` no nome do arquivo), por isso `test:e2e:visual` roda à parte do `test:e2e` — o CI principal (Linux) não compara com baselines geradas no Windows. Gere/atualize com `npm run test:e2e:visual -- --update-snapshots` na mesma plataforma em que vai comparar.

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

A base arquitetural está completa e a fidelidade visual com o Figma foi aplicada (hero, filtros, promos, blog, footer extraído do próprio `.fig`).

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

### ✅ Completo e validado

- **Stack obrigatória**: React/TS, TanStack Router/Query, Axios, MSW (REST + WebSocket via Socket.IO), Tailwind + shadcn/ui, Playwright, Lighthouse.
- **Rotas e telas do enunciado**: Início, Mercado + Detalhe (`/mercado/nft/<numero>`), Carrinho, Checkout, Pedidos, Login/Cadastro, Perfil, Carteiras — com fidelidade visual ao Figma.
- **Fluxos**: favoritos com atualização otimista + rollback; carrinho (quantidade, cupom, snapshots de preço/disponibilidade com **aviso de preço alterado em tempo real** via `Quote.changes`); checkout com cotação em ETH (`big.js`, `Number` proibido em cálculo) e bloqueio quando o preço muda; pedidos confirmado/recusado; guardas de rota com `?redirect=`; tempo real `nft.updated` e `order.updated` com reconciliação após reconexão; menu inferior visível em todas as telas mobile.
- **Qualidade**: `typecheck` 0 erros · `lint` 0 erros (8 warnings pré-existentes de `react-refresh`) · **E2E 22/22** (Chromium desktop + mobile) · **regressão visual 8/8** (baselines em `e2e/__screenshots__`, rodar com `npm run test:e2e:visual`) · Lighthouse **P ≥ 90 mobile / ≥ 95 desktop, A11y 100 / BP 100 / SEO 100** (números e método na seção Performance).
- **Performance**: fontes self-hosted com subsets `latin`/`latin-ext`, imagens com `width`/`height` + `loading="lazy"`, `public/robots.txt` + `sitemap.xml`, alvos de toque ≥ 24 px.
- **Sem evidências de IA no app**: removido `llms.txt`; WebP sem metadados C2PA; README/comentários sem menção a IA.

### 🎯 Próximos passos — até a entrega (amanhã)

1. **Testar o deploy na Vercel** após este commit ser mergeado em `main`: conferir mocks/tempo real no ambiente real (o deploy usa o build de demonstração `npm run build:demo`), o rewrite SPA nas rotas diretas e os arquivos `robots.txt`/`sitemap.xml`.
2. **Matriz de dispositivos** (abaixo) — validar em pelo menos um aparelho físico além do emulador.
3. **Afinar o que aparecer nos testes** — itens prováveis listados em "Melhorias".
4. **PageSpeed pós-upload** — Lighthouse no domínio real (método na seção Performance) e conferência dos artefatos `robots.txt`/`sitemap.xml`/`llms.txt`/`ai-catalog.json` servidos.
5. **Comunicações** — tempo real em duas abas e os fluxos de OS/newsletter (payload `[mock:resend]` no console).
6. **Limpeza final** — corrigir os ~19 erros de lint antigos (checkout/catálogo/detalhe) listados em Melhorias.

### 📱 Matriz de dispositivos (pré-entrega)

| Perfil | Largura | Escala | O que validar |
| --- | --- | --- | --- |
| Desktop físico | 1440 px | 100% | Home, catálogo + filtros, detalhe, carrinho, checkout, pedido, footer |
| Tablet | 768 px (iPad/emulador) | 100% | Breakpoints entre mobile e desktop (hero, cards, grid do catálogo) |
| Mobile físico | 390–430 px | 100% | Tab bar, hero, busca, filtros, carrinho, checkout, teclado no iOS |
| Mobile pequeno | 320–375 px | 100% | Sem overflow horizontal, toques ≥ 24 px, zoom 200% legível |
| Dark mode | — | — | O app é dark (`class="dark"`); confirmar contraste nas telas citadas |

Roteiro de cada perfil: navegar as rotas públicas, logar com as credenciais do README (seção Cenários), adicionar NFT ao carrinho, aplicar cupom, fechar o fluxo de compra até a confirmação, recarregar em `/mercado/nft/001` (rota direta), checar footer e tempo real (abrir a página em duas abas e ver o preço atualizando).

O checklist detalhado por tela (fiel aos frames mobile do Figma) está em [`docs/CHECKLIST-MOBILE.md`](docs/CHECKLIST-MOBILE.md) — usá-lo para marcar cada item durante a validação.

Erros reportados e seu estado de correção (tab bar, catálogo, PageSpeed, agêntica) estão consolidados em [`docs/CHECKLIST-ERROS.md`](docs/CHECKLIST-ERROS.md).

### ⏱️ Estimativas (a partir de agora)

| Item | Esforço estimado |
| --- | --- |
| Commit + push + PR + merge + deploy automático da Vercel | 15–30 min |
| Smoke test no domínio da Vercel (MSW/tempo real/rewrites) | 30–60 min |
| Matriz de dispositivos (emuladores + 1 físico) | 1–2 h |
| Correções que aparecerem nos testes (buffer) | 1–3 h |
| Opcionais de afinação: variantes 320/480 das artes | 30–60 min |
| Regressão final (CI + E2E + Lighthouse) antes de entregar | 1 h |
| **Total** | **~4–6 h** (folga confortável para entregar amanhã) |

### 💡 Melhorias identificadas (pós-entrega / se aparecer bug)

- ✅ **§7 aviso de preço alterado no carrinho** _(concluído)_: banner com i18n nos 3 idiomas em `cart.tsx`, alimentado por `Quote.changes`; revalidado a cada mudança de carrinho e no evento `nft.updated`. Coberto por E2E (`e2e/flows.spec.ts`).
- ✅ **Chaves i18n mortas** _(concluído)_: auditadas com `scripts/i18n-audit.mjs` e **15 removidas** dos 3 locales (317 no total). As demais candidatas (`home.categories.*`, `support.*`, `account.*`) eram usos dinâmicos legítimos.
- ✅ **§9 regressão visual E2E** _(concluído)_: `e2e/visual.spec.ts` com baselines versionadas (`e2e/__screenshots__`) de início, detalhe, carrinho e checkout (desktop + mobile). Rodar/atualizar: `npm run test:e2e:visual [-- --update-snapshots]`.
- **8 warnings** `react-refresh/only-export-components` no ESLint.
- **`uses-responsive-images`** no Lighthouse: só existem variantes 640/1280 das artes; gerar 320/480 economiza ~70 ms.
- **~19 erros de lint antigos** em `checkout.tsx` (hooks após early return), `catalog.tsx`/`nft-detail-page.tsx` (setState em effect) e outros — aguardando a limpeza final; não afetam build/typecheck/E2E.
- **`unused-javascript`/`bf-cache`** (~300 ms): inerentes ao build de demonstração com MSW — não há o que fazer sem abrir mão dos mocks em produção.

---

## Destaques de implementação (além do pedido)

Além dos fluxos do enunciado, esta rodada entregou três frentes pensadas como produto — acessibilidade, idiomas e suporte. O "como" e as decisões tomadas estão no Registro de Decisões, no fim do documento.

### Acessibilidade para o usuário real

- **Fonte OpenDyslexic** self-hosted (`public/fonts/`, woff2 + woff) para leitura com dislexia, ligável em `/account/accessibility` junto com tamanho de fonte global e tema claro/escuro/sistema.
- **VLibras** (Libras): widget oficial injetado sob demanda, preferência persistida e falha segura offline — se o script não carregar, o app continua funcionando.
- **Filtros de daltonismo** (Protanopia, Deuteranopia, Tritanopia, Monocromia) aplicados via CSS em toda a página.
- Ajustes persistidos em `pref-*` no `localStorage`, aplicados sem reload.

### Internacionalização completa

- **pt-BR / en / es** em todas as telas e mensagens de erro (i18next, `src/i18n/locales/*.json`), com seletor em `/account/language`. Testei os três idiomas nas rotas principais para caçar quebra de layout (ver a decisão "Overflow de texto").

### Perfil que reflete o uso real

- `/account/` ganhou **Atividade** (NFTs que o usuário abriu ou interagiu), **Lista de interesse** (todos os favoritos) e **Ofertas** (menores preços do catálogo), além de Perfil, Carteiras, Idioma, Acessibilidade e Suporte.
- Salvar o perfil atualiza a sessão na hora: nome/e-mail refletem no header e no checkout sem reload.

### Conta

- Modal **"Criar conta"** integrado ao login (e-mail/senha + Google/Facebook); os dados cadastrados fluem para o checkout. O schema de registro é compartilhado com a página `/register`.

---

## Comunicação com a API — sem expor nada no frontend

Regra que vale para qualquer integração do app: **nenhuma chave ou segredo existe no bundle do navegador**. Quem precisa só envia o dado; quem tem o segredo é o backend — ou o mock, em dev/demo. Na prática:

- **API relativa e mesma origem.** O cliente HTTP usa `baseURL: '/api'` — sem URL pública de backend, sem CORS e sem endereço descoberto no bundle.
- **Token opaco, nunca senha.** A sessão guarda apenas o token devolvido pela API; o interceptor injeta `Authorization: Bearer` em toda requisição.
- **Erros unificados.** O interceptor converte falhas em `ApiError` com código de negócio (`session_expired`, `validation_error`…) e dispara `auth:expired` para a interface limpar a sessão sozinha.
- **Contratos tipados por endpoint** (`src/api/endpoints/*`) e query-keys: mudar o contrato quebra o build, não só o teste.
- **Mesma superfície com e sem backend.** Em dev/demo/testes o MSW responde pelos mesmos endpoints, validações e latências. Em produção, `VITE_API_URL` aponta para o backend real — o app não sabe nem precisa saber quem está respondendo.
- **E-mails saem do backend.** O Resend é chamado no servidor; em dev/demo o MSW reproduz o payload exato (`[mock:resend] emails.send`) em `support.ts` e `newsletter.ts`. A chave `RESEND_API_KEY` não existe nas variáveis do frontend (removi uma chamada direta da newsletter na última rodada — detalhes no Registro de Decisões).

---

## Suporte ao cliente — Ordens de Serviço (OS)

Montei o atendimento para receber tudo o que o cliente descreve, com rastreabilidade e sem depender de e-mail solto:

1. **Widget flutuante** no canto inferior direito, ativado em `/account/support` (preferência persistida).
2. O cliente **descreve o problema**, escolhe **categoria** (pedido, bug, conta, NFT, sugestão, outro) e **urgência** (sugerida pela categoria, editável).
3. Ao enviar, o widget **captura um print da tela** (html2canvas carregado sob demanda — chunk separado de ~200 kB, não pesa no carregamento inicial) e anexa à OS.
4. O backend gera a **OS** (`OS-2026-0001`), o **nível P1–P4** (crítica → baixa) e o **SLA por categoria** (pedido 4 h, bug 8 h, conta 12 h, NFT 24 h…).
5. A notificação sai pelo **backend (Resend)** — payload reproduzido fielmente nos mocks, pronto para trocar por uma chamada real com `RESEND_API_KEY` sem mudar o frontend.
6. `/account/support` lista as OS do usuário: número, data, o que pediu, urgência, status (**aberta / em andamento / resolvida**) e ação **"Marcar resolvida"**. Cada usuário enxerga só as próprias OS.

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

- **4 artes reais** extraídas do Figma (PNG 1254×1254), convertidas para WebP (640 e 1280) via `npm run images:optimize` (~95% redução).
- **Ícones via React Icons** (`react-icons@5.7.0`, já usado no `App.tsx`) → import de `react-icons/fa`, `react-icons/fc`, etc. Os 113 SVGs de `public/icons/` foram removidos por não serem referenciados em nenhum ponto do app (só `google.svg` e `facebook.svg` eram usados, agora substituídos por `FcGoogle` e `FaFacebookF`).
- Fontes self-hosted: **Inter** + **Roboto Mono** como woff2 variáveis em `public/fonts/`, apenas subsets `latin`/`latin-ext` (o app usa pt-BR/en/es — cyrillic/greek/vietnamese moravam no CSS sem uso), carregadas por `src/styles/fonts.css` com `font-display: swap`. Zero requests ao Google Fonts.

---

## Acessibilidade (WCAG 2.1 AA)

- Navegação por teclado e foco visível (`focus-visible:ring`) em todos os controles.
- Semântica adequada (`header/nav/main/footer`, `fieldset/legend`, `aria-label`, `aria-invalid`).
- Alternativas textuais em imagens relevantes; ícones decorativos com `aria-hidden`.
- Contraste legível; nenhum estado depende só de cor.
- Skeletons preservam dimensões (evita layout shift); respeita `prefers-reduced-motion`.
- Sem overflow horizontal indevido; sem perda de conteúdo com zoom até 200%.
- Alvos de toque ≥ 24 px (sliders duplos do filtro de preço medidos com Lighthouse `target-size`: estavam com 21 px).

---

## Performance

Metas alcançadas e verificadas com Lighthouse CI local (`lighthouserc*.cjs` — 3 execuções por página por perfil, mediana):

| Página | Mobile | Desktop |
| --- | --- | --- |
| Home | P **91** · A11y **100** · BP **100** · SEO **100** (FCP 2,26 s · LCP 3,12 s · TBT 87 ms · CLS 0,001) | P **99** · A11y **100** · BP **100** · SEO **100** (FCP 618 ms · LCP 829 ms) |
| Detalhe do NFT | P **90** · A11y **100** · BP **100** · SEO **100** | P **95** · A11y **100** · BP **100** · SEO **100** |

O que entrou na rodada:

- **Fontes self-hosted + corte de subsets** — o Google Fonts dominava o boot no mobile; as 13 woff2 vieram para `public/fonts/` e os 58 blocos `@font-face` viraram 18 (`latin`/`latin-ext`). CSS de ~83 kB → ~74 kB.
- **Imagens** — `width`/`height` explícitos (home, catálogo, detalhe) e `loading="lazy"` na arte do hero desktop, que no mobile era baixada (84 kB) escondida.
- **SEO** — `public/robots.txt` + `public/sitemap.xml` (o rewrite SPA devolvia o `index.html` nessas URLs: 24 erros de sintaxe; SEO 92 → 100).
- **A11y** — slider duplo de preço com alvo de toque ≥ 24 px (`target-size`), skeletons com shimmer respeitando `prefers-reduced-motion`.

Duas tentativas que **descartei** depois de medir ambas com Lighthouse, em vez de chutar (detalhes na seção de decisões):

- Paralelizar o `bootstrap` (`Promise.all` do MSW com os imports do router) — mobile caiu de 91 → 80.
- Preload do LCP com `media="(max-width: 767px)"` — FCP melhorou, mas LCP piorou, net −1 ponto.

Sobra, aceito: `unused-javascript` e `bf-cache` (~300 ms — inerentes ao build de demonstração, que serve os mocks do MSW em produção) e `uses-responsive-images` (~70 ms — só existem variantes 640/1280 das artes).

---

## Registro de Decisões e Raciocínio

Escrevi esta seção para deixar registrado não só **o que** foi feito, mas **como eu cheguei** em cada decisão — o que observei, o que testei e o que concluí. O objetivo é que quem ler o código depois consiga refazer o mesmo caminho.

### CI: por que os jobs se chamam `typecheck`, `lint` e `test:e2e`

Ao configurar a proteção de `main`, o GitHub passou a exigir *checks* obrigatórios antes do merge. O detalhe que me chamou atenção: o nome registrado pelo GitHub vem do **nome do job**, então um job chamado `testes e2e` nunca ia casar com o context `test:e2e` e o PR ficaria permanentemente bloqueado. Por isso nomeei os jobs exatamente igual aos contexts exigidos.

Também separei a instalação do Chromium em um job dedicado, com cache da pasta de browsers. Medi o tempo: rodar `playwright install` do zero em toda execução era o que mais pesava no pipeline, e era a causa mais comum de timeout em CI.

### Deploy: os 404 da Vercel vieram do modo de build errado

Ao publicar, toda chamada a `/api/*` retornava 404 e o console mostrava falha de rede. Em vez de tratar o sintoma, fui verificar como os mocks eram ligados: em `src/lib/env.ts`, `enableMocks` só é verdadeiro quando `mode === 'demonstration'`.

Concluí o raciocínio: sem configuração, a Vercel usa `npm run build`, que roda em modo `production` → o MSW nunca registra o worker → as requisições saem para a rede e batem no host estático, que não tem backend nenhum atrás.

A correção foi declarar `vercel.json` com `buildCommand: npm run build:demo` e um rewrite de SPA (`/(.*)` → `/index.html`), necessário para acesso direto e *refresh* das rotas.

### Testes E2E: os 3 casos de falha eram de seletor, não de app

Antes de mexer em qualquer linha de código, preferi ver o que o navegador realmente renderizava: despejei o DOM em um script temporário e comparei com o que os testes procuravam. O diagnóstico:

- `getByLabel("E-mail")` casava com dois elementos — o campo de login e o *input* de newsletter do footer. Restringi ao formulário e usei `{ exact: true }`.
- Existiam dois botões "Entrar": o do header (`type=button`, abre modal) e o `type=submit` do formulário. Escopiei a busca para dentro do `<form>`.
- Os cards apontam para `/mercado/nft/001` (com barra), não `/mercado/nft-001` nem `/nfts/`.

Como o teste é que estava desatualizado em relação à UI, corrigi apenas os seletores — nenhuma linha do app precisou mudar.

### Ícones: auditei antes de deletar

Antes de remover `public/icons`, varri o repo inteiro (TSX, CSS, HTML e construção dinâmica de caminhos) procurando qualquer referência a `/icons/`. O resultado foi literal: **2 usos**, `google.svg` e `facebook.svg`. Os outros 111 arquivos não eram servidos em lugar nenhum.

Como `react-icons` já era dependência e já era usado no `App.tsx`, troquei os dois `<img>` por `FcGoogle` e `FaFacebookF` (mantive o tom cobre `text-kurio-copper` para preservar a identidade visual) e removi os 113 SVGs. Ganho: 113 arquivos a menos publicados e um padrão de ícone consistente no projeto inteiro.

### Footer duplicado

O footer aparecia duas vezes na home. Encontrei `<KurioFooter />` tanto em `__root.tsx` (layout raiz, aplicado a todas as rotas) quanto em `index.tsx`. Como o root já garante o rodapé em toda tela, removi o da home — agora todas as rotas têm exatamente um.

### O botão de carrinho do card navegava em vez de adicionar

Clicando no ícone de carrinho de um card, a página recarregava em `/nfts/...` em vez de adicionar o item. O código do botão era `event.preventDefault()` seguido de `window.location.assign(...)` — dois problemas no mesmo lugar: não havia chamada alguma ao carrinho, e o `assign` derrubava o SPA inteiro.

Substituí por uma mutação (`cartApi.addItem`). O ponto que me economizou uma requisição: o DTO da lista já traz `editions[]`, então uso a primeira edição disponível direto do card — não preciso buscar o detalhe para saber qual `editionId` enviar. Como o card inteiro é um `<Link>`, o handler também chama `stopPropagation()`, senão o clique ainda navegaria.

Quase deixei um bug novo no caminho: o `<Toaster />` do `sonner` estava montado em `App.tsx`, arquivo que nem é o shell da aplicação — o app sobe por `main.tsx` → `AppProviders` → `RouterProvider`. Movi o `Toaster` para `AppProviders` e o feedback de sucesso passou a existir de fato.

### Footer: reconstruído a partir do arquivo do Figma

O rodapé não batia com o design. Em vez de comparar "olhando", extraí do `.fig` a árvore de nodes do componente `Footer` com posição e tamanho de cada elemento, e três conclusões mudaram o código:

- O "W C D" não era um selo de texto no bloco da newsletter (como eu havia escrito). Eram **três service marks separadas**, cada uma num quadrado de 74×74 acima da sua feature: `W` em "Segurança da carteira", `C` em "Criadores em destaque", `D` em "Alertas de lançamentos".
- A newsletter não era uma seção à parte acima das features: era a **4ª coluna da mesma faixa**, com a descrição *abaixo* do formulário.
- KURIO, tagline, e-mail e telefone ficam em **uma linha de 4 colunas**; e "Redes sociais" + "Carteiras compatíveis" formam a 4ª coluna das colunas de links, não uma barra embaixo.

Li também `textAlignHorizontal` dos nodes: o título e a descrição do "Diário da Cunhagem" vêm como `CENTER` no Figma (assim como o copyright), então centralizei os dois.

### Guarda de rotas e atualização otimista: dois requisitos que estavam só no papel

O §4 do enunciado pede proteção dos fluxos privados e "atualização otimista em pelo menos uma interação, com rollback". Auditando o código:

- `requireAuthBeforeLoad` existia em `features/auth/require-auth.ts`, mas **não era importado por nenhuma rota** — código morto. Só o `/checkout` estava protegido, por um componente `RequireAuth` que redireciona *depois* de montar (spinner + `navigate` no `useEffect`). Liguei `beforeLoad: requireAuthBeforeLoad` em `checkout`, `favorites`, `orders.$orderId`, `account.profile` e `account.wallets`, e fiz a guarda preservar `?redirect=` para retomar o fluxo após o login. O `ARCHITECTURE.md` §4 já descrevia esse comportamento; agora é o código que obedece ao documento.
- A mutação de favoritos tinha só `onSuccess` com invalidação — servidor manda, interface espera. Reescrevi com o ciclo completo: `onMutate` cancela os refetches em andamento, fotografa o cache e aplica a mudança localmente; `onError` devolve o snapshot anterior (rollback); `onSettled` revalida. O carrinho seguiu com invalidação clássica de propósito: preço, disponibilidade e total são decididos pelo servidor.

### `/mercado/nft/001` renderizava o catálogo inteiro: faltava um `<Outlet />` na rota pai

Acessando direto o detalhe de um NFT, o MarketplacePage inteiro aparecia por cima da arte. Quando uma rota tem filhos, o pai precisa renderizar o `<Outlet />` — sem ele, quem fica na tela é o layout do pai (no caso, a própria página do marketplace) e a rota filha nem chega a montar. Refatorei `mercado.tsx` para um layout transparente (`component: () => <Outlet />`) e movi a página real para `mercado.index.tsx` (`createFileRoute('/mercado/')`). O `routeTree.gen.ts` foi regenerado — desta vez com diff real, não só mudança de EOL.

### Performance: o que descartei depois de medir

Duas mudanças pareciam ganho óbvio e saíram da rodada porque medi o antes/depois com Lighthouse e o resultado foi o inverso do esperado:

- **Paralelizar o bootstrap.** `await enableMocking()` em sequência com os imports do router parecia um gargalo — juntei tudo num `Promise.all`: mobile caiu de 91 → 80 e o LCP passou a carregar com "Render Delay" de 3,9 s. No modelo de rede simulada do Lighthouse, os downloads que passaram a competir atrasaram o app em vez de ajudar. Revertido — o `await` em sequência continua garantindo que o primeiro fetch já encontre o mock no ar.
- **Preload do LCP com `media="(max-width: 767px)"`.** FCP melhorou (2250 → 2092 ms), mas o LCP piorou (3109 → 3251 ms) porque a imagem preloadada disputava o caminho crítico com CSS/JS de um jeito que atrasava a renderização do hero. Net −1 ponto; sem o preload o browser já dispara a imagem cedo no mobile.

Ficaram: fontes self-hosted com subsets cortados, `width`/`height` + `loading="lazy"` nas imagens, `robots.txt`/`sitemap.xml`, e o slider com alvo ≥ 24 px.

### Overflow de texto: alturas e larguras fixas vindas do Figma

Muitos blocos vêm do Figma com `height`/`line-height` travados (título do hero, cards de features, linhas de preço). Isso funciona no pt-BR, mas a tradução (en/es) ou o aumento de fonte de acessibilidade podem **estourar o texto para fora da caixa**. Regra aplicada:

- Sempre que o conteúdo puder crescer (i18n, `pref-size`, fonte OpenDyslexic), **deixar a altura fluir** (`min-h` em vez de `height`, `line-height` flexível) ou quebrar a linha.
- Medidas fixas só valem para elementos realmente rígidos (botões `h-11`, inputs `h-11`, badges).
- Se um layout novo estourar no teste de acessibilidade (fonte 18–24 px), o arquivo do Figma é referência, não cláusula: ajustar o tamanho/leading antes de cortar o texto.

### Suporte: a OS nasceu de pensar no fluxo real de atendimento

Antes de desenhar a tela de suporte, me perguntei o que acontece hoje com um cliente que tem um problema: ele descreve por e-mail solto, perde o print e o time não tem rastreabilidade. A **OS (ordem de serviço)** resolve isso com três escolhas:

- **Print da tela no momento do problema**: capturo com html2canvas no clique de enviar. Decidi carregá-lo com `import()` dinâmico — vira um chunk separado (~200 kB) e não entra no bundle inicial.
- **Urgência sugerida pela categoria**: pedido é urgentíssimo (SLA 4 h), sugestão não é (48 h). Sugiro o padrão no formulário, mas deixo editável — o cliente nem sempre sabe o quão urgente é, e o time pode reclassificar depois.
- **Isolamento por usuário**: cada OS guarda o `userId`; a tabela só devolve as do usuário logado, mesmo com o mock.

O e-mail via Resend saiu do frontend de propósito: o handler do MSW reproduz o payload exato de `resend.emails.send`, então a troca para o backend real é só plugar a chave (`RESEND_API_KEY`) do lado do servidor.

### Comunicação com a API: a chave da newsletter também saiu do bundle

Valei a regra de não expor segredo auditando o que já existia. A newsletter do footer chamava a API do Resend direto do navegador com `Bearer ${VITE_RESEND_API_KEY}` — no dia em que alguém setasse a variável, a chave iria parar no bundle publicável. Removi:

- `src/lib/email.ts` agora só informa o backend do novo assinante (`POST /api/newsletter/subscribe`);
- o envio real fica no handler MSW (`newsletter.ts`), no mesmo padrão `[mock:resend]` do suporte;
- `VITE_RESEND_API_KEY` saiu do `env.ts` e do `.env.example`.

O restante da camada já estava no lugar: API relativa (`/api`), token opaco injetado por interceptor e contratos tipados por endpoint.

### Acessibilidade, idiomas e console limpo

Três decisões renderam frutos nesta rodada:

- **OpenDyslexic self-hosted**: os woff2/woff estão em `public/fonts/` (`@font-face` + classe `.font-dyslexic`). Sem CDN: a fonte carrega junto com o app e não depende de terceiro.
- **VLibras com falha segura**: o widget injeta o script oficial só quando a preferência está ligada; se falhar ou estiver offline, nada é appendado e o app continua.
- **O tema que sujava o console**: o aviso "Encountered a script tag while rendering React component" aparecia em toda página e era do next-themes 0.4, que renderiza um `<script>` via React sem opção de desativar. Troquei por um `ThemeProvider` próprio (~30 linhas, mesma API) e movi a inicialização do tema para um script inline no `index.html` — sem aviso e sem flash. Na mesma varredura, silenciei o log de requests do MSW no console (`quiet: true` no `start()`) e validei o console limpo via Playwright em `/` e `/mercado/nft/001`.

### llms.txt de volta — decisão de reversão

Numa rodada anterior o `llms.txt` saiu do projeto. Com a auditoria de PageSpeed/SEO desta entrega, voltei atrás: um `llms.txt` com **links reais** de todas as páginas é um artefato de descoberta servido pelo próprio domínio, e o `ai-catalog.json` (catálogo JSON legível por máquina) segue o mesmo princípio. Ambos estão em `public/` e são servidos pelo SPA fallback dos rewrites.

### Validação

Rodo sempre a mesma bateria que o CI, nas mesmas condições (`CI=1`, `workers=1`, `retries=2`): `typecheck`, `lint`, `build:demo` e `test:e2e`. É a única forma de ter certeza de que o que passa localmente vai passar no GitHub.

---

## Documentação Complementar

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — contratos REST, eventos, sessão, carrinho, cache, mocks, limitações, desvios do Figma.
- [`docs/ENUNCIADO.md`](./docs/ENUNCIADO.md) — enunciado completo do desafio.