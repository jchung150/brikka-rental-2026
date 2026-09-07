'use server';

import { auth } from '@/auth';
import type { Result } from '@repo/common/types';
import { type Prisma, database } from '@repo/database';

export async function createRequest(
  input: Prisma.RequestUncheckedCreateInput
): Promise<Result<{ id: string }>> {
  const session = await auth();
  if (!session) {
    return {
      ok: false,
      code: 'UNAUTHORIZED',
      message: '로그인이 필요합니다.',
    };
  }

  try {
    // 요청 생성
    const request = await database.request.create({
      data: {
        ...input,
        requesterId: input.requesterId
          ? BigInt(input.requesterId)
          : BigInt(session.user.id),
      },
      select: {
        id: true,
      },
    });

    return {
      ok: true,
      data: { id: request.id.toString() },
    };
  } catch (error) {
    console.error('[createRequest] error:', error);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '요청을 생성하는 중 오류가 발생했습니다.',
    };
  }
}
