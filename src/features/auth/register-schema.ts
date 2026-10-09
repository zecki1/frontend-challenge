import { z } from 'zod'

/** Schema compartilhado entre a página /register e o modal de criar conta. */
export const registerSchema = z
  .object({
    name: z.string().min(2, 'Informe um nome com pelo menos 2 caracteres.'),
    email: z.string().min(1, 'Informe o e-mail.').email('E-mail inválido.'),
    password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.'),
    confirmPassword: z.string().min(1, 'Confirme a senha.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não conferem.',
  })

export type RegisterFormValues = z.infer<typeof registerSchema>