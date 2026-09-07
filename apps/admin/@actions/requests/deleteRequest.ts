'use server';

import type { Result } from '@repo/common/types';
import { database } from '@repo/database';
import { revalidatePath } from 'next/cache';

export async function deleteRequest(
  id: string
): Promise<Result<{ id: string }>> {
  try {
    // 요청 존재 확인
    const existingRequest = await database.request.findUnique({
      where: { id: BigInt(id) },
      select: {
        id: true,
        buildingId: true,
      },
    });

    if (!existingRequest) {
      return {
        ok: false,
        code: 'NOT_FOUND',
        message: '요청을 찾을 수 없습니다.',
      };
    }

    // 요청 삭제
    await database.request.delete({
      where: { id: BigInt(id) },
    });

    // 캐시 무효화
    revalidatePath(`/buildings/${Number(existingRequest.buildingId)}`);

    return {
      ok: true,
      data: { id },
    };
  } catch (error) {
    console.error('[deleteRequest] error:', error);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '요청을 삭제하는 중 오류가 발생했습니다.',
    };
  }
}
