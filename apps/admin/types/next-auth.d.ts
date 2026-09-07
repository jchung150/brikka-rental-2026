import type { UserRole } from '@repo/database';
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    image?: string;
  }

  /**
   * The shape of the account object returned in the OAuth providers' `account` callback,
   * Usually contains information about the provider being used, like OAuth tokens (`access_token`, etc).
   */
  interface Account {}

  /**
   * Returned by `useSession`, `auth`, contains information about the active session.
   */
  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      role: UserRole;
      image?: string;
    };
    accessToken: string;
    error?: string;
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    image?: string;
  }
}
