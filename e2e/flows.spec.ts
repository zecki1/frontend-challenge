import { expect, test } from "@playwright/test";

/**
 * Testes E2E dos fluxos críticos: compra completa, favoritos, carrinho.
 */

const visible = { visible: true } as const;

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => Boolean(window.__mocks), null, {
    timeout: 15_000,
  });
  await page.evaluate(() => window.__mocks!.reset());
});

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  // `exact: true` evita casar com o aria-label do input da newsletter do footer.
  await page.getByLabel("E-mail", { exact: true }).fill("collector@example.com");
  await page.getByLabel("Senha", { exact: true }).fill("password123");
  // O header também expõe um botão "Entrar" (abre o modal de login);
  // restringimos ao formulário para evitar violação de strict mode.
  await page
    .locator("form")
    .getByRole("button", { name: "Entrar" })
    .click();
  await expect(page).not.toHaveURL(/\/login/);
  if (test.info().project.name === "chromium-desktop") {
    // O menu do usuário é um <Link> com aria-label="Menu do usuário", não um <button>
    await expect(page.getByRole("link", { name: "Menu do usuário" })).toBeVisible();
  }
}

test("fluxo completo de compra", async ({ page }) => {
  await login(page);

  await page.goto("/nfts/nft-001");
  await page
    .getByRole("button", { name: /comprar/i })
    .filter(visible)
    .first()
    .click();
  await expect(
    page.getByText("Adicionado ao carrinho.").filter(visible).first(),
  ).toBeVisible();

  await page.goto("/cart");
  await expect(
    page.getByText("Emerald Ape #042").filter(visible).first(),
  ).toBeVisible();

  await page.goto("/checkout");
  // Seleciona carteira (desktop: select#co-wallet-type)
  const walletSelect = page.locator('select[id="co-wallet-type"]').filter(visible).first();
  if ((await walletSelect.count()) > 0) {
    await walletSelect.selectOption({ index: 1 });
  }
  // Seleciona rede (desktop: select#co-network)
  const networkSelect = page.locator('select[id="co-network"]').filter(visible).first();
  if ((await networkSelect.count()) > 0) {
    await networkSelect.selectOption({ index: 1 });
  }
  await page
    .getByRole("button", { name: "Confirmar compra" })
    .filter(visible)
    .first()
    .click();

  await expect(page).toHaveURL(/\/orders\//);
  await expect(
    page
      .getByText("Seus NFTs agora estão na sua carteira")
      .filter(visible)
      .first(),
  ).toBeVisible();
});

test("favoritos: adicionar e listar", async ({ page }) => {
  await login(page);

  await page.goto("/nfts/nft-001");
  const heart = page
    .locator('button[aria-label^="Favoritar"]')
    .filter(visible)
    .first();

  await expect(heart).toHaveAttribute("aria-pressed", "true");
  await page.goto("/favorites");
  await expect(
    page.getByText("Emerald Ape #042").filter(visible).first(),
  ).toBeVisible();

  await page.goto("/nfts/nft-001");
  await page
    .locator('button[aria-label^="Favoritar"]')
    .filter(visible)
    .first()
    .click();
  await expect(
    page.locator('button[aria-label^="Favoritar"]').filter(visible).first(),
  ).toHaveAttribute("aria-pressed", "false");

  await page.goto("/favorites");
  await expect(
    page.getByText("Emerald Ape #042").filter(visible).first(),
  ).toBeHidden();
});

test("carrinho: adicionar, alterar quantidade e remover", async ({ page }) => {
  await page.goto("/nfts/nft-001");
  await page
    .getByRole("button", { name: /comprar/i })
    .filter(visible)
    .first()
    .click();
  await expect(
    page.getByText("Adicionado ao carrinho.").filter(visible).first(),
  ).toBeVisible();

  await page.goto("/cart");
  await expect(
    page.getByText("Emerald Ape #042").filter(visible).first(),
  ).toBeVisible();

  await page
    .getByRole("button", { name: "Aumentar quantidade (Emerald Ape #042)" })
    .filter(visible)
    .first()
    .click();

  await expect(
    page.getByText("2.38 ETH").filter(visible).first(),
  ).toBeVisible();

  await page
    .getByRole("button", { name: /^Remover/ })
    .filter(visible)
    .first()
    .click();
  await expect(
    page.getByText("Seu carrinho está vazio.").filter(visible).first(),
  ).toBeVisible();
});

test("cupom: aplicar código válido", async ({ page }) => {
  await page.goto("/nfts/nft-001");
  await page
    .getByRole("button", { name: /comprar/i })
    .filter(visible)
    .first()
    .click();
  await expect(
    page.getByText("Adicionado ao carrinho.").filter(visible).first(),
  ).toBeVisible();

  await page.goto("/cart");
  const couponInput = page
    .locator('input[placeholder*="código" i]')
    .filter(visible)
    .first();
  await couponInput.fill("WEB3");
  await couponInput.press("Enter");

  await expect(
    page.getByText("Desconto do lançamento").filter(visible).first(),
  ).toBeVisible();
});

test("carrinho: avisa quando o preço do item muda (tempo real)", async ({
  page,
}) => {
  await login(page);
  await page.goto("/nfts/nft-001");
  await page
    .getByRole("button", { name: /comprar/i })
    .filter(visible)
    .first()
    .click();
  await expect(
    page.getByText("Adicionado ao carrinho.").filter(visible).first(),
  ).toBeVisible();

  await page.goto("/cart");
  await expect(
    page.getByText("Emerald Ape #042").filter(visible).first(),
  ).toBeVisible();
  await expect(
    page.getByText("Seu carrinho foi atualizado").filter(visible).first(),
  ).toBeHidden();

  // Emite `nft.updated`; o realtime invalida a cotação e o aviso aparece.
  await page.evaluate(() => window.__mocks!.emitNftPriceChange("nft-001", 1.5));

  await expect(
    page.getByText("Seu carrinho foi atualizado").filter(visible).first(),
  ).toBeVisible();
  await expect(
    page.getByText(/O preço de Emerald Ape #042 mudou/).filter(visible).first(),
  ).toBeVisible();
});
