import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import { isAllowed } from '@/lib/collaborators';

const handler = NextAuth({
  providers: [
    GitHubProvider({
      clientId:     process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      // Temporarily log to diagnose allowlist issue
      const username = (profile as { login?: string }).login ?? '';
      console.log('GitHub signIn profile login:', username);
      return true; // allow all for now
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as { login?: string }).login = token.login as string;
      }
      return session;
    },
    async jwt({ token, profile }) {
      if (profile) {
        token.login = (profile as { login?: string }).login;
      }
      return token;
    },
  },
  pages: {
    signIn:  '/collaborators/signin',
    error:   '/collaborators/signin',
  },
});

export { handler as GET, handler as POST };
