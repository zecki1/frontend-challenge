import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/features/auth/auth-context"
import { SocialButtons } from "@/components/auth/social-buttons"
import { ApiError } from "@/lib/api-error"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose, X } from "@/components/ui/dialog"
import { useNavigate } from "@tanstack/react-router"

const loginSchema = z.object({
  email: z.string().min(1, "Informe o e-mail.").email("E-mail inválido."),
  password: z.string().min(1, "Informe a senha."),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginModal() {
  const { t } = useTranslation()
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = React.useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "collector@example.com", password: "password123" },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await login(values)
      void navigate({ to: "/" as never, replace: true })
    } catch (error) {
      form.setError("root", {
        message: error instanceof ApiError ? error.message : "Falha ao entrar.",
      })
    }
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex h-[35px] items-center gap-1 rounded-md bg-kurio-copper px-4 font-mono text-base font-medium text-kurio-bg transition-colors hover:bg-kurio-copperLight"
        >
          {t("nav.entrar")}
        </button>
      </DialogTrigger>

      <DialogContent className="p-6">
        <DialogHeader>
          <DialogTitle>{t("auth.loginTitle")}</DialogTitle>
        </DialogHeader>

        <form
          className="mt-4 space-y-4"
          onSubmit={onSubmit}
          noValidate
        >
          <div className="space-y-2">
            <label htmlFor="login-email" className="text-sm text-kurio-bronze">
              {t("auth.email")}
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              className="h-11 w-full rounded-md border border-kurio-surface bg-kurio-surface2 px-3 text-sm text-kurio-cream outline-none transition-colors focus:border-kurio-copper"
              {...form.register("email")}
              defaultValue="collector@example.com"
              aria-invalid={Boolean(form.formState.errors.email)}
            />
            {form.formState.errors.email ? (
              <p role="alert" className="text-xs text-kurio-coral">
                {form.formState.errors.email.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="login-password" className="text-sm text-kurio-bronze">
              {t("auth.password")}
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              className="h-11 w-full rounded-md border border-kurio-surface bg-kurio-surface2 px-3 text-sm text-kurio-cream outline-none transition-colors focus:border-kurio-copper"
              {...form.register("password")}
              aria-invalid={Boolean(form.formState.errors.password)}
            />
            {form.formState.errors.password ? (
              <p role="alert" className="text-xs text-kurio-coral">
                {form.formState.errors.password.message}
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-end space-x-2">
            <span
              className="cursor-not-allowed text-sm text-kurio-copper"
              title="Fora do escopo"
            >
              {t("auth.forgot")}
            </span>
          </div>

          <div className="mt-4">
            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full h-11 rounded-md bg-kurio-copper text-base font-bold text-kurio-bg transition-colors hover:bg-kurio-copperLight disabled:opacity-50"
            >
              {form.formState.isSubmitting ? "…" : t("auth.submitLogin")}
            </button>
          </div>
        </form>

        <DialogFooter>
          <div className="flex items-center justify-end gap-2">
            <span className="cursor-not-allowed text-sm text-kurio-copper" title="Fora do escopo">
              {t("auth.orContinue")}
            </span>
            <SocialButtons />
          </div>
        </DialogFooter>
      </DialogContent>

      <DialogClose>
        <button
          type="button"
          className="absolute right-4 top-4 rounded-sm p-1 hover:bg-kurio-surface2 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </DialogClose>
    </Dialog>
  )
}