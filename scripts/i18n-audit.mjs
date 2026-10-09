/* Análise de chaves i18n mortas. Uso: node scripts/i18n-audit.mjs [--json] */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'src')
const LOCALES = join(SRC, 'i18n', 'locales')

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

const sourceFiles = walk(SRC).filter(
  (f) => ['.ts', '.tsx'].includes(extname(f)) && !f.includes('locales') && !f.endsWith('routeTree.gen.ts'),
)

const source = sourceFiles.map((f) => readFileSync(f, 'utf8')).join('\n')

// Chaves estáticas: t('a.b'), t("a.b"), Trans i18nKey="a.b"
const staticKeys = new Set()
for (const m of source.matchAll(/\bt\(\s*['"]([^'"]+)['"]/g)) staticKeys.add(m[1])
for (const m of source.matchAll(/i18nKey=['"]([^'"]+)['"]/g)) staticKeys.add(m[1])

// Prefixos estáticos de templates: t(`a.b.${x}`) -> "a.b."
const templatePrefixes = new Set()
for (const m of source.matchAll(/\bt\(\s*`([^`$]*)\$\{/g)) templatePrefixes.add(m[1])

// Qualquer literal parecido com chave (cobre mapas de constantes como
// ACTION_KEYS = { x: 'orders.action.x' }) conta como possível uso.
const literalKeys = new Set()
for (const m of source.matchAll(/['"]([a-z][a-zA-Z0-9]*(?:\.[a-zA-Z0-9]+)+)['"]/g)) {
  literalKeys.add(m[1])
}

const used = (key) =>
  staticKeys.has(key) ||
  literalKeys.has(key) ||
  [...templatePrefixes].some((prefix) => key.startsWith(prefix)) ||
  [...staticKeys, ...literalKeys].some((s) => s.startsWith(key + '.'))

function flatten(obj, prefix = '') {
  const keys = []
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v)) keys.push(...flatten(v, key))
    else keys.push(key)
  }
  return keys
}

const locale = JSON.parse(readFileSync(join(LOCALES, 'pt-BR.json'), 'utf8'))
const allKeys = flatten(locale)

const dead = allKeys.filter((key) => !used(key))

console.log(`Total de chaves (pt-BR): ${allKeys.length}`)
console.log(`Chaves estáticas referenciadas: ${staticKeys.size}`)
console.log(`Prefixos de template: ${templatePrefixes.size}`)
console.log(`Chaves mortas: ${dead.length}`)
console.log('---')
for (const key of dead) console.log(key)
