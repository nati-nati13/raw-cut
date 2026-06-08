import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const user = auth?.user as any
      const isLoggedIn = !!user
      const path = nextUrl.pathname

      if (path.startsWith('/dashboard/admin')) {
        return isLoggedIn && user.role === 'admin'
      }
      if (path.startsWith('/dashboard/designer')) {
        return isLoggedIn && user.role === 'designer' && user.designerStatus === 'approved'
      }
      if (path.startsWith('/dashboard')) {
        return isLoggedIn
      }
      return true
    },
  },
  providers: [],
} satisfies NextAuthConfig
