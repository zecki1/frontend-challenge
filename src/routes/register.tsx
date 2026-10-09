import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/features/auth/auth-context'
import { ApiError } from '@/lib/api-error'
import { SocialButtons } from '@/components/auth/social-buttons'
import { registerSchema, type RegisterFormValues } from '@/features/auth/register-schema'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const { register: registerUser } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
      })
      void navigate({ to: '/', replace: true })
    } catch (error) {
      if (error instanceof ApiError && error.details) {
        for (const [field, messages] of Object.entries(error.details)) {
          if (field in values) {
            form.setError(field as keyof RegisterFormValues, { message: messages[0] })
          }
        }
      }
      form.setError('root', {
        message: error instanceof ApiError ? error.message : 'Falha ao criar conta.',
      })
    }
  })

  const fields = [
    { name: 'name', label: t('auth.name'), type: 'text', autoComplete: 'name' },
    { name: 'email', label: t('auth.email'), type: 'email', autoComplete: 'email' },
    { name: 'password', label: t('auth.password'), type: 'password', autoComplete: 'new-password' },
    { name: 'confirmPassword', label: t('auth.confirmPassword'), type: 'password', autoComplete: 'new-password' },
  ] as const

  return (
    <section className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-16">
      <div className="mb-8 flex w-full items-center justify-center gap-8">
        <Link to="/login" className="text-xl font-medium text-kurio-cream transition-colors hover:text-kurio-copper">
          {t('auth.loginTitle')}
        </Link>
        <span className="text-xl font-medium text-kurio-copper" aria-current="page">
          {t('auth.registerTitle')}
        </span>
      </div>

      <p className="mb-8 text-center text-[13px] text-kurio-cream">{t('auth.registerSubtitle')}</p>

      {form.formState.errors.root ? (
        <p role="alert" className="mb-4 w-full rounded-md border border-kurio-coral/40 bg-kurio-coral/5 p-3 text-sm text-kurio-coral">
          {form.formState.errors.root.message}
        </p>
      ) : null}

      <form className="w-full space-y-5" onSubmit={onSubmit} noValidate>
        {fields.map((field) => (
          <div key={field.name} className="space-y-1">
            <label htmlFor={`register-${field.name}`} className="text-sm text-kurio-bronze">
              {field.label}
            </label>
            <input
              id={`register-${field.name}`}
              type={field.type}
              autoComplete={field.autoComplete}
              className="h-11 w-full rounded-md border border-kurio-surface bg-kurio-surface2 px-3 text-sm text-kurio-cream outline-none transition-colors focus:border-kurio-copper"
              aria-invalid={Boolean(form.formState.errors[field.name])}
              {...form.register(field.name)}
            />
            {form.formState.errors[field.name] ? (
              <p className="text-xs text-kurio-coral">{form.formState.errors[field.name]?.message}</p>
            ) : null}
          </div>
        ))}

        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="h-11 w-full rounded-md bg-kurio-copper text-base font-bold text-kurio-bg transition-colors hover:bg-kurio-copperLight disabled:opacity-50"
        >
          {form.formState.isSubmitting ? '…' : t('auth.submitRegister')}
        </button>
      </form>

      <div className="mt-6 w-full">
        <p className="mb-4 text-center text-[13px] text-kurio-cream">{t('auth.orContinue')}</p>
        <SocialButtons />
      </div>
    </section>
  )
}
