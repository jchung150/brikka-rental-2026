'use server';

import { auth } from '@/auth';
import type { Result } from '@repo/common/types';
import { type Prisma, database } from '@repo/database';

export async function updateBuildingApplianceFurniture(
  input: Prisma.BuildingApplianceFurnitureUncheckedUpdateInput & { id: string }
): Promise<Result<{ id: string }>> {
  // 권한 검사
  const session = await auth();
  if (!session?.user) {
    return { ok: false, code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' };
  }

  const { id, ...updateData } = input;

  try {
    // 기존 데이터 조회
    const existing = await database.buildingApplianceFurniture.findUnique({
      where: { id: BigInt(id) },
      select: { buildingId: true, unitId: true },
    });

    if (!existing) {
      return {
        ok: false,
        code: 'NOT_FOUND',
        message: '해당 항목을 찾을 수 없습니다.',
      };
    }

    const updated = await database.buildingApplianceFurniture.update({
      where: { id: BigInt(id) },
      data: updateData,
      select: { id: true },
    });

    return { ok: true, data: { id: updated.id.toString() } };
  } catch (e) {
    console.error('[updateApplianceFurniture] error', e);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '처리 중 오류가 발생했습니다.',
    };
  }
}
