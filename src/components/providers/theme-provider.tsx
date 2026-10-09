import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  /** Tema efetivo ("dark"/"light") já resolvido quando é "system". */
  resolvedTheme: 'light' | 'dark'
  themes: Theme[]
}

const STORAGE_KEY = 'theme'

function systemPreference(): 'light' | 'dark' {
  return typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function resolve(theme: Theme): 'light' | 'dark' {
  return theme === 'system' ? systemPreference() : theme
}

/** Aplica a classe/tema no <html>. Também usada pelo script inline do index.html. */
function applyTheme(theme: Theme): void {
  const resolved = resolve(theme)
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(resolved)
  root.style.colorScheme = resolved
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

/**
 * Provider de tema local (substitui next-themes). O next-themes 0.4 renderiza
 * um `<script>` via React, o que gera o aviso "Encountered a script tag while
 * rendering React component" no console. Aqui a inicialização pré-hydration é
 * feita por um script inline no `index.html` — sem aviso e sem flash.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system'
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
    return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system'
  })

  useEffect(() => {
    applyTheme(theme)
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      if (theme === 'system') applyTheme('system')
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [theme])

  // Sincroniza mudanças de tema entre abas
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return
      const next = event.newValue as Theme
      if (next === 'light' || next === 'dark' || next === 'system') {
        setThemeState(next)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      resolvedTheme: resolve(theme),
      themes: ['light', 'dark', 'system'],
    }),
    [theme, setTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useThemeContext must be used within ThemeProvider')
  return context
}