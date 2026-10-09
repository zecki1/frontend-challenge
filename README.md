# NFT Marketplace — Frontend Challenge

![E2E Tests](https://img.shields.io/badge/E2E-20%2F20%20passing-brightgreen)
![Lighthouse Mobile](https://img.shields.io/badge/Lighthouse_Mobile-P91%2FP90-success)
![Lighthouse Desktop](https://img.shields.io/badge/Lighthouse_Desktop-P99%2FP95-success)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)
![Lint](https://img.shields.io/badge/ESLint-0%20errors-green)

---

## 📸 Screenshots do Produto (Visual Regression Baselines)

### Home
| Desktop | Mobile |
|---------|--------|
| ![Home Desktop](./docs/screenshots/home-visual-desktop-win32.png) | ![Home Mobile](./docs/screenshots/home-visual-mobile-win32.png) |

### Detalhe do NFT
| Desktop | Mobile |
|---------|--------|
| ![NFT Detail Desktop](./docs/screenshots/nft-detail-visual-desktop-win32.png) | ![NFT Detail Mobile](./docs/screenshots/nft-detail-visual-mobile-win32.png) |

### Carrinho
| Desktop | Mobile |
|---------|--------|
| ![Cart Desktop](./docs/screenshots/cart-visual-desktop-win32.png) | ![Cart Mobile](./docs/screenshots/cart-visual-mobile-win32.png) |

### Checkout
| Desktop | Mobile |
|---------|--------|
| ![Checkout Desktop](./docs/screenshots/checkout-visual-desktop-win32.png) | ![Checkout Mobile](./docs/screenshots/checkout-visual-mobile-win32.png) |

> **Baselines completas:** 8/8 screenshots (desktop + mobile) versionadas em `e2e/__screenshots__/visual.spec.ts-snapshots/`. Rodar/atualizar: `npm run test:e2e:visual -- --update-snapshots`.

---

## 📚 Documentação

| Arquivo | Descrição |
|---------|-----------|
| [`docs/ENUNCIADO.md`](./docs/ENUNCIADO.md) | Enunciado completo do desafio |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Arquitetura: contratos, cache, tempo real, mocks, limitações |
| [`docs/DECISOES.md`](./docs/DECISOES.md) | Registro de decisões, performance, acessibilidade, cronograma detalhado |

---

## 🚀 Setup Rápido

```bash
npm install          # instala dependências e o worker do MSW
npm run dev          # http://localhost:5173 (mocks ligados por padrão)
```

### Build de Demonstração (para deploy)

```bash
npm run build:demo && npm run preview
```

> **Importante:** O build de demonstração mantém MSW + Socket.IO ativos. Em produção (`npm run build`) eles ficam desligados.

---

## 🔐 Credenciais Fictícias

| Usuário | E-mail | Senha |
|---------|--------|-------|
| Colecionadora | `collector@example.com` | `password123` |
| Investidor | `leo@example.com` | `senha123` |

---

## ⚡ Comandos Principais

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento (mocks ligados) |
| `npm run build` | Build de produção (mocks desligados) |
| `npm run build:demo` | Build de demonstração (mocks ligados) |
| `npm run typecheck` | Gera rotas + `tsc -b` |
| `npm run lint` | ESLint |
| `npm run test:e2e` | Playwright (desktop + mobile) |
| `npm run test:e2e:visual` | Regressão visual com baselines |
| `npm run lighthouse` | Auditoria Lighthouse mobile + desktop |

---

## 📱 Telas Implementadas

| Tela | Rota | Status |
|------|------|--------|
| Início | `/` | ✅ Catálogo, busca, filtros, paginação, navegação NFT |
| Mercado | `/mercado` | ✅ Grid 3 colunas (desktop) / 2 (mobile) |
| Detalhe NFT | `/mercado/nft/:numero` | ✅ Galeria, info, edição, quantidade, favoritos, compra |
| Carrinho | `/cart` | ✅ Quantidades, remoção, cupom, resumo |
| Checkout | `/checkout` | ✅ Dados, carteira, rede, revisão, envio |
| Confirmação | `/orders/:orderId` | ✅ Resultado, transação, itens, taxas, total |
| Login | `/login` | ✅ Autenticação, validação, redirect |
| Cadastro | `/register` | ✅ Criação, validação, conflito |
| Perfil | `/account/profile` | ✅ Dados, avatar, senha |
| Carteiras | `/account/wallets` | ✅ Cadastro/edição principal + secundária |

---

## ✅ Qualidade & Performance

| Métrica | Mobile | Desktop |
|---------|--------|---------|
| **Lighthouse Performance** | **91** (Home) / **90** (Detail) | **99** / **95** |
| **Accessibility** | 100 | 100 |
| **Best Practices** | 100 | 100 |
| **SEO** | 100 | 100 |
| **E2E Tests** | 20/20 passing | 20/20 passing |
| **Visual Regression** | 8/8 baselines | 8/8 baselines |

- `typecheck`: 0 erros
- `lint`: 0 erros (8 warnings `react-refresh` pré-existentes)

---

## 🕐 Cronograma (07/10 15:18 → 09/10)

| Fase | Período | Tempo | Principais Entregas |
|------|---------|-------|---------------------|
| **Setup & Arquitetura** | 07/10 15:18–19:00 | ~3.5h | TanStack Router/Query, Axios, MSW, Socket.IO, contratos tipados |
| **Mocks & Cenários** | 07/10 19:00–22:00 | ~3h | DB, fixtures, handlers REST/WS, cenários (`fast`, `slow-network`, etc.) |
| **Autenticação & Guards** | 08/10 09:00–13:00 | ~4h | Login/register, JWT mock, `RequireAuth` com `?redirect=`, `mswReady` race fix |
| **Catálogo & Filtros** | 08/10 13:00–17:00 | ~4h | Grid, busca, categorias, faixa de preço (slider dual), ordenação, paginação |
| **Detalhe NFT** | 08/10 17:00–21:00 | ~4h | Galeria zoom, edições, quantidade, favoritos (optimistic), compra → carrinho |
| **Carrinho & Cupom** | 09/10 09:00–12:00 | ~3h | Edição qtd, remoção, cupom, snapshots preço/disponibilidade, aviso `Quote.changes` |
| **Checkout & Pedidos** | 09/10 12:00–15:00 | ~3h | Carteiras, rede, cotação ETH (`big.js`), idempotência, confirmação/recusa |
| **Tempo Real (Socket.IO)** | 09/10 15:00–16:30 | ~1.5h | `nft.updated`/`order.updated`, reconciliação REST, deduplicação, `kurio:auth-logout` |
| **Mobile & Acessibilidade** | 09/10 16:30–18:30 | ~2h | Tab bar fixa (95px), QR alinhado, slider ≥24px, skeletons shimmer, OpenDyslexic, VLibras |
| **Performance & SEO** | 09/10 18:30–19:30 | ~1h | Fontes self-hosted (subset latin), `width/height`+`lazy`, `robots.txt`/`sitemap.xml` |
| **E2E & Visual Regression** | 09/10 19:30–20:30 | ~1h | 20/20 testes (desktop+mobile), 8 baselines visuais, CI pipeline |
| **Documentação & Deploy** | 09/10 20:30–21:30 | ~1h | README, ARCHITECTURE, DECISOES, screenshots mobile, Vercel PRs |

| **Total** | **07/10 15:18 → 09/10 14:34** | **~31h** | **Entrega completa** |

> **Nota:** Prazo original de 2 dias úteis (07/10–09/10). Trabalho executado em ~31h distribuídas ao longo de 2 dias, com margem para imprevistos (fixes de CI, ajustes de mobile tab bar, crash `includes`).

---

## 🏗️ Stack Obrigatória

| Responsabilidade | Tecnologia |
|------------------|------------|
| Interface | React 19 |
| Linguagem | TypeScript |
| Roteamento | TanStack Router (file-based + Zod) |
| Estado remoto | TanStack Query v5 |
| Cliente HTTP | Axios |
| Integração de dados | REST APIs |
| Tempo real | Socket.IO + MSW (`@mswjs/socket.io-binding`) |
| Estilização | Tailwind CSS v3 |
| Componentes | shadcn/ui (Radix) |
| Formulários | react-hook-form + Zod |
| Mocking | MSW (REST + WebSocket) |
| Testes E2E / Visual | Playwright |
| Performance | Lighthouse CI |

---

## 🌿 Branches & Workflow Git

```text
main      → produção (nunca push direto)
homolog   → validação/release de PRs (staging)
develop   → integração diária (merges das feat/*)
feature   → feat/<assunto> + PR para develop
```

- **Commits:** `feat:`, `fix:`, `test:`, `docs:`, `design:`, `ops:`, `backend:` (Conventional Commits)
- **PRs:** via template; merge via PR de `homolog` → `main` (branch protegida)
- **Checks obrigatórios:** `typecheck`, `lint`, `test:e2e`

---

## 🔗 Links Úteis

- **Produção (Vercel):** https://frontend-challenge-indol-zeta.vercel.app
- **Preview (homolog):** https://frontend-challenge-git-homolog-ezequiel-reginos-projects.vercel.app
- **E2E Artifacts (GitHub Actions):** [Run #37962466359](https://github.com/zecki1/frontend-challenge/actions/runs/37962466359) — screenshots/vídeos em **Artifacts** → `test-results/`
- **Figma:** [Layout Oficial](https://www.figma.com/design/Ff0SksUi7UFtPWUO8kyNtw/Frontend-Challenge?node-id=0-1)

---

## ⚠️ Próximos Passos (pós-entrega)

- §7 Aviso de preço alterado no carrinho (UI + i18n)
- 35 chaves i18n não usadas
- 8 warnings `react-refresh/only-export-components`
- §9 Baselines `toHaveScreenshot` (config já existe)
- Variantes 320/480 das artes (Lighthouse `uses-responsive-images`)
- Performance mobile ≥ 90 (gargalo: chunk `router-*.js` ~276 KB)

---

## 📄 Licença

Projeto de desafio técnico — uso educacional/avaliação.