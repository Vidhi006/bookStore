import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { findOrCreateOAuthUser, OAuthProviderId } from '@/lib/oauthUser';

/**
 * Auth.js is used only as the OAuth broker (Google / Facebook).
 *
 * The rest of the application keeps using its existing `bookhaven_auth` JWT
 * cookie. After Auth.js completes the provider handshake, `/api/auth/oauth-bridge`
 * mints that existing cookie, so password login and every protected API keep
 * working unchanged.
 *
 * Deliberately no database adapter: the app already has one Mongoose User model
 * and no duplicate user/account collections are created.
 */

const AUTH_SECRET =
  process.env.AUTH_SECRET ||
  process.env.JWT_SECRET ||
  'bookhaven_dev_authjs_secret_change_in_production';

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: AUTH_SECRET,
  trustHost: true,
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET || '',
      authorization: {
        params: {
          prompt: 'select_account',
          access_type: 'online',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account || (account.provider !== 'google' && account.provider !== 'facebook')) {
        return false;
      }

      const email = user.email?.trim().toLowerCase();
      if (!email) return '/login?socialError=email_missing';

      if (account.provider === 'google') {
        const verified = (profile as { email_verified?: boolean } | null)?.email_verified;
        if (verified !== true) return '/login?socialError=email_not_verified';
      }

      return true;
    },

    async jwt({ token, user, account }) {
      if (user && account) {
        if (!user.email) {
          throw new Error('OAuth provider did not return an email address.');
        }

        const dbUser = await findOrCreateOAuthUser({
          provider: account.provider as OAuthProviderId,
          providerAccountId: account.providerAccountId,
          email: user.email,
          name: user.name,
          image: user.image,
        });

        token.userId = dbUser._id.toString();
        token.role = dbUser.role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.userId as string | undefined) || token.sub || '';
        session.user.role =
          (token.role as 'admin' | 'customer' | undefined) || 'customer';
      }
      return session;
    },
  },
});
