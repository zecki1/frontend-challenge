import { readdir, mkdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import sharp from 'sharp'

/**
 * Otimização de imagens do Figma: converte os PNGs extraídos para WebP em dois
 * tamanhos (640 e 1280) para uso com `srcset`. Rodar: `npm run images:optimize`.
 *
 * Decisão: WebP reduz ~80–90% do peso preservando qualidade, melhora LCP e a
 * pontuação do Lighthouse, e tem suporte amplo (todos os navegadores modernos).
 */
const SOURCE_DIR = 'design/assets'
const OUTPUT_DIR = 'public/nfts'
const SIZES = [640, 1280]
const QUALITY = 82

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true })
  const files = (await readdir(SOURCE_DIR)).filter((file) => file.endsWith('.png'))

  for (const file of files) {
    const name = path.parse(file).name
    const input = path.join(SOURCE_DIR, file)
    const metadata = await sharp(input).metadata()

    for (const size of SIZES) {
      const output = path.join(OUTPUT_DIR, `${name}-${size}.webp`)
      const info = await sharp(input)
        .resize(size, size, { fit: 'cover' })
        .webp({ quality: QUALITY })
        .toFile(output)
      console.log(`${file} (${metadata.width}px) -> ${output} (${size}px, ${(info.size / 1024).toFixed(0)} KB)`)
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
