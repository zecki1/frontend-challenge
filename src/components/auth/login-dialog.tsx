import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/features/auth/auth-context"
import { SocialButtons } from "@/components/auth/social-buttons"
import { RegisterDialog } from "@/components/auth/register-dialog"
import { ApiError } from "@/lib/api-error"
import { LogOut } from "lucide-react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog"
import { useNavigate } from "@tanstack/react-router"

const loginSchema = z.object({
  email: z.string().min(1, "Informe o e-mail.").email("E-mail inválido."),
  password: z.string().min(1, "Informe a senha."),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginDialog({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [registerOpen, setRegisterOpen] = useState(false)
  const [open, setOpen] = useState(defaultOpen)

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
          <LogOut className="h-5 w-5" aria-hidden />
          {t("nav.entrar")}
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-md p-6">
        {/* Cabeçalho centralizado */}
        <DialogHeader className="space-y-2 text-center items-center">
          <DialogTitle className="text-xl font-bold">
            <span className="text-kurio-copper">Entrar</span>{" "}
            <span className="text-kurio-bronze">|</span>{" "}
            <button
              type="button"
              onClick={() => setRegisterOpen(true)}
              className="font-bold text-kurio-copper transition-colors hover:text-kurio-copperLight"
            >
              Criar conta
            </button>
          </DialogTitle>
          <p className="max-w-xs text-xs leading-relaxed text-kurio-sand">
            Entre para gerenciar sua carteira, coleção e perfil de criador.
          </p>
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
              className="h-11 w-full rounded-md bg-kurio-copper text-base font-bold text-kurio-bg transition-colors hover:bg-kurio-copperLight disabled:opacity-50"
            >
              {form.formState.isSubmitting ? "…" : t("auth.submitLogin")}
            </button>
          </div>
        </form>

        <DialogFooter className="mt-6">
          {/* Divisor "Ou continue com" centralizado */}
          <div className="relative flex w-full items-center justify-center py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-kurio-surface" />
            </div>
            <span className="relative bg-kurio-bg px-3 text-xs text-kurio-sand">
              {t("auth.orContinue")}
            </span>
          </div>

          {/* Botões sociais em coluna com altura rigorosa h-11 idêntica ao botão de entrar */}
          <div className="flex w-full flex-col gap-2 [&_div]:flex-col [&_div]:w-full [&_button]:h-11 [&_button]:w-full">
            <SocialButtons />
          </div>

          {/* Link para criar conta (abre o modal de registro) */}
          <p className="mt-4 text-center text-sm text-kurio-sand">
            {t("auth.noAccount")}{" "}
            <button
              type="button"
              onClick={() => setRegisterOpen(true)}
              className="font-medium text-kurio-copper transition-colors hover:text-kurio-copperLight"
            >
              {t("auth.createAccountLink")}
            </button>
          </p>
        </DialogFooter>
      </DialogContent>

      {/* Modal de criar conta empilhado sobre o login */}
      <RegisterDialog
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        onBackToLogin={() => setRegisterOpen(false)}
      />
    </Dialog>
  )
}