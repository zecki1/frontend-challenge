# Checklist de Erros — Kurio Marketplace

Checklist consolidado dos erros/reclamações reportados (mobile + PageSpeed) e
seu estado de correção. Legenda: ✅ corrigido · 🔍 causa identificada · ⏳ pendente.

## 1. Menu mobile — bolinha da Tab Bar "cortando" o retângulo 🔥

| Estado | Item |
|--------|------|
| ✅ | Bolinha QR central alinhada ao **topo do frame** (`top-0`, antes `top-[-31px]`), 65 px, começando em y=0 como no Figma — corte de 34 px sobre a base de 95 px. |
| ✅ | Barra base com **recorte vazado** (recorte em `mask-image` radial no topo-central) onde o círculo atravessa — o círculo **não encosta** no retângulo, efeito do CodePen/Figma. Validado por análise de pixels (furo transparente sob a bolinha; barra sólida ao redor). |
| ✅ | Geom em 320/360/390/414: sem overflow, bolinha centralizada, sobreposição 31 px, mask aplicada. |
| ⏳ | Press state / feedback de toque na bolinha (item de checklist mobile). |

**Arquivos:** `src/components/layout/mobile-tab-bar.tsx`.

## 2. Catálogo mobile: "Ocorreu um erro inesperado. Tentar novamente" 🔥

| Estado | Item |
|--------|------|
| 🔍 | **Causa raiz:** o deployment testado está atrás do **Vercel Auth (SSO)**. O MSW não opera no host protegido: as chamadas `/api/*` não mockadas caem no `rewrite` da Vercel (`/(.*)` → `index.html`) e o axios recebe **HTML 200 sem `message`** → fallback "Ocorreu um erro inesperado". Local (dev/demo preview) o catálogo funciona: `/api/nfts` retorna 200. |
| ✅ | **Mitigação:** `src/lib/api-error.ts` agora trata resposta não-JSON (HTML/string) e entrega mensagem contextual por status (404/403/5xx) em vez do genérico. |
| 🔍 | Página de login do SSO também explica: PageSpeed medindo a página de login e validadores agênticos recebendo HTML de login no lugar dos arquivos. |
| ⏳ | **Ação necessária (infra):** publicar o app em URL **sem** Vercel Auth (ex.: preview com proteção desligada, ou domínio próprio), e revalidar. Com SSO ativo, PageSpeed e mocks nunca ficarão corretos. |

## 3. PageSpeed mobile ≥ 90 (reportado ~64; local 60)

| Estado | Item |
|--------|------|
| ✅ | **CLS 0.403 → 0** (Lighthouse local). Causas corrigidas: (a) a grade do catálogo só aparecia após o gate do MSW (`enabled: mswReady`) → pulo de ~1800 px no load; agora o esqueleto renderiza desde o primeiro paint (`isLoading || (!data && !isError)`); (b) card esqueleto com altura casada exatamente com o card real (257 px) + espaço da paginação reservado (75 px) — troca esqueleto→dados sem mover nada. |
| ✅ | LCP parcial: 1º card de promo com `loading="eager"` + `fetchPriority="high"`; `<link rel="preload" as="image">` do artefato LCP no `index.html`; primeiros 4 cards do catálogo `eager` (antes `lazy`). |
| ⏳ | **LCP ainda ~5.0 s** (boot de JS): entry ~301 kB + router ~269 kB + chunk de mocks MSW ~329 kB no caminho crítico (a catálogo só carrega dados depois do MSW). Direções: code-split de providers/react-rewards (html2canvas 196 kB é lazy), reduzir peso do chunk MSW ou abrir mão do gate em produção, pré-carregar o chunk de mocks. |
| ✅ | Score local do preview demo: **56 → 77** (com CLS zerado). O 64/38 medidos no domínio SSO são a página de login — recriar em URL acessível. |

## 4. Navegação agêntica (llms.txt / ai-catalog.json)

| Estado | Item |
|--------|------|
| ✅ | `public/llms.txt` local **tem** H1 (`# KURIO — NFT Marketplace`) e links. |
| ✅ | `public/ai-catalog.json` local é **JSON válido**. |
| 🔍 | Os validadores reportaram "sem H1/links" e "malformado" porque receberam o **HTML de login do SSO**, não os arquivos. |
| ⏳ | Depois do deploy em URL acessível: apontar os links (`kurio.app` → domínio real) e revalidar com a navegação agêntica. |

## 5. Itens de infraestrutura/ambiente

- ⏳ Deploy atual (production) protegido por Vercel Auth — bloqueia PageSpeed real, mocks e agêntica.
- ⏳ Alias `frontend-challenge.vercel.app` aponta para projeto placeholder errado ("Front End") — verificar o alias/custom domain no projeto correto.
- ⏳ Commitar as mudanças deste ciclo (ver `git status`) e rodar o build de produção.

## Como validar localmente

```bash
npm run build:demo && npx vite preview --port 4173
# navegar em 390×844; conferir tab bar (bolinha + vazado), catálogo, sem overflow
npx lighthouse http://localhost:4173/ --only-categories=performance --chrome-flags="--headless --no-sandbox"
```

> Nota: `data-aos` NÃO é causa de CLS (anima `transform`, que a especificação exclui de layout shift) — investigado e descartado.