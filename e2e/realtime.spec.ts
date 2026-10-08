import { expect, test } from "@playwright/test";

/**
 * Valida que o `socket.io-client` real recebe eventos via MSW
 * (`@mswjs/socket.io-binding`) e que o cache do TanStack Query é atualizado.
 */

test("nft.updated via Socket.IO atualiza o preço no detalhe", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForFunction(() => Boolean(window.__mocks), null, {
    timeout: 15_000,
  });
  await page.evaluate(() => window.__mocks!.reset());

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
    await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
  }

  await page.goto("/nfts/nft-001");
  const price = page
    .locator("p, span")
    .filter({ hasText: /^\d+(\.\d+)? ETH$/ })
    .filter({ visible: true })
    .first();
  await expect(price).toBeVisible();
  const before = await price.innerText();

  await expect
    .poll(
      async () => {
        await page.evaluate(() =>
          window.__mocks!.emitNftPriceChange("nft-001", 1.5),
        );
        return price.innerText();
      },
      { timeout: 20_000, intervals: [500, 1000, 1500] },
    )
    .not.toBe(before);
});
