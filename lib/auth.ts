import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { supabase } from '@/lib/supabase'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const email = user.email
      if (!email) return false

      const { data, error } = await supabase
        .from('allowed_emails')
        .select('is_admin')
        .eq('email', email)
        .single()

      if (!data) return '/403'

      return true
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const { data } = await supabase
          .from('allowed_emails')
          .select('is_admin')
          .eq('email', user.email)
          .single()

        token.isAdmin = data?.is_admin ?? false
      }
      return token
    },
    async session({ session, token }) {
      session.isAdmin = token.isAdmin as boolean
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/403',
  },
})
