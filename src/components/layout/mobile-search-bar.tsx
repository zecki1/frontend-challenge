import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, SlidersHorizontal } from 'lucide-react'

interface MobileSearchBarProps {
  defaultValue?: string
  onSearch?: (query: string) => void
}

/** Search Bar do Figma "Mobile / Início" (366×45): campo + botão de filtro. */
export function MobileSearchBar({ defaultValue = '', onSearch }: MobileSearchBarProps) {
  const { t } = useTranslation()
  const [value, setValue] = useState(defaultValue)

  return (
    <form
      role="search"
      className="flex gap-2 px-6 pt-10 md:hidden"
      onSubmit={(event) => {
        event.preventDefault()
        onSearch?.(value)
      }}
    >
      <div className="flex h-[45px] flex-1 items-center gap-2 rounded-lg bg-kurio-surface px-3">
        <Search className="h-5 w-5 shrink-0 text-kurio-bronze" aria-hidden />
        <input
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={t('home.searchPlaceholder')}
          aria-label={t('home.searchPlaceholder')}
          className="h-full w-full bg-transparent text-sm font-bold text-kurio-cream placeholder:text-kurio-bronze focus:outline-none"
        />
      </div>
      <button
        type="submit"
        aria-label={t('home.filters')}
        className="flex h-[45px] w-[45px] shrink-0 items-center justify-center rounded-lg bg-gradient-to-b from-kurio-copper/25 to-kurio-copper text-kurio-bg"
      >
        <SlidersHorizontal className="h-5 w-5" aria-hidden />
      </button>
    </form>
  )
}
