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

test("catálogo carrega NFTs a partir dos mocks", async ({ page }) => {
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const cards = page.locator('main a[href^="/nfts/"]');
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
  await page.getByLabel("E-mail").fill("collector@example.com");
  await page.getByLabel("Senha").fill("password123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).not.toHaveURL(/\/login/);
  if (test.info().project.name === "chromium-desktop") {
    await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
  } else {
    await page.goto("/favorites");
    await expect(page).not.toHaveURL(/\/login/);
  }
});

test("rota privada redireciona visitante para o login", async ({ page }) => {
  await page.goto("/checkout");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
});
