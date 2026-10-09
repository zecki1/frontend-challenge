import { createFileRoute } from '@tanstack/react-router'
import { LoginDialog } from '@/components/auth/login-dialog'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  return (
    <section className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-16">
      <LoginDialog defaultOpen />
    </section>
  )
}