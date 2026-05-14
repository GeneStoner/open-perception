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
      const username = (profile as { login?: string }).login ?? '';
      return isAllowed(username);
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
