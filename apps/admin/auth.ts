import type { UserRole } from '@repo/database';
import NextAuth, { type NextAuthResult, type User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const result = NextAuth({
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      credentials: {
        email: { label: 'email', type: 'text' },
        password: { label: 'password', type: 'password' },
        userId: { label: 'userId', type: 'text' },
        userName: { label: 'userName', type: 'text' },
        userRole: { label: 'userRole', type: 'text' },
        userProfile: { label: 'userProfile', type: 'text' },
      },
      authorize(credentials) {
        if (!credentials) {
          return null;
        }
        const { email, userId, userName, userRole, userProfile } = credentials;

        return {
          id: userId as string,
          email: email as string,
          name: userName as string,
          role: userRole as UserRole,
          image: userProfile as string,
        } satisfies User;
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    jwt({ token, user, trigger, session }) {
      // 초기 로그인 시
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.name = user.name as string;
        token.email = user.email as string;
        token.image = user.image as string;
      }

      // 세션 업데이트 시 (update 함수 호출 시)
      if (trigger === 'update' && session) {
        if (session.name) token.name = session.name;
        if (session.email) token.email = session.email;
        if (session.image) token.image = session.image;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.image as string;
      }
      return session;
    },
    authorized({ request, auth }) {
      return !!auth?.user;
    },
  },
});

export const handlers: NextAuthResult['handlers'] = result.handlers;
export const auth: NextAuthResult['auth'] = result.auth;
export const signIn: NextAuthResult['signIn'] = result.signIn;
export const signOut: NextAuthResult['signOut'] = result.signOut;
