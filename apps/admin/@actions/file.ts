'use server';

import { auth } from '@/auth';
import { type Prisma, database } from '@repo/database';

export async function createFile(input: Prisma.FileUncheckedCreateInput) {
  const session = await auth();
  if (!session) {
    throw new Error('Unauthorized');
  }
  const file = await database.file.create({
    data: {
      ...input,
      uploaderId: session.user?.id ? Number.parseInt(session.user.id) : null,
    },
  });
  return file;
}
