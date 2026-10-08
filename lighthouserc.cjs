/**
 * Lighthouse CI — perfil MOBILE (emulação padrão do Lighthouse).
 * Executa 3 medições por página; o LHCI reporta a mediana de cada categoria.
 * Requer Google Chrome instalado. Uso: `npm run lighthouse`.
 */
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run build:demo && npm run preview -- --port 4173',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 180000,
      url: ['http://localhost:4173/', 'http://localhost:4173/nfts/nft-001'],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['warn', { minScore: 0.95 }],
        'categories:best-practices': ['warn', { minScore: 0.95 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: 'lighthouse-reports/mobile',
    },
  },
}
