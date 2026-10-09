import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/features/auth/auth-context'
import { ApiError } from '@/lib/api-error'
import { registerSchema, type RegisterFormValues } from '@/features/auth/register-schema'
import { SocialButtons } from '@/components/auth/social-buttons'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface RegisterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Volta para o modal de login. */
  onBackToLogin: () => void
}

const FIELDS = [
  {
    id: 'register-name',
    key: 'name' as const,
    label: 'auth.name',
    placeholder: 'auth.namePlaceholder',
    type: 'text',
    autoComplete: 'name',
  },
  {
    id: 'register-email',
    key: 'email' as const,
    label: 'auth.email',
    placeholder: 'auth.emailPlaceholder',
    type: 'email',
    autoComplete: 'email',
  },
  {
    id: 'register-password',
    key: 'password' as const,
    label: 'auth.password',
    placeholder: 'auth.passwordPlaceholder',
    type: 'password',
    autoComplete: 'new-password',
  },
  {
    id: 'register-confirm',
    key: 'confirmPassword' as const,
    label: 'auth.confirmPassword',
    placeholder: 'auth.confirmPasswordPlaceholder',
    type: 'password',
    autoComplete: 'new-password',
  },
] as const

export function RegisterDialog({ open, onOpenChange, onBackToLogin }: RegisterDialogProps) {
  const { t } = useTranslation()
  const { register: registerUser } = useAuth()
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
      onOpenChange(false)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="items-center space-y-2 text-center">
          <DialogTitle className="text-xl font-bold">
            <span className="text-kurio-copper">{t('auth.registerTitle')}</span>
          </DialogTitle>
          <p className="max-w-xs text-xs leading-relaxed text-kurio-sand">
            {t('auth.registerSubtitle')}
          </p>
        </DialogHeader>

        {form.formState.errors.root ? (
          <p
            role="alert"
            className="mt-4 w-full rounded-md border border-kurio-coral/40 bg-kurio-coral/5 p-3 text-sm text-kurio-coral"
          >
            {form.formState.errors.root.message}
          </p>
        ) : null}

        <form className="mt-4 space-y-4" onSubmit={onSubmit} noValidate>
          {FIELDS.map((field) => (
            <div key={field.id} className="space-y-2">
              <label htmlFor={field.id} className="text-sm text-kurio-bronze">
                {t(field.label)}
              </label>
              <input
                id={field.id}
                type={field.type}
                autoComplete={field.autoComplete}
                placeholder={t(field.placeholder)}
                className="h-11 w-full rounded-md border border-kurio-surface bg-kurio-surface2 px-3 text-sm text-kurio-cream outline-none transition-colors placeholder:text-kurio-bronze focus:border-kurio-copper"
                aria-invalid={Boolean(form.formState.errors[field.key])}
                {...form.register(field.key)}
              />
              {form.formState.errors[field.key] ? (
                <p role="alert" className="text-xs text-kurio-coral">
                  {form.formState.errors[field.key]?.message}
                </p>
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

        <DialogFooter className="mt-6">
          <div className="relative flex w-full items-center justify-center py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-kurio-surface" />
            </div>
            <span className="relative bg-kurio-bg px-3 text-xs text-kurio-sand">
              {t('auth.orContinue')}
            </span>
          </div>

          <div className="flex w-full flex-col gap-2 [&_div]:flex-col [&_div]:w-full [&_button]:h-11 [&_button]:w-full">
            <SocialButtons />
          </div>

          <p className="mt-4 text-center text-sm text-kurio-sand">
            {t('auth.hasAccount')}{' '}
            <button
              type="button"
              onClick={onBackToLogin}
              className="font-medium text-kurio-copper transition-colors hover:text-kurio-copperLight"
            >
              {t('auth.loginLink')}
            </button>
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}