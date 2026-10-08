import type { Profile } from '@/api/types'
import { placeholderImage } from './images'

/** Usuário semente com credenciais fictícias usadas nos mocks e nos testes. */
export interface SeedUser {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  password: string
  profile: Omit<Profile, 'id' | 'name' | 'email' | 'avatarUrl'>
}

export const seedUsers: SeedUser[] = [
  {
    id: 'user-1',
    name: 'Colecionadora Ada',
    email: 'collector@example.com',
    avatarUrl: placeholderImage('user-1', 'CA'),
    password: 'password123',
    profile: {
      document: '123.456.789-00',
      phone: '+55 11 90000-0001',
      bio: 'Colecionadora de arte generativa desde 2019.',
    },
  },
  {
    id: 'user-2',
    name: 'Leo Nakamura',
    email: 'leo@example.com',
    avatarUrl: placeholderImage('user-2', 'LN'),
    password: 'senha123',
    profile: {
      document: '987.654.321-00',
      phone: '+55 21 90000-0002',
      bio: 'Investidor em NFTs de utilidade.',
    },
  },
]

export const seedCredentials = seedUsers.map(({ email, password, name }) => ({
  email,
  password,
  name,
}))
