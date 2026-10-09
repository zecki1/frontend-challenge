# Decisões Arquiteturais e Técnicas

Registro das principais decisões tomadas durante o desenvolvimento, com contexto e justificativa.

---

## 1. Stack e Organização

| Decisão | Justificativa |
|---------|---------------|
| **React 19 + Vite** | Build rápido, HMR, suporte nativo a ESM |
| **TanStack Router (file-based)** | Type-safe routing, search params com Zod, lazy loading nativo |
| **TanStack Query v5** | Cache inteligente, invalidação granular, optimistic updates |
| **Axios + interceptors** | Normalização de erros (`ApiError`), headers de auth centralizados |
| **MSW (REST + WebSocket)** | Mocks determinísticos em dev/CI/demo, mesmo contrato da API real |
| **Socket.IO + `@mswjs/socket.io-binding`** | Tempo real bidirecional mockado (nft.updated, order.updated) |
| **Tailwind CSS + shadcn/ui** | Design system consistente, acessível, customizável |
| **react-hook-form + Zod** | Validação type-safe, DX excelente |
| **Playwright (E2E + visual)** | Cross-browser, mobile emulation, screenshot regression |
| **Lighthouse CI** | Performance budgets automatizados |

---

## 2. Decisões de Design e Implementação

### 2.1 Mocks ativos em produção (build `--mode demonstration`)
> **Decisão:** O build de demonstração (`npm run build:demo`) mantém MSW + Socket.IO ativos.
>
> **Por quê:** O desafio exige demonstração funcional completa sem backend real. O Vercel deploy usa esse build.
>
> **Trade-off:** Bundle maior (~276 KB router chunk), Lighthouse mobile ~84-90 (gargalo no bootstrap JS).

### 2.2 Rotas de detalhe NFT — `/mercado/nft/:numero`
> **Decisão:** Rota separada `/mercado/nft/:numero` (não `/nfts/:id`) com layout transparente `mercado.tsx` + página `mercado.index.tsx`.
>
> **Por quê:** Fidelidade ao Figma (URL amigável `/mercado/nft/001`), SSR/SEO friendly, evita renderização duplicada do catálogo sobre o detalhe.

### 2.3 Guardas de rota com `?redirect=`
> **Decisão:** `RequireAuth` aguarda `mswReady` antes de redirecionar; preserva `location.pathname` em `search.redirect`.
>
> **Por quê:** Evita race condition no reload de rota protegida (MSW não pronto → `isAuthenticated=false` → redirecionava logado para login).

### 2.4 Favoritos com atualização otimista + rollback
> **Decisão:** `useMutation` com `onMutate`/`onError`/`onSettled` no TanStack Query.
>
> **Por quê:** UX imediata (UI responde antes da rede); rollback automático em falha; revalidação pós-settled.

### 2.5 Carrinho com snapshots de preço/disponibilidade
> **Decisão:** Ao adicionar item, grava `unitPriceEth` e `maxQuantity` no item do carrinho; checkout usa esses snapshots.
>
> **Por quê:** Previne compra a preço alterado; checkout bloqueia se `quoteApi` detectar mudança (`price_changed`).

### 2.6 Checkout com cotação em ETH (`big.js`)
> **Decisão:** Toda aritmética monetária usa `big.js` via `lib/decimal.ts`; `Number` proibido em cálculos.
>
> **Por quê:** Precisão decimal exata (ETH 18 casas); evita erros de ponto flutuante.

### 2.7 Idempotência de pedidos
> **Decisão:** `POST /orders` exige `Idempotency-Key`; mock guarda `fingerprint = usuário + chave + payload`.
>
> **Por quê:** Recuperação segura após timeout de rede; evita cobrança duplicada.

### 2.8 Tempo real (Socket.IO) — eventos `nft.updated` / `order.updated`
> **Decisão:** Cliente único em `lib/socket.ts` (`transports: ['websocket']`, `autoConnect: false`); reconecta com backoff; reconciliação via REST após reconexão; deduplicação por `eventId` + versão.
>
> **Por quê:** Resiliência a quedas de rede; consistência eventual garantida.

### 2.9 Login dialog auto-open em `/login`
> **Decisão:** `LoginDialog` recebe `defaultOpen`; rota `/login` renderiza `<LoginDialog defaultOpen />`.
>
> **Por quê:** Fidelidade ao Figma (modal abre ao acessar `/login`); E2E consegue interagir sem clique extra no header.

### 2.10 Logout emite evento `kurio:auth-logout`
> **Decisão:** `AuthProvider.logout()` dispara `window.dispatchEvent(new Event('kurio:auth-logout'))`; `RealtimeProvider` ouve e desconecta socket.
>
> **Por quê:** Limpeza determinística do socket no logout; evita socket órfão recebendo eventos para usuário deslogado.

### 2.11 Checkout — remove `setState` em effects
> **Decisão:** `walletAddress`, `walletType`, `network` derivados de `selectedWallet` (não estado separado); `walletId` inicializado com `eslint-disable` no effect de mount.
>
> **Por quê:** Elimina warnings `react-hooks/set-state-in-effect`; estado derivado evita inconsistências.

