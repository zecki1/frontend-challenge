import { useTranslation } from 'react-i18next'
import { Globe, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { setLanguage, supportedLanguages, languageLabels, type SupportedLanguage } from '@/i18n'

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const current = (i18n.resolvedLanguage ?? 'pt-BR') as SupportedLanguage

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full border border-kurio-surface text-kurio-cream hover:border-kurio-copper"
          aria-label={t('common.language')}
        >
          <Globe className="h-5 w-5" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="border-kurio-surface bg-kurio-surface2">
        {supportedLanguages.map((language) => (
          <DropdownMenuItem
            key={language}
            onClick={() => setLanguage(language)}
            className="cursor-pointer gap-2"
          >
            <span>{languageLabels[language]}</span>
            {current === language ? <Check className="ml-auto h-4 w-4 text-kurio-copper" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
