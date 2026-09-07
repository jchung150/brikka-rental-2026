'use server';

import type { Result } from '@repo/common/types';
import { type Prisma, database } from '@repo/database';

export async function updateRequest(
  id: bigint,
  input: Prisma.RequestUncheckedUpdateInput
): Promise<Result<void>> {
  try {
    // 요청 업데이트
    const request = await database.request.update({
      where: { id },
      data: input,
      select: {
        id: true,
        buildingId: true,
      },
    });

    return {
      ok: true,
      data: undefined,
    };
  } catch (error) {
    console.error('[updateRequest] error:', error);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '요청을 수정하는 중 오류가 발생했습니다.',
    };
  }
}
