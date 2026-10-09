# Checklist Mobile — Kurio Marketplace

Checklist de validação da experiência mobile contra os frames do Figma
(`design/screens/mobile-*.json`, base 414×896). Marque os itens conforme a
validação avança.

**Como validar:** DevTools em modo responsivo nas larguras 320 / 360 / 390 /
414 / 768 (tablet), sempre alternando **dark mode** e **tema claro**. Conferir
também com zoom de 200% e leitor de tela (títulos, labels, `aria-label`).

---

## 1. Estrutura global

- [ ] Sem overflow horizontal em 320–414 px (scroll vertical apenas).
- [ ] Alvos de toque ≥ 44×44 px em botões principais; ≥ 24 px nos secundários.
- [ ] Tab Bar fixa inferior visível em Início, Catálogo, Favoritos, Carrinho e Perfil.
- [ ] Tab Bar some quando o teclado abre (inputs de checkout) — sem sobrepor o campo ativo.
- [ ] Tab Bar (Figma: 414×126; base 95 px; QR 65 px alinhado ao topo do frame, cortando 34 px da base):
  - [x] Base `bg-kurio-surface` com `border-t`; 4 ícones (Início, Favoritos, Carrinho, Perfil) — em `react-icons/ri`.
  - [x] Botão QR central 65 px começando no topo do frame (y=0), gradiente cobre; barra com **recorte vazado** (mask) onde o círculo atravessa — "não se encostam", como no Figma.
  - [x] Ícone ativo em `text-kurio-copper`; inativos em `text-kurio-sand`.
  - [ ] Press state / feedback visual no toque.
- [ ] Tema claro/escuro consistente com a paleta em todas as telas.
- [ ] i18n: pt / en / es sem quebra de layout em textos longos.

## 2. Início (`/`)

Figma `mobile-incio.json`: Search Bar (y=40), Hero Banner (y=101), Tabs (y=307),
Product Grid (y=343), Tab Bar (y=770).

- [ ] Search Bar fixa no topo com filtro; toque abre busca.
- [ ] Hero Banner em largura total com carrossel (bolinhas de paginação).
- [ ] Tabs "Novos lançamentos / Em alta / Todos os NFTs" rolam horizontalmente e trocam a grade.
- [ ] Product Grid em 2 colunas; cards com preço e coração de favoritar.
- [ ] Paginação "Carregar mais" / scroll infinito funcionando.
- [ ] Tab Bar não cobre o último card da grade (padding inferior).

## 3. Detalhe do NFT (`/mercado/nft/:id`)

Figma `mobile-detalhesdonft.json`: Hero (y=0–506), Details Sheet (y=392),
Buy Bar (y=732–896). Arquivo: `src/components/nft/nft-detail-page.tsx`.

**Hero**
- [ ] Arte 361×356 com `rounded-3xl`; carrossel com swipe + bolinhas.
- [ ] Botões Voltar e Favoritar (35 px) sobrepostos à arte, no topo.
- [ ] Gradiente vegeta do hero → superfície, sem emenda visível.

**Details Sheet** (seção sobreposta, topo arredondado)
- [ ] Sheet sobrepõe o hero em 114 px (`-mt-[114px]`).
- [x] **Borda superior + `rounded-t-lg`** no topo do sheet (`border-t border-[#3f2319] rounded-t-lg`).
- [x] Título + avaliação (estrela + nota + nº de reviews) na mesma linha.
- [ ] Descrição, chips de edição (1/50, 1/9, ABERTA) e info do token (ID, coleção, atributos).
- [ ] Sem texto cortado com fonte dinâmica (OpenDyslexic) e zoom 200%.

**Buy Bar** (seção própria, largura total da tela)
- [x] Seção irmã do Details Sheet, em largura total (`bg-kurio-surface px-6 pt-[38px] pb-[34px]`).
- [ ] Qtd. (stepper −/+ 30 px) + preço em ETH na mesma linha.
- [ ] Botão "Comprar NFT" 60 px gradiente cobre + botão ghost do carrinho 60 px.
- [ ] Estados: esgotado (desabilitado), adicionando…, mensagem de sucesso/erro.
- [ ] Comprar adiciona ao carrinho e mostra feedback sem navegar.

## 4. Carrinho (`/cart`)

Figma `mobile-carrinhodenfts.json`: Content (y=32), Payment Summary (y=554).

- [ ] Linha do item com miniatura, nome, preço e remover.
- [ ] Stepper de quantidade recalcula subtotal em tempo real.
- [ ] Cupom: aplicar/remover atualiza o resumo.
- [ ] Payment Summary (resumo) como seção própria em largura total.
- [ ] CTA "Continuar para pagamento" sempre acessível (rolagem longa).
- [ ] Carrinho vazio: estado vazio com CTA para o mercado.

## 5. Checkout / Pagamento (`/checkout*`)

Figma `mobile-pagamento.json` (Content 358 px, centralizado).

- [ ] Formulário usa teclado correto do iOS (email, número, cartão).
- [ ] Carteiras (MetaMask, Coinbase, WalletConnect) listadas e selecionáveis.
- [ ] Seleção de rede exibida como chips/badges, não dropdown desktop.
- [ ] Botão de pagamento fixo/acessível; loading state durante "processando".
- [ ] Resumo do pedido visível antes de confirmar.
- [ ] QR / pagamento por scanner não submete formulário por acidente.

## 6. Login / Cadastro (`/login`, `/register`)

Figma `mobile-login.json`: Logo (y=80), Form (y=312), Sign In (y=492),
Social Block (y=592), Signup (y=756). `mobile-cadastro.json`: Create (y=588),
Social (y=688), Login (y=852).

- [ ] Formulário e botões em largura útil de 358 px (px-7) — respiração nas laterais.
- [ ] Botão social "Google" / "Facebook" em bloco móvel próprio.
- [ ] Modo "criar conta" abre (modal ou rota) sem perda de dados digitados.
- [ ] `error summary`/validação visível e acessível no mobile.

## 7. Perfil, Carteiras e Suporte

Sem frames mobile dedicados — adaptados dos frames desktop (`md:hidden`/`md:block`).

- [ ] Sidebar vira seção empilhada ou abas no mobile; sem hambúrguer quebrado.
- [ ] Tabela de Ordens de Serviço rola horizontalmente sem quebrar o layout.
- [ ] Widget de Suporte/OS abre em bottom sheet/drawer no mobile.
- [ ] Formulário de OS e seleção de categoria usáveis por toque.

## 8. Acessibilidade e i18n (mobile)

- [ ] Fonte OpenDyslexic aplicada em todas as telas quando ativada.
- [ ] VLibras não sobrepõe o CTA principal nem a Tab Bar.
- [ ] Alt/aria em todos os ícones (coração, carrinho, QR, voltar).
- [ ] Contraste mínimo AA em texto sobre superfícies claras/escuras.
- [ ] PT/EN/ES: textos de cadeia mais longa não estouram cards/botões.

---

## Referências

- Figma mobile: `design/screens/mobile-{incio,detalhesdonft,carrinhodenfts,pagamento,login,cadastro}.json`
- Tab Bar: `src/components/layout/mobile-tab-bar.tsx`
- Detalhe: `src/components/nft/nft-detail-page.tsx`
- Matriz de dispositivos e idiomas: `README.md` → seção "Matriz de dispositivos"