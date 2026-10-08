# Arquitetura

Documento de decisões de arquitetura do NFT Marketplace: contratos, sessão,
carrinho, cache, tempo real, mocks e limitações. O objetivo é explicar **como** e
**por quê**, além de registrar desvios do Figma e substituições de assets.

## 1. Visão geral e camadas

```text
UI (routes/ + features/ + components/)
        │  hooks do TanStack Query
Estado remoto (TanStack Query) ── política de cache em lib/query-client.ts
        │  endpoints tipados (src/api/endpoints)
Transporte (Axios) ── lib/http.ts (auth header + normalização de erro)
        │  REST
Rede  ── MSW (handlers REST)  +  Socket.IO (lib/socket.ts) ── MSW WebSocket
```

- **Contratos tipados** vivem em `src/api/types.ts` (DTOs REST e eventos). É a
  única fonte de verdade compartilhada entre transporte, mocks e UI.
- **Endpoints** (`src/api/endpoints/*`) encapsulam URL/params/headers; nunca
  contêm dados fictícios.
- **Erros** sempre chegam à UI como `ApiError` (`lib/api-error.ts`), nunca como
  `AxiosError`.
- **Valores em ETH** trafegam como strings decimais; toda aritmética passa por
  `lib/decimal.ts` (`big.js`). `Number` não é usado em cálculo de valores.

## 2. Contratos REST

Base: `VITE_API_URL` (padrão `/api`). Todos os payloads são JSON.

| Recurso | Método e rota | Observações |
| --- | --- | --- |
| Sessão | `POST /auth/register` | 201 · 409 `email_conflict` · 422 |
| Sessão | `POST /auth/login` | 200 · 401 `invalid_credentials` |
| Sessão | `GET /auth/session` | 200 · 401 |
| Sessão | `POST /auth/logout` | 204 |
| NFTs | `GET /nfts?q&categories&rarities&minPrice&maxPrice&sort&page&pageSize` | Lista paginada |
| NFTs | `GET /nfts/featured` | Destaques |
| NFTs | `GET /nfts/:id` | 404 `not_found` |
| Favoritos | `GET/POST/DELETE /favorites[/:nftId]` | Requer auth |
| Carrinho | `GET /cart` | Visitante ou autenticado |
| Carrinho | `POST /cart/items` · `PATCH/DELETE /cart/items/:id` | 409 `out_of_stock` |
| Carrinho | `POST/DELETE /cart/coupon` | 400 `invalid_coupon`/`coupon_expired` |
| Cotação | `GET /quote` · `POST /quote/revalidate` | Requer auth |
| Pedidos | `POST /orders` | Requer `Idempotency-Key` |
| Pedidos | `GET /orders` · `GET /orders/:id` | Isolados por usuário (403/404) |
| Perfil | `GET/PATCH /profile` · `POST /profile/password` | 422 · 409 |
| Carteiras | `GET /networks` · `GET/POST /wallets` · `PATCH /wallets/:id` | 422 · 409 |

Formato de erro:

```json
{ "code": "out_of_stock", "message": "…", "details": { "campo": ["…"] }, "requestId": "req-…" }
```

Códigos: `validation_error`, `invalid_credentials`, `email_conflict`,
`unauthenticated`, `session_expired`, `forbidden`, `not_found`, `conflict`,
`out_of_stock`, `edition_unavailable`, `invalid_coupon`, `coupon_expired`,
`price_changed`, `quote_expired`, `payment_declined`, `idempotency_conflict`,
`transient_error`, `network_error`.

### Idempotência de pedidos

`POST /orders` exige o cabeçalho `Idempotency-Key`. O mock guarda
`fingerprint = JSON.stringify(payload)` por `usuário + chave`:

- mesma chave + mesmo conteúdo → devolve o **mesmo pedido** (recuperação após
  timeout);
- mesma chave + conteúdo diferente → `409 idempotency_conflict`.

## 3. Tempo real (Socket.IO)

Cliente único em `lib/socket.ts`, com `transports: ['websocket']` (obrigatório
para o mock do MSW) e `autoConnect: false`.

| Evento (servidor→cliente) | Payload | Efeito no cache |
| --- | --- | --- |
| `nft.updated` | `{ eventId, resource, resourceId, version, priceEth, totalAvailable, editions }` | Atualiza o detalhe e invalida listas/carrinho |
| `order.updated` | `{ …, status, txHash, failureReason }` | Atualiza o pedido e invalida pedidos/carrinho |

- **Identidade estável + versão**: `RealtimeProvider` mantém um mapa
  `resourceId → últimaVersion` e descarta eventos duplicados ou antigos
  (versão ≤ última), evitando regressão de estado e reaplicação de efeitos.
- **Ciclo de vida**: o socket conecta apenas para usuários autenticados e é
  desconectado (listeners removidos) em logout/troca de usuário — eventos de uma
  sessão anterior não tocam dados de outra.
- **Reconciliação**: em `connect` (primeira conexão ou reconexão) o cache é
  invalidado, refazendo as consultas REST ativas. Pedidos confirmados/recusados
  são terminais e não regridem.

## 4. Política de sessão

- Token opaco guardado em `localStorage` (`lib/session-token.ts`); **senha nunca
  é persistida em claro**. Nos mocks, as senhas são guardadas com hash
  determinístico (não criptográfico, apenas para não expor texto puro).
- `AuthProvider` recupera a sessão via `GET /auth/session` no boot (se há token).
- Expiração: o interceptor do Axios dispara `auth:expired` em 401 e o provider
  limpa token + cache. O `beforeLoad` das rotas privadas preserva o destino em
  `?redirect=` para retomada após login.
