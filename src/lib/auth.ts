import { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña son requeridos')
        }

        // Try broker first
        const broker = await prisma.broker.findUnique({
          where: { email: credentials.email },
        })

        if (broker) {
          const passwordMatch = await bcrypt.compare(credentials.password, broker.password)
          if (!passwordMatch) throw new Error('Contraseña incorrecta')
          return {
            id: broker.id,
            name: broker.nombre,
            email: broker.email,
            role: 'BROKER' as const,
          }
        }

        // Try insurer user
        const insurerUser = await prisma.insurerUser.findUnique({
          where: { email: credentials.email },
        })

        if (insurerUser) {
          const passwordMatch = await bcrypt.compare(credentials.password, insurerUser.password)
          if (!passwordMatch) throw new Error('Contraseña incorrecta')
          return {
            id: insurerUser.id,
            name: insurerUser.nombre,
            email: insurerUser.email,
            role: 'ASEGURADORA' as const,
            insurerId: insurerUser.insurerId,
          }
        }

        throw new Error('Usuario no encontrado')
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.role = (user as any).role
        token.insurerId = (user as any).insurerId
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.name = token.name
        session.user.email = token.email
        session.user.role = token.role
        session.user.insurerId = token.insurerId
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
}
