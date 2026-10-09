import { defineConfig, devices } from '@playwright/test'
import base from './playwright.config'

/**
 * Configuração da regressão visual (`npm run test:e2e:visual`).
 *
 * Fica à parte do `test:e2e` principal porque as baselines do `toHaveScreenshot`
 * são específicas da plataforma (o sufixo `-win32`/`-linux` no nome). Mantê-las
 * num alvo dedicado evita que o CI (Linux) compare com baselines geradas no
 * Windows. Gere/atualize com `npm run test:e2e:visual -- --update-snapshots`.
 *
 * `reducedMotion` desliga AOS e Lenis, e a spec ainda força `[data-aos]` visível
 * — sem isso elementos animados ficariam com opacidade 0 no screenshot.
 */
export default defineConfig({
  ...base,
  projects: [
    {
      name: 'visual-desktop',
      testMatch: /visual\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        reducedMotion: 'reduce',
      },
    },
    {
      name: 'visual-mobile',
      testMatch: /visual\.spec\.ts/,
      use: {
        ...devices['Pixel 7'],
        reducedMotion: 'reduce',
      },
    },
  ],
})
