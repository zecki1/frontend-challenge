import { useEffect } from 'react'
import { usePreferences } from '@/components/providers/preferences-provider'

declare global {
  interface Window {
    VLibras?: {
      Widget: new (url: string) => unknown
    }
  }
}

/**
 * Widget VLibras (Libras). Quando a preferência está ativa, injeta o script
 * oficial e o contêiner `vw`. Em ambiente desconectado o script falha sem
 * derrubar a aplicação (try/catch + onerror).
 */
export function VlibrasWidget() {
  const { vlibras } = usePreferences()

  useEffect(() => {
    if (!vlibras) return

    const container = document.createElement('div')
    container.id = 'kurio-vlibras'
    container.innerHTML = `
      <div vw class="enabled">
        <div vw-access-button class="active"></div>
        <div vw-plugin-wrapper>
          <div class="vw-plugin-top-wrapper"></div>
        </div>
      </div>
    `
    document.body.appendChild(container)

    const script = document.createElement('script')
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js'
    script.async = true
    script.onload = () => {
      try {
        if (window.VLibras) new window.VLibras.Widget('https://vlibras.gov.br/app')
      } catch (error) {
        console.warn('[vlibras] falha ao inicializar o widget.', error)
      }
    }
    script.onerror = () =>
      console.warn('[vlibras] script não carregou (offline?) — widget indisponível.')
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(container)
      document.body.removeChild(script)
    }
  }, [vlibras])

  return null
}