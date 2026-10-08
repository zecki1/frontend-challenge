import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { FaFacebookF } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import { sessionApi } from '@/api'

type Provider = 'google' | 'facebook'

export function SocialButtons() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: (provider: Provider) => sessionApi.socialLogin(provider),
    onSuccess: () => {
      void navigate({ to: '/', replace: true })
    },
  })

  const handleSocial = (provider: Provider) => {
    mutation.mutate(provider)
  }

  return (
    <div className="flex w-full gap-3">
      <button
        type="button"
        onClick={() => handleSocial('google')}
        disabled={mutation.isPending}
        className="flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-kurio-surface bg-kurio-surface2 text-sm text-kurio-cream transition-colors hover:border-kurio-copper disabled:opacity-50"
      >
        <FcGoogle aria-hidden className="h-5 w-5" />
        {t('auth.google')}
      </button>
      <button
        type="button"
        onClick={() => handleSocial('facebook')}
        disabled={mutation.isPending}
        className="flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-kurio-surface bg-kurio-surface2 text-sm text-kurio-cream transition-colors hover:border-kurio-copper disabled:opacity-50"
      >
        <FaFacebookF aria-hidden className="h-5 w-5 text-kurio-copper" />
        {t('auth.facebook')}
      </button>
    </div>
  )
}
