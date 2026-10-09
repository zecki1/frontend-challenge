import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FaDiscord,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
} from 'react-icons/fa'
import { subscribeNewsletter } from '@/lib/email'

const SOCIAL: Array<{ label: string; Icon: typeof FaFacebookF }> = [
  { label: 'Facebook', Icon: FaFacebookF },
  { label: 'Instagram', Icon: FaInstagram },
  { label: 'Twitter', Icon: FaTwitter },
  { label: 'LinkedIn', Icon: FaLinkedinIn },
  { label: 'Discord', Icon: FaDiscord },
]

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
      mark: 'W',
      title: t('footer.features.walletSecurityTitle'),
      description: t('footer.features.walletSecurityDesc'),
    },
    {
      mark: 'C',
      title: t('footer.features.featuredCreatorsTitle'),
      description: t('footer.features.featuredCreatorsDesc'),
    },
    {
      mark: 'D',
      title: t('footer.features.launchAlertsTitle'),
      description: t('footer.features.launchAlertsDesc'),
    },
  ]

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || emailStatus === 'loading') return

    setEmailStatus('loading')
    const result = await subscribeNewsletter(email)
    setEmailStatus(result.success ? 'success' : 'error')
    if (result.success) setEmail('')
    setTimeout(() => setEmailStatus('idle'), 3000)
  }

  return (
    <footer className="hidden border-kurio-surface bg-kurio-bg md:block">
      <div className="mx-auto max-w-content px-4 py-4 sm:px-6 bg-kurio-surface">
        {/* Faixa única: 3 features (service mark W/C/D) + newsletter — 4 colunas */}
        <section className="grid gap-8 border-b border-kurio-surface md:grid-cols-2 lg:grid-cols-[repeat(3,minmax(0,1fr))_1.35fr]">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="lg:border-l lg:border-kurio-copper/40 lg:pl-6 lg:first:border-l-0 lg:first:pl-0 border-l-2 border-l-kurio-copper pl-4"
            >
              <div className="mb-5 flex h-[74px] w-[74px] items-center justify-center rounded-full border border-kurio-copper/30 bg-kurio-copper font-mono text-2xl font-bold text-kurio-surface">
                {feature.mark}
              </div>
              <h3 className="mb-3 font-mono text-sm font-bold text-kurio-cream">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-kurio-sand">
                {feature.description}
              </p>
            </article>
          ))}

          <div className="lg:border-l lg:border-kurio-copper/40 lg:pl-6 border-l-2 border-l-kurio-copper pl-4">
            <h2 className="mb-4 text-[24px] font-bold leading-tight text-kurio-cream">
              {t('footer.newsletter.title')}
            </h2>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('footer.newsletter.placeholder')}
                disabled={emailStatus === 'loading' || emailStatus === 'success'}
                className="h-10 min-w-0 flex-1 rounded-md border border-kurio-surface bg-kurio-surface2 px-3 text-sm text-kurio-cream outline-none transition-colors focus:border-kurio-copper"
                aria-label={t('footer.newsletter.placeholder')}
              />
              <button
                type="submit"
                disabled={emailStatus === 'loading' || emailStatus === 'success' || !email}
                className="h-10 shrink-0 rounded-md bg-kurio-copper px-5 text-sm font-bold text-kurio-bg transition-colors hover:bg-kurio-copperLight disabled:opacity-50"
              >
                {emailStatus === 'loading'
                  ? '…'
                  : emailStatus === 'success'
                    ? t('footer.newsletter.success')
                    : t('footer.newsletter.submit')}
              </button>
            </form>
            {emailStatus === 'error' ? (
              <p className="mt-2 text-sm text-kurio-coral" role="alert">
                {t('footer.newsletter.error')}
              </p>
            ) : null}
            <p className="mt-4 text-sm leading-relaxed text-kurio-sand">
              {t('footer.newsletter.subtitle')}
            </p>
          </div>
        </section>
      </div>

    
      <div className="mx-auto max-w-content ">
        <div className="px-6 py-7 bg-[#38220f]">
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <p className="text-2xl font-bold tracking-[0.2em] text-white">
              {t('nav.brand')}
            </p>
            <p className="whitespace-pre-line text-sm text-white">{t('footer.tagline')}</p>
            <p className="text-sm text-white">{t('footer.email')}</p>
            <p className="text-sm text-white">{t('footer.phone')}</p>
          </section>
        </div>
      </div>

      <div className="mx-auto max-w-content px-4 sm:px-6 bg-kurio-surface">
        {/* Colunas de links + (Redes sociais / Carteiras compatíveis) */}
        <section className="grid gap-8 py-10 md:grid-cols-2 lg:grid-cols-4">
          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title} className="space-y-3">
              <p className="text-sm font-bold text-white">{column.title}</p>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link}>
                    <span
                      className="cursor-not-allowed text-sm text-white"
                      title="Fora do escopo"
                    >
                      {link}
                    </span>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="space-y-7">
            <div>
              <p className="mb-3 text-sm font-bold text-white">
                {t('footer.columns.social')}
              </p>
              <ul className="flex gap-2">
                {SOCIAL.map(({ label, Icon }) => (
                  <li key={label}>
                    <span
                      role="img"
                      aria-label={label}
                      title="Fora do escopo"
                      className="flex h-[30px] w-[30px] cursor-not-allowed items-center justify-center rounded-md border border-kurio-surface bg-kurio-surface2 text-sm text-kurio-sand"
                    >
                      <Icon aria-hidden />
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-2 text-sm font-bold text-white">
                {t('footer.walletsTitle')}
              </p>
              <div className="inline-flex items-center rounded-md border border-kurio-surface bg-kurio-surface2 px-3 py-2">
                {/* Textos das carteiras dispostos lado a lado no desktop */}
                <p className="text-xs tracking-wide text-kurio-sand flex flex-col lg:flex-row lg:gap-1.5">
                  <span>METAMASK</span>
                  <span className="hidden lg:inline">•</span>
                  <span>WALLETCONNECT</span>
                  <span className="hidden lg:inline">•</span>
                  <span>COINBASE</span>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="py-4 bg-kurio-bg">
        <p className="text-center text-xs text-kurio-sand">{t('footer.copyright')}</p>
      </div>
    </footer>
  )
}