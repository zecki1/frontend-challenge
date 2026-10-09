import { expect, test } from "@playwright/test";

/**
 * Smoke E2E: valida que a fundação está de pé — mocks REST (MSW), roteamento
 * (TanStack Router), estado remoto (TanStack Query) e autenticação simulada.
 * Os cenários completos entram junto com as telas finais.
 */

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  // Reseta os mocks para um estado conhecido antes de cada teste.
  await page.waitForFunction(() => Boolean(window.__mocks), null, {
    timeout: 15_000,
  });
  await page.evaluate(() => window.__mocks!.reset());
});

/**
 * Botão de submit do formulário de login. O header também renderiza um botão
 * "Entrar" (que abre o modal), então restringimos ao `<form>` da página.
 */
function submitLogin(page: import("@playwright/test").Page) {
  return page.locator("form").getByRole("button", { name: "Entrar" });
}

test("catálogo carrega NFTs a partir dos mocks", async ({ page }) => {
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  // O catálogo navega para `/mercado/nft/<numero>` (path param do TanStack Router).
  const cards = page.locator('main a[href^="/mercado/nft/"]');
  await expect(cards.first()).toBeVisible();
  expect(await cards.count()).toBeGreaterThan(0);
});

test("acesso direto ao detalhe do NFT", async ({ page }) => {
  await page.goto("/nfts/nft-001");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /comprar|esgotado/i }),
  ).toBeVisible();
});

test("NFT inexistente mostra estado de erro", async ({ page }) => {
  await page.goto("/nfts/nao-existe");
  await expect(page.getByRole("alert")).toContainText("NFT não encontrado");
});

test("login autentica e mostra o usuário na navegação", async ({ page }) => {
  await page.goto("/login");
  // `exact: true` evita casar com o aria-label do input da newsletter do footer
  // ("digite seu e-mail..."), que senão torna o localizador ambíguo.
  await page.getByLabel("E-mail", { exact: true }).fill("collector@example.com");
  await page.getByLabel("Senha", { exact: true }).fill("password123");
  // O header também expõe um botão "Entrar" (abre o modal de login);
  // restringimos ao formulário para evitar violação de strict mode.
  await submitLogin(page).click();
  await expect(page).not.toHaveURL(/\/login/);
  if (test.info().project.name === "chromium-desktop") {
    await expect(page.getByRole("link", { name: "Menu do usuário" })).toBeVisible();
  } else {
    await page.goto("/favorites");
    await expect(page).not.toHaveURL(/\/login/);
  }
});

test("rota privada redireciona visitante para o login", async ({ page }) => {
  await page.goto("/checkout");
  await expect(page).toHaveURL(/\/login/);
  await expect(submitLogin(page)).toBeVisible();
});
