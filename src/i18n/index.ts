import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ptBR from './locales/pt-BR.json'
import en from './locales/en.json'
import es from './locales/es.json'

export const supportedLanguages = ['pt-BR', 'en', 'es'] as const
export type SupportedLanguage = (typeof supportedLanguages)[number]

export const languageLabels: Record<SupportedLanguage, string> = {
  'pt-BR': 'Português',
  en: 'English',
  es: 'Español',
}

function initialLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return 'pt-BR'
  const stored = window.localStorage.getItem('kurio-lang') as SupportedLanguage | null
  return stored && supportedLanguages.includes(stored) ? stored : 'pt-BR'
}

void i18n.use(initReactI18next).init({
  resources: {
    'pt-BR': { translation: ptBR },
    en: { translation: en },
    es: { translation: es },
  },
  lng: initialLanguage(),
  fallbackLng: 'pt-BR',
  interpolation: { escapeValue: false },
})

export function setLanguage(language: SupportedLanguage): void {
  void i18n.changeLanguage(language)
  try {
    window.localStorage.setItem('kurio-lang', language)
  } catch {
    /* storage indisponível */
  }
}

export default i18n
