/**
 * Gera imagens SVG determinísticas como data URI.
 *
 * Mantém a aplicação 100% offline (sem depender de serviços de placeholder).
 * Serão substituídas pelos assets do Figma na etapa de fidelidade visual.
 */

function hashString(input: string): number {
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

const PALETTES: Array<[string, string, string]> = [
  ['#6366f1', '#8b5cf6', '#0ea5e9'],
  ['#f97316', '#ef4444', '#f59e0b'],
  ['#10b981', '#06b6d4', '#3b82f6'],
  ['#ec4899', '#8b5cf6', '#f43f5e'],
  ['#84cc16', '#22c55e', '#14b8a6'],
  ['#0ea5e9', '#6366f1', '#a855f7'],
]

export function placeholderImage(seed: string, label: string): string {
  const hash = hashString(seed)
  const [from, mid, to] = PALETTES[hash % PALETTES.length]
  const angle = hash % 360
  const safeLabel = label.replace(/[<>&]/g, '').slice(0, 24)
  const shapes = Array.from({ length: 5 }, (_, index) => {
    const cx = (hash >> (index * 3)) % 400
    const cy = (hash >> (index * 5)) % 400
    const r = 30 + ((hash >> (index * 2)) % 140)
    const opacity = 0.08 + ((hash >> index) % 20) / 100
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff" opacity="${opacity.toFixed(2)}"/>`
  }).join('')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" role="img">
    <defs>
      <linearGradient id="g" gradientTransform="rotate(${angle} 0.5 0.5)">
        <stop offset="0%" stop-color="${from}"/>
        <stop offset="50%" stop-color="${mid}"/>
        <stop offset="100%" stop-color="${to}"/>
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="url(#g)"/>
    ${shapes}
    <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" font-family="Inter, sans-serif" font-size="34" font-weight="700" fill="#ffffff" opacity="0.92">${safeLabel}</text>
  </svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