- **Troca de usuário/logout**: `queryClient.clear()` remove todos os dados
  privados do usuário anterior antes de aplicar a nova sessão.

## 5. Estado do carrinho

- O carrinho do **visitante** é servido pelo mock sob a chave `guest`.
- No **login/cadastro** o mock faz merge do carrinho visitante no carrinho do
  usuário (somando quantidades, respeitando o limite por edição).
- Cada item guarda um **snapshot** de preço/disponibilidade no momento da
  inclusão. A cotação (`/quote`) compara com o estado atual do catálogo e emite
  `changes` (`price_changed`, `out_of_stock`, `edition_unavailable`,
  `coupon_*`). O checkout bloqueia a confirmação quando há mudanças.
- Persistência do visitante: o mock persiste o estado em `localStorage`, então o
  carrinho sobrevive a refresh.

## 6. Estratégia de cache

Definida em `lib/query-client.ts` e `api/query-keys.ts`:

- **Chaves isoladas** por recurso/parâmetros; o detalhe por `id`, as listas por
  conjunto de filtros. Dados privados são limpos em troca de sessão.
- `staleTime: 30s`, `gcTime: 5min`, `refetchOnWindowFocus: false`.
- **Retry**: até 3 tentativas apenas para falhas transitórias (rede e 5xx/408/429);
  erros 4xx não são repetidos. Backoff exponencial (até 8s).
- **Invalidação** após mutations (carrinho, favoritos, perfil, carteiras) e após
  eventos de tempo real.
- **Atualização otimista**: prevista para favoritos e quantidade do carrinho
  (rollback em erro) — será finalizada junto com as telas.
- **Cancelamento**: consultas recebem `signal` do TanStack Query (via Axios),
  descartando respostas obsoletas/fora de ordem.

## 7. Mocking

- **MSW na camada de rede**, com handlers REST e WebSocket compartilhados entre
  dev, demonstração e testes. Componentes/hooks/Axios não contêm respostas
  fictícias.
- **Estado consistente** em `src/mocks/db.ts` (catálogo, favoritos, carrinho,
  perfil, carteiras, pedidos) com persistência em `localStorage` e reset que
  restaura o cenário semente.
- **Tempo real**: WebSocket interceptado pelo MSW com o protocolo Socket.IO
  aplicado por `@mswjs/socket.io-binding`. O binding suporta apenas o namespace
  default e eventos textuais (sem acks/anexos binários) — suficiente para os
  eventos do desafio.
- **Limite descoberto**: o MSW (2.15) **normaliza URLs de Socket.IO** removendo o
  prefixo `/socket.io/` antes de casar o padrão do handler `ws.link`; por isso o
  matcher em `src/mocks/socket.ts` é amplo (`/.*/ `). Ver comentário no arquivo.
- Ferramentas: `window.__mocks` (devtools) e endpoints `/__mocks__/*` para
  selecionar cenários, resetar e disparar eventos.

## 8. Precisão monetária

`lib/decimal.ts` usa `big.js` (18 casas). `addEth`, `subEth`, `mulEth`,
`compareEth` e `formatEth` evitam erros de ponto flutuante. Quantidades são
inteiras. A cotação da API é a referência para finalizar o pedido.

## 9. Acessibilidade e UX (parcial, a completar com o layout)

- Estrutura semântica (header/nav/main/footer, `fieldset`/`legend` para edições),
  `aria-label` em ícones/navegação, `aria-invalid` e mensagens associadas nos
  formulários, `role="alert"`/`role="status"` para feedback.
- Skeleton com `animate-pulse` e `motion-reduce:animate-none` (respeita
  `prefers-reduced-motion`); "Pular para o conteúdo".
- Foco visível via `focus-visible:ring`. Sem overflow horizontal nas larguras
  avaliadas (390/768/1440).

## 10. Desvios do Figma e assets

- **Assets de imagem**: como o Figma ainda não foi especificado, os mocks geram
  **placeholders SVG determinísticos** (data URI) em `src/mocks/fixtures/images.ts`,
  garantindo execução 100% offline. Serão substituídos pelos assets reais. Isso
  deve ser removido/substituído na etapa de fidelidade visual.
- **Fonte/tipografia**: usar a fonte do Figma quando definida (a base usa a pilha
  padrão do Tailwind). Registrar a substituição aqui.
- **Telas não desenhadas** (perfil, carteiras, confirmação em mobile, estados de
  erro/vazio) seguirão o mesmo padrão visual dos frames existentes.

## 11. Performance

- Vite com code-splitting automático do TanStack Router (chunks por rota).
- O chunk do MSW (~320 KB) é carregado **lazy** apenas quando os mocks estão
  ligados; no build de demonstração ele é necessário, no build de produção não é
  executado (import dinâmico condicional).
- Baseline de Lighthouse deve ser registrado após as telas finais, via
  `npm run lighthouse` (3 medições/página, mobile + desktop; relatórios em
  `lighthouse-reports/`). Metas: Perf ≥ 90, A11y ≥ 95, Best Practices ≥ 95,
  SEO ≥ 90. Registrar LCP/CLS/TBT e justificar eventuais desvios.

## 12. Pendências planejadas

1. Implementar as telas finais conforme o Figma (Início, Detalhe, Carrinho,
   Pagamento, Confirmação, Login, Cadastro, Perfil, Carteiras) com Tailwind +
   shadcn adaptados à identidade visual.
2. Hooks de features (catálogo, favoritos com otimista, carrinho, cotação,
   checkout com revalidação e idempotência, perfil, carteiras).
3. Cobrir os 12 cenários de teste do enunciado e baselines de regressão visual.
4. Rodar e versionar o relatório Lighthouse.
