import { useTranslation } from 'react-i18next'

const SOCIAL = ['Instagram', 'X', 'Discord']

export function KurioFooter() {
  const { t } = useTranslation()

  const columns: Array<{ title: string; links: string[] }> = [
    {
      title: t('footer.columns.account'),
      links: [
        t('footer.accountLinks.profile'),
        t('footer.accountLinks.collection'),
        t('footer.accountLinks.activity'),
        t('footer.accountLinks.studio'),
        t('footer.accountLinks.watchlist'),
      ],
    },
    {
      title: t('footer.columns.help'),
      links: [
        t('footer.helpLinks.howToBuy'),
        t('footer.helpLinks.walletSecurity'),
        t('footer.helpLinks.marketPolicy'),
        t('footer.helpLinks.report'),
      ],
    },
    {
      title: t('footer.columns.collections'),
      links: [
        t('footer.collectionLinks.art'),
        t('footer.collectionLinks.photography'),
        t('footer.collectionLinks.music'),
        t('footer.collectionLinks.art3d'),
        t('footer.collectionLinks.utility'),
      ],
    },
  ]

  return (
    <footer className="hidden border-t border-kurio-surface bg-kurio-bg md:block">
      <div className="mx-auto max-w-content px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.2fr_repeat(3,1fr)]">
          <div className="space-y-3">
            <p className="text-2xl font-bold tracking-[0.2em] text-kurio-cream">{t('nav.brand')}</p>
            <p className="whitespace-pre-line text-sm text-kurio-sand">{t('footer.tagline')}</p>
            <p className="text-sm text-kurio-sand">{t('footer.email')}</p>
            <p className="text-sm text-kurio-sand">{t('footer.phone')}</p>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title} className="space-y-3">
              <p className="text-sm font-bold text-kurio-cream">{column.title}</p>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link}>
                    <span className="cursor-not-allowed text-sm text-kurio-sand" title="Fora do escopo">
                      {link}
                    </span>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-kurio-surface pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-kurio-cream">{t('footer.walletsTitle')}</span>
            <span className="text-sm tracking-wide text-kurio-sand">METAMASK • WALLETCONNECT • COINBASE</span>
          </div>
          <ul className="flex gap-4">
            {SOCIAL.map((network) => (
              <li key={network}>
                <span className="text-sm text-kurio-sand" title="Fora do escopo">
                  {network}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-xs text-kurio-sand">{t('footer.copyright')}</p>
      </div>
    </footer>
  )
}
