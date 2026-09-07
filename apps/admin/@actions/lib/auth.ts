import { auth } from '@/auth';
import type { UserRole } from '@repo/database';

export async function requireRole(role: UserRole) {
  const session = await auth();

  const currentRole = session?.user?.role;

  if (!currentRole) {
    return false;
  }

  if (currentRole === 'ADMIN') {
    return true;
  }

  return currentRole === role;
}

export async function getUserId() {
  const session = await auth();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session?.user?.id;
}
