'use server';

import { auth } from '@/auth';
import { ERROR_CODES, ERROR_MESSAGES, type Result } from '@repo/common/types';
import { database } from '@repo/database';
import { requireRole } from '../lib/auth';

export async function deleteApplianceFurniture(
  id: string
): Promise<Result<{ id: string }>> {
  // 권한 검사
  const session = await auth();
  if (!session?.user) {
    return { ok: false, code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' };
  }

  try {
    // 기존 데이터 조회
    const existing = await database.applianceFurniture.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existing) {
      return {
        ok: false,
        code: 'NOT_FOUND',
        message: '해당 항목을 찾을 수 없습니다.',
      };
    }

    await database.applianceFurniture.delete({
      where: { id: BigInt(id) },
    });

    return { ok: true, data: { id } };
  } catch (e) {
    console.error('[deleteApplianceFurniture] error', e);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '처리 중 오류가 발생했습니다.',
    };
  }
}

export async function deleteBuildingApplianceFurniture(
  id: number
): Promise<Result<void>> {
  if (!requireRole('ADMIN')) {
    return {
      ok: false,
      code: ERROR_CODES.FORBIDDEN,
      message: ERROR_MESSAGES.FORBIDDEN,
    };
  }

  await database.buildingApplianceFurniture.delete({
    where: { id },
  });

  return {
    ok: true,
    data: undefined,
  };
}
