import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { connectDB } from './db'
import User from '@/models/User'
import { authConfig } from '@/auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  session: { strategy: 'jwt' },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        await connectDB()
        const user = await User.findOne({ email: credentials.email })
        if (!user || !user.password) return null

        const valid = await bcrypt.compare(credentials.password as string, user.password)
        if (!valid) return null

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          designerStatus: user.status,
          avatar: user.avatar,
          username: user.username,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === 'google' && profile?.email) {
        await connectDB()
        const existing = await User.findOne({ email: profile.email })
        if (!existing) {
          await User.create({
            email: profile.email,
            name: profile.name ?? profile.email,
            role: 'customer',
            status: 'pending',
          })
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (account?.provider === 'google') {
        await connectDB()
        const dbUser = await User.findOne({ email: token.email })
        if (dbUser) {
          token.sub = dbUser._id.toString()
          token.role = dbUser.role
          token.designerStatus = dbUser.status
          token.username = dbUser.username
          token.avatar = dbUser.avatar ?? (token.picture as string)
        }
      } else if (user) {
        token.role = (user as any).role
        token.designerStatus = (user as any).designerStatus
        token.username = (user as any).username
        token.avatar = (user as any).avatar
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.designerStatus = token.designerStatus as string
        session.user.username = token.username as string
        session.user.image = (token.avatar as string) ?? session.user.image
      }
      return session
    },
  },
})

// Extend NextAuth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
      role: string
      designerStatus?: string
      username?: string
    }
  }
}
