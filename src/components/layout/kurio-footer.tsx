import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { sendNewsletterConfirmation } from '@/lib/email'

const SOCIAL = ['Instagram', 'X', 'Discord']

export function KurioFooter() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

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

  const features = [
    {
      icon: '🛡️',
      title: t('footer.features.walletSecurityTitle'),
      description: t('footer.features.walletSecurityDesc'),
    },
    {
      icon: '⭐',
      title: t('footer.features.featuredCreatorsTitle'),
      description: t('footer.features.featuredCreatorsDesc'),
    },
    {
      icon: '🔔',
      title: t('footer.features.launchAlertsTitle'),
      description: t('footer.features.launchAlertsDesc'),
    },
  ]

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || emailStatus === 'loading') return

    setEmailStatus('loading')
    const result = await sendNewsletterConfirmation(email)
    setEmailStatus(result.success ? 'success' : 'error')
    if (result.success) setEmail('')
    setTimeout(() => setEmailStatus('idle'), 3000)
  }

  return (
    <footer className="hidden border-t border-kurio-surface bg-kurio-bg md:block">
      <div className="mx-auto max-w-content px-4 py-14 sm:px-6">
        {/* Newsletter Section */}
        <section className="mb-14 p-6 md:p-10 rounded-xl bg-kurio-surface border border-kurio-copper/20">
          <div className="max-w-2xl mx-auto text-center">
            <p className="font-mono text-[18px] font-bold text-kurio-copperLight mb-2">{t('footer.newsletter.badge')}</p>
            <h2 className="text-[28px] font-bold text-kurio-cream mb-3">{t('footer.newsletter.title')}</h2>
            <p className="text-kurio-sand mb-6">{t('footer.newsletter.subtitle')}</p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('footer.newsletter.placeholder')}
                disabled={emailStatus === 'loading' || emailStatus === 'success'}
                className="flex-1 h-12 rounded-md border border-kurio-surface bg-kurio-surface2 px-4 text-sm text-kurio-cream outline-none transition-colors focus:border-kurio-copper"
                aria-label={t('footer.newsletter.placeholder')}
              />
              <button
                type="submit"
                disabled={emailStatus === 'loading' || emailStatus === 'success' || !email}
                className="h-12 px-6 rounded-md bg-kurio-copper text-sm font-bold text-kurio-bg transition-colors hover:bg-kurio-copperLight disabled:opacity-50 whitespace-nowrap"
              >
                {emailStatus === 'loading' ? '…' : emailStatus === 'success' ? t('footer.newsletter.success') : t('footer.newsletter.submit')}
              </button>
            </form>
            {emailStatus === 'error' && (
              <p className="mt-2 text-sm text-kurio-coral" role="alert">{t('footer.newsletter.error')}</p>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-14">
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature, index) => (
              <article key={index} className="p-6 rounded-xl bg-kurio-surface border border-kurio-copper/20">
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="font-mono text-lg font-bold text-kurio-cream mb-2">{feature.title}</h3>
                <p className="text-sm text-kurio-sand leading-relaxed">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Footer Columns */}
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