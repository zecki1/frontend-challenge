import { spawnSync } from 'node:child_process'

/**
 * Roda as auditorias Lighthouse (mobile + desktop), cada uma com 3 medições por
 * página. Os relatórios HTML/JSON ficam em `lighthouse-reports/{mobile,desktop}`.
 * Requer Google Chrome instalado.
 */
const configs = ['lighthouserc.cjs', 'lighthouserc.desktop.cjs']

for (const config of configs) {
  console.log(`\n=== Lighthouse: ${config} ===\n`)
  const result = spawnSync('npx', ['lhci', 'autorun', '--config', config], {
    stdio: 'inherit',
    shell: true,
  })
  if (result.status !== 0) {
    console.error(`Lighthouse falhou para ${config} (exit ${result.status}).`)
    process.exitCode = result.status ?? 1
  }
}
