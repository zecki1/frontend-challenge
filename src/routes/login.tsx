import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/features/auth/auth-context'
import { ApiError } from '@/lib/api-error'
import { SocialButtons } from '@/components/auth/social-buttons'

const loginSchema = z.object({
  email: z.string().min(1, 'Informe o e-mail.').email('E-mail inválido.'),
  password: z.string().min(1, 'Informe a senha.'),
})

type LoginForm = z.infer<typeof loginSchema>

export const Route = createFileRoute('/login')({
  validateSearch: (search): { redirect?: string } => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  component: LoginPage,
})

function LoginPage() {
  const { login } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const search = Route.useSearch()

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'collector@example.com', password: 'password123' },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await login(values)
      void navigate({ to: (search.redirect ?? '/') as never, replace: true })
    } catch (error) {
      form.setError('root', {
        message: error instanceof ApiError ? error.message : 'Falha ao entrar.',
      })
    }
  })

  return (
    <section className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-16">
      <div className="mb-8 flex w-full items-center justify-center gap-8">
        <span className="text-xl font-medium text-kurio-copper" aria-current="page">
          {t('auth.loginTitle')}
        </span>
        <Link to="/register" className="text-xl font-medium text-kurio-cream transition-colors hover:text-kurio-copper">
          {t('auth.registerTitle')}
        </Link>
      </div>

      <p className="mb-8 text-center text-[13px] text-kurio-cream">{t('auth.loginSubtitle')}</p>

      {form.formState.errors.root ? (
        <p role="alert" className="mb-4 w-full rounded-md border border-kurio-coral/40 bg-kurio-coral/5 p-3 text-sm text-kurio-coral">
          {form.formState.errors.root.message}
        </p>
      ) : null}

      <form className="w-full space-y-5" onSubmit={onSubmit} noValidate>
        <div className="space-y-1">
          <label htmlFor="login-email" className="text-sm text-kurio-bronze">
            {t('auth.email')}
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            className="h-11 w-full rounded-md border border-kurio-surface bg-kurio-surface2 px-3 text-sm text-kurio-cream outline-none transition-colors focus:border-kurio-copper"
            aria-invalid={Boolean(form.formState.errors.email)}
            {...form.register('email')}
          />
          {form.formState.errors.email ? (
            <p className="text-xs text-kurio-coral">{form.formState.errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label htmlFor="login-password" className="text-sm text-kurio-bronze">
            {t('auth.password')}
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            className="h-11 w-full rounded-md border border-kurio-surface bg-kurio-surface2 px-3 text-sm text-kurio-cream outline-none transition-colors focus:border-kurio-copper"
            aria-invalid={Boolean(form.formState.errors.password)}
            {...form.register('password')}
          />
          {form.formState.errors.password ? (
            <p className="text-xs text-kurio-coral">{form.formState.errors.password.message}</p>
          ) : null}
        </div>

        <div className="flex justify-end">
          <span className="cursor-not-allowed text-sm text-kurio-copper" title="Fora do escopo">
            {t('auth.forgot')}
          </span>
        </div>

        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="h-11 w-full rounded-md bg-kurio-copper text-base font-bold text-kurio-bg transition-colors hover:bg-kurio-copperLight disabled:opacity-50"
        >
          {form.formState.isSubmitting ? '…' : t('auth.submitLogin')}
        </button>
      </form>

      <div className="mt-6 w-full">
        <p className="mb-4 text-center text-[13px] text-kurio-cream">{t('auth.orContinue')}</p>
        <SocialButtons />
      </div>
    </section>
  )
}
