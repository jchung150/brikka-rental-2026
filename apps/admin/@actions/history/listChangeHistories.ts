'use server';
import { type Prisma, database } from '@repo/database';
import { requireRole } from '../lib/auth';

const changeHistoryInclude = {
  User: {
    select: { id: true, name: true, email: true },
  },
};

export type ChangeHistoryEntity = Prisma.ChangeHistoryGetPayload<{
  include: typeof changeHistoryInclude;
}>;

export async function listChangeHistories(): Promise<ChangeHistoryEntity[]> {
  await requireRole('MANAGER');

  const histories = await database.changeHistory.findMany({
    include: changeHistoryInclude,
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return histories;
}
