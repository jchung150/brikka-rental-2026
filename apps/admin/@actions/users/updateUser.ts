'use server';

import type { Result } from '@repo/common/types';
import { type Prisma, database } from '@repo/database';

export async function updateUser(
  id: bigint,
  input: Prisma.UserUncheckedUpdateInput
): Promise<Result<{ id: string; updatedAt: string }>> {
  // 8) 사용자 정보 업데이트
  const updatedUser = await database.user.update({
    where: {
      id,
    },
    data: input,
    select: { id: true, updatedAt: true },
  });

  return {
    ok: true,
    data: {
      id: updatedUser.id.toString(),
      updatedAt: updatedUser.updatedAt.toISOString(),
    },
  };
}