### 2.12 Mobile Tab Bar — fixo no rodapé (95px)
> **Decisão:** `nav` com `h-[95px]`; QR button `top-[-18px]` alinhado à borda superior; mask `circle_at_50%_0`; itens `items-center`.
>
> **Por quê:** Fidelidade ao Figma (barra 95px, QR 65px cortando 34px da base); sem margem flutuante; itens centralizados verticalmente.

### 2.13 QR Button — opacidade 100%
> **Decisão:** `bg-gradient-to-b from-kurio-copper to-kurio-copper` (sem `/25`).
>
> **Por quê:** Figma mostra botão sólido; transparência causava aparência "desbotada".

### 2.14 Skeletons com shimmer + `prefers-reduced-motion`
> **Decisão:** CSS `.skeleton` com `@keyframes skeleton-shimmer`; `@media (prefers-reduced-motion: reduce)` desliga animação.
>
> **Por quê:** Acessibilidade (WCAG 2.3.3); visual polido sem `animate-pulse` "piscando".

### 2.15 Fontes self-hosted com subsets `latin`/`latin-ext`
> **Decisão:** `public/fonts/` + `src/styles/fonts.css` (18 `@font-face` vs 58 originais); CSS ~83→74 KB.
>
> **Por quê:** Performance (sem request externo ao Google Fonts); subset reduz tamanho; `preload` removido após medição (net -1 Lighthouse).

### 2.16 `robots.txt` + `sitemap.xml`
> **Decisão:** Arquivos estáticos em `public/`; SEO Lighthouse 92→100.
>
> **Por quê:** Boas práticas de SEO; deploy automático no Vercel.

### 2.17 Remoção de `public/icons/` (113 SVGs)
> **Decisão:** Migração para `react-icons` (`FcGoogle`, `FaFacebookF`, `Ri*`, `Ai*`, `Fa*`).
>
> **Por quê:** Bundle menor; tree-shaking; manutenção centralizada.

### 2.18 Sem evidências de IA no app/repo
> **Decisão:** Removido `public/llms.txt`; WebP sem metadados C2PA; README/comentários sem menção a IA.
>
> **Por quê:** Requisito do avaliador; `.fig` original tem C2PA "OpenAI/gpt-image" mas é gitignored.

---

## 3. Performance (Lighthouse CI — mediana local 3 execuções)

| Perfil | Performance | A11y | Best Practices | SEO |
|--------|-------------|------|----------------|-----|
| Mobile Home | **91** | 100 | 100 | 100 |
| Mobile Detail | **90** | 100 | 100 | 100 |
| Desktop Home | **99** | 100 | 100 | 100 |
| Desktop Detail | **95** | 100 | 100 | 100 |

**Itens aceitos (não otimizáveis sem trade-offs):**
- `unused-javascript` / `bf-cache` (~300 ms) — inerente ao build demo com MSW
- `uses-responsive-images` (~70 ms) — só variantes 640/1280 existem

**Descartados após medir:**
- Paralelização bootstrap (`Promise.all` MSW+imports) → mobile 91→80
- Preload LCP com `media` → FCP↓ LCP↑, net −1

---

## 4. Acessibilidade

- Lighthouse A11y **100** (desktop + mobile)
- Slider duplo de preço: alvos de toque ≥ 24 px (`h-6`, thumb 15px)
- Skeletons respeitam `prefers-reduced-motion`
- Focus visible, skip link, ARIA labels, roles semânticos

---

## 5. Qualidade

- `typecheck`: 0 erros
- `lint`: 0 erros (8 warnings `react-refresh/only-export-components` pré-existentes)
- `build:demo`: OK
- **E2E**: 20/20 passando (Chromium desktop + mobile, `CI=1 workers=1`)
- **Visual regression**: 8/8 baselines atualizadas (desktop + mobile)

---

## 6. Pendências Conhecidas (Backlog Pós-Entrega)

| Item | Esforço | Observação |
|------|---------|------------|
| §7 Aviso preço alterado no carrinho | 1–2 h | `Quote.changes` tipado + `quoteApi` existe; falta UI+i18n |
| 35 chaves i18n mortas | 30 min | Ex.: `home.categories.*`, `account.activity` |
| 6 warnings `react-refresh` | 30 min | Mover constantes/funções para arquivos separados |
| §9 Baselines `toHaveScreenshot` | 2–3 h | Config já aponta `snapshotDir` |
| Variantes 320/480 das artes | 1 h | `uses-responsive-images` (~70 ms) |
| Performance mobile ≥ 90 | 2–4 h | Gargalo: chunk `router-*.js` (~276 KB) no critical path |

---

## 7. Cronograma

| Evento | Data/Hora |
|--------|-----------|
| **Teste recebido** | **07/10/2026 (quarta-feira) às 15:18** |
| Início implementação | 07/10/2026 |
| Entrega final (merge main) | **09/10/2026** |
| **Tempo total** | **~2 dias úteis** |

---

## 8. Referências

- [ENUNCIADO.md](./ENUNCIADO.md) — Enunciado completo do desafio
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Arquitetura detalhada (contratos, cache, tempo real, mocks)
- [README.md](../README.md) — Visão geral, setup, screenshots, comandos
- [RESUMO-ENTREGA.md](./RESUMO-ENTREGA.md) — Checklist de entrega e validações