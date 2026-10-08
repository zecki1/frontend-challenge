/**
 * Lighthouse CI — perfil DESKTOP. 3 medições por página (mediana reportada).
 * Requer Google Chrome instalado. Uso: `npm run lighthouse`.
 */
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run build:demo && npm run preview -- --port 4174',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 180000,
      url: ['http://localhost:4174/', 'http://localhost:4174/nfts/nft-001'],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
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
      outputDir: 'lighthouse-reports/desktop',
    },
  },
}
