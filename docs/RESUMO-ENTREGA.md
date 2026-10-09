# Resumo da Entrega — KURIO NFT Marketplace

**Data:** 09/10/2026  
**Branch:** `homolog` (sincronizada com `main` em `045d336`)  
**Deploy Vercel (homolog):** https://frontend-challenge-git-homolog-ezequiel-reginos-projects.vercel.app  
**Deploy Vercel (produção):** https://frontend-challenge-indol-zeta.vercel.app

---

## ✅ O que foi entregue (conforme ENUNCIADO.md)

### Arquitetura & Stack
- React 18 + TypeScript + Vite
- TanStack Router (file-based routes) + TanStack Query
- Axios + MSW (REST + WebSocket via Socket.IO) — mocks ativos em produção (`build:demo`)
- Tailwind CSS + shadcn/ui + React Icons (`react-icons/ri`, `lucide-react`, `react-icons/ai`, `react-icons/fc`)
- Playwright (E2E desktop + mobile) + Lighthouse CI
- GitHub Actions CI (`typecheck`, `lint`, `test:e2e`) + branch protection

### Rotas implementadas (todas com fidelidade ao Figma)
| Rota | Status |
|------|--------|
| `/` (Home) | ✅ Hero, catálogo, busca, filtros, paginação, navegação p/ NFT |
| `/mercado` | ✅ Grid 3 colunas desktop, 2 colunas mobile, mesmos filtros |
| `/mercado/nft/:numero` | ✅ Galeria, detalhes, edição, quantidade, favoritos, compra |
| `/cart` | ✅ Edição quantidades, remoção, cupom, resumo valores |
| `/checkout` | ✅ Dados colecionador, carteira, rede, revisão, envio |
| `/orders/:orderId` | ✅ Resultado, transação, itens, taxas, total |
| `/login` | ✅ Autenticação, validação, redirect pós-login |
| `/register` | ✅ Criação conta, validação, conflito |
| `/account/profile` | ✅ Edição dados, avatar, senha |
| `/account/wallets` | ✅ Cadastro/edição carteira principal e secundária |

### Funcionalidades core
- **Favoritos**: atualização otimista + rollback (React Query)
- **Carrinho**: snapshots de preço/disponibilidade, cupom, merge visitor→auth
- **Checkout**: cotação em ETH (`big.js`), bloqueio se preço muda, idempotency key
- **Pedidos**: confirmação/recusa, detalhes, assinatura
- **Tempo real**: eventos `nft.updated` / `order.updated` via Socket.IO + reconciliação REST
- **Guards de rota**: `RequireAuth` com `?redirect=` preservado, aguarda MSW ready
- **Login**: dialog auto-abre em `/login`, credenciais `collector@example.com` / `password123`

### Qualidade & Performance
- `typecheck`: 0 erros | `lint`: 0 erros (8 warnings `react-refresh` pré-existentes)
- **E2E**: 20/20 passando (Chromium desktop + mobile, `CI=1 workers=1`)
- **Lighthouse** (mediana local 3 execs):
  - Mobile: Perf 91 (Home) / 90 (Detail) · A11y 100 · BP 100 · SEO 100
  - Desktop: Perf 99 / 95 · A11y 100 · BP 100 · SEO 100
- Fontes self-hosted (`public/fonts/`, subsets `latin`/`latin-ext`, CSS 83→74 kB)
- `width`/`height` + `loading="lazy"` nas imagens
- `robots.txt` + `sitemap.xml` (SEO 92→100)
- Slider de preço com alvos de toque ≥ 24 px (A11y 97→100)
- Skeletons com shimmer (`.skeleton` + `prefers-reduced-motion`)
- i18n: chaves `home.pagination.nav/next`, `orders.total` adicionadas (pt-BR/en/es) — 0 missing keys

### Limpeza
- Removidos 113 SVGs não usados (`public/icons/`) → migração para React Icons
- Removido `public/llms.txt` (evidência de IA) — re-adicionado pelo usuário em `main`
- `routeTree.gen.ts` ignorado no git (`.gitignore`)
- `design/` e `*.fig` gitignored (nunca vão para o repo)

---

## ⚠️ Pendências conhecidas (backlog pós-entrega)

| Item | Esforço estimado | Observação |
|------|------------------|------------|
| **§7 Aviso de preço alterado no carrinho** | 1–2 h | `Quote.changes` tipado + `quoteApi` existe; falta UI + i18n no `cart.tsx` |
| **35 chaves i18n mortas** | 30 min | Ex.: `home.categories.*`, `account.activity`, `nft.reviews` — auditar e remover |
| **6 warnings `react-refresh/only-export-components`** | 30 min | Constantes/funções compartilhadas em componentes UI — mover para arquivos separados |
| **§9 Baselines de regressão visual (`toHaveScreenshot`)** | 2–3 h | Config já aponta `snapshotDir`; gerar baselines de home/detalhe/carrinho/checkout |
| **Variantes 320/480 das artes** | 1 h | Lighthouse `uses-responsive-images` (~70 ms) — só há 640/1280 |
| **Matriz de dispositivos físicos** | 1–2 h | Validar: desktop 1440, tablet 768, mobile 390–430, mobile pequeno 320–375, dark mode |
| **Performance deploy Vercel (mobile Perf ~84)** | 2–4 h | Gargalo: chunk `router-*.js` (~276 KB) no critical path do hero — exige code-splitting agressivo ou SSR/prerender do hero para atingir ≥ 90 |

---

## 🔧 Configuração Vercel (solicitada)

| Branch | Environment | Configuração |
|--------|-------------|--------------|
| `main` | **Production** | Build: `npm run build:demo` · Output: `dist` · SPA rewrite habilitado |
| `homolog` | **Preview** | Mesmo build; URL única p/ validação de PRs |
| `develop` | (não usado) | — |

> **Nota:** `vercel.json` já configurado com `buildCommand: "npm run build:demo"` e rewrite SPA.

---

## 🚀 Próximos passos imediatos (amanhã)

1. **Smoke test no domínio de produção** (após merge `homolog → main`):
   - `/mercado/nft/001` direto (rewrite SPA)
   - Login → carrinho → cupom → checkout → confirmação
   - Tempo real: abrir mesma NFT em 2 abas, ver preço atualizar
   - `/robots.txt` responde `User-agent: *` (não index.html)

2. **Validação em dispositivos** (checklist mobile/docs):
   - Sem overflow horizontal 320–414 px
   - Alvos de toque ≥ 44×44 (principais) / 24 px (secundários)
   - Tab bar fixa inferior visível nas 5 abas; some com teclado
   - Tema dark consistente (app é dark-only via `class="dark"`)

3. **Se houver tempo**: aplicar avisos §7, limpar i18n, gerar baselines visuais.

---

## 📝 Convenções reforçadas

- **Branches**: `feat/<assunto>` → PR → `develop` → `homolog` → `main` (somente PR de `homolog`)
- **Commits**: Conventional (`feat:`, `fix:`, `docs:`, `design:`, `ops:`, `test:`)
- **PRs**: Sempre via template `.github/pull_request_template.md`
- **Nunca push direto em `main`** — branch protegida (requer PR + checks + 1 review; `enforce_admins: false` → `gh pr merge --admin`)
- **Sem evidências de IA** no app/repo (sem `llms.txt`, sem menções em README/comentários)

---

## 🔐 Segurança

- ⚠️ **PAT do GitHub exposta em sessão anterior** — usuário orientado a revogar/rotacionar antes da entrega final.
- Credenciais de teste estão no README (seção "Cenários de Mocks").