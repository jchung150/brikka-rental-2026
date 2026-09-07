'use server';

import { ERROR_CODES, ERROR_MESSAGES, type Result } from '@repo/common/types';
import { database } from '@repo/database';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireRole } from '../lib/auth';
import { trackDelete } from '../lib/change-history';

const Input = z.object({
  id: z.string().min(1, '건물 ID는 필수입니다'),
});

export async function deleteBuilding(
  input: unknown
): Promise<Result<{ id: string }>> {
  if (!requireRole('ADMIN')) {
    return {
      ok: false,
      code: ERROR_CODES.FORBIDDEN,
      message: ERROR_MESSAGES.FORBIDDEN,
    };
  }

  // 1) 입력 검증
  const parsed = Input.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: ERROR_MESSAGES.VALIDATION_ERROR,
    };
  }

  const { id } = parsed.data;

  try {
    // 2) 건물 존재 확인 (전체 데이터 조회)
    const existingBuilding = await database.building.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existingBuilding) {
      return {
        ok: false,
        code: ERROR_CODES.NOT_FOUND,
        message: '존재하지 않는 건물입니다.',
      };
    }

    // 3) 건물 삭제 (cascade로 관련 데이터 자동 삭제)
    await database.building.delete({
      where: { id: BigInt(id) },
    });

    // 4) 변경 이력 기록
    await trackDelete(
      'BUILDING',
      BigInt(id),
      existingBuilding as Record<string, unknown>
    );

    // 5) 캐시 무효화 & 반환
    revalidatePath('/admin/buildings');

    return {
      ok: true,
      data: { id },
    };
  } catch (e) {
    // biome-ignore lint/suspicious/noConsole: Server-side logging
    console.error('[deleteBuilding] error', e);

    // Prisma 에러 처리
    if (
      e instanceof Error &&
      e.message.includes('Record to delete does not exist')
    ) {
      return {
        ok: false,
        code: ERROR_CODES.NOT_FOUND,
        message: '존재하지 않는 건물입니다.',
      };
    }

    return {
      ok: false,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: '건물 및 관련 데이터 삭제 중 오류가 발생했습니다.',
    };
  }
}
