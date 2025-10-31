
import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';

export const runtime = 'edge'; // Add this line

if (!process.env.GITHUB_ID || !process.env.GITHUB_SECRET) {
  throw new Error('GITHUB_ID and GITHUB_SECRET environment variables are not set.');
}

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
