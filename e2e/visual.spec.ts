import { expect, test, type Page } from '@playwright/test'

/**
 * Regressão visual com baselines versionadas (`e2e/__screenshots__`).
 *
 * Rodar/atualizar: `npm run test:e2e:visual -- --update-snapshots`.
 * A primeira execução sem baseline apenas grava o arquivo e falha; a segunda
 * compara. O alvo é separado do `test:e2e` porque as baselines são por
 * plataforma (Windows × Linux do CI).
 */

const visible = { visible: true } as const

async function reset(page: Page) {
  await page.goto('/')
  await page.waitForFunction(() => Boolean(window.__mocks), null, { timeout: 15_000 })
  await page.evaluate(() => window.__mocks!.reset())
  // `fast` zera a latência dos mocks → dados e tempo de render determinísticos.
  await page.evaluate(() => window.__mocks!.setScenario('fast'))
}

/**
 * Deixa a página pronta para o screenshot: neutraliza o AOS (mesmo sob
 * `reducedMotion`), carrega as imagens lazy e espera a rede estabilizar.
 */
async function stabilize(page: Page) {
  await page.addStyleTag({
    content: '[data-aos]{opacity:1!important;transform:none!important;transition:none!important}',
  })
  await page.evaluate(async () => {
    const step = window.innerHeight
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 30))
    }
    window.scrollTo(0, 0)
    // Só espera imagens visíveis: as do layout oposto (display:none) nunca
    // disparam load e travariam o Promise.all. Timeout como rede de segurança.
    const pending = Array.from(document.images).filter(
      (img) => !img.complete && img.getClientRects().length > 0,
    )
    await Promise.race([
      Promise.all(
        pending.map(
          (img) =>
            new Promise((resolve) => {
              img.addEventListener('load', resolve, { once: true })
              img.addEventListener('error', resolve, { once: true })
            }),
        ),
      ),
      new Promise((resolve) => setTimeout(resolve, 5_000)),
    ])
  })
  await page.waitForLoadState('networkidle')
}

async function login(page: Page) {
  await page.goto('/login')
  await page.getByLabel('E-mail', { exact: true }).fill('collector@example.com')
  await page.getByLabel('Senha', { exact: true }).fill('password123')
  await page.locator('form').getByRole('button', { name: 'Entrar' }).click()
  await expect(page).not.toHaveURL(/\/login/)
}

async function addToCart(page: Page) {
  await page.goto('/nfts/nft-001')
  await page.getByRole('button', { name: /comprar/i }).filter(visible).first().click()
  await expect(page.getByText('Adicionado ao carrinho.').filter(visible).first()).toBeVisible()
}

test.beforeEach(async ({ page }) => {
  await reset(page)
})

test('início', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('main a[href^="/mercado/nft/"]').first()).toBeVisible()
  await stabilize(page)
  await expect(page).toHaveScreenshot('home.png', { fullPage: true })
})

test('detalhe do NFT', async ({ page }) => {
  await page.goto('/nfts/nft-001')
  await expect(page.getByRole('button', { name: /comprar|esgotado/i }).filter(visible).first()).toBeVisible()
  await stabilize(page)
  await expect(page).toHaveScreenshot('nft-detail.png', { fullPage: true })
})

test('carrinho', async ({ page }) => {
  await login(page)
  await addToCart(page)
  await page.goto('/cart')
  await expect(page.getByText('Emerald Ape #042').filter(visible).first()).toBeVisible()
  await stabilize(page)
  await expect(page).toHaveScreenshot('cart.png', { fullPage: true })
})

test('checkout', async ({ page }) => {
  await login(page)
  await addToCart(page)
  await page.goto('/checkout')
  await expect(page.getByRole('button', { name: 'Confirmar compra' }).filter(visible).first()).toBeVisible()
  await stabilize(page)
  await expect(page).toHaveScreenshot('checkout.png', { fullPage: true })
})
