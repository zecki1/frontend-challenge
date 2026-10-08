import { useEffect } from 'react'
import type { ReactNode } from 'react'
import Lenis from 'lenis'
import AOS from 'aos'
import 'aos/dist/aos.css'

/**
 * Smooth scroll (Lenis) + animações on-scroll (AOS).
 * Respeita `prefers-reduced-motion`: nesse caso nada é animado nem suavizado.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    AOS.init({
      duration: 600,
      easing: 'ease-out-cubic',
      once: true,
      offset: 40,
      disable: reduceMotion,
    })

    if (reduceMotion) return

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true, touchMultiplier: 1.2 })
    lenis.on('scroll', () => AOS.refresh())

    let frame = requestAnimationFrame(function loop(time) {
      lenis.raf(time)
      frame = requestAnimationFrame(loop)
    })

    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
