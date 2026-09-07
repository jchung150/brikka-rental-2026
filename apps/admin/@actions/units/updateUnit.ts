'use server';

import type { Result } from '@repo/common/types';
import { type Prisma, database } from '@repo/database';
import { trackUpdate } from '../lib/change-history';

export async function updateUnit(
  id: bigint,
  input: Prisma.UnitUncheckedUpdateInput
): Promise<Result<{ id: string }>> {
  try {
    // 업데이트 전 기존 데이터 조회
    const existingUnit = await database.unit.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existingUnit) {
      return {
        ok: false,
        code: 'NOT_FOUND',
        message: '유닛을 찾을 수 없습니다.',
      };
    }

    // 유닛 업데이트
    const unit = await database.unit.update({
      where: { id: BigInt(id) },
      data: input,
      select: {
        id: true,
        buildingId: true,
      },
    });

    // 변경 이력 기록
    const afterData = { ...existingUnit, ...input };
    await trackUpdate(
      'UNIT',
      id,
      existingUnit as Record<string, unknown>,
      afterData as Record<string, unknown>
    );

    return {
      ok: true,
      data: { id: unit.id.toString() },
    };
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Server-side logging
    console.error('[updateUnit] error:', error);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '유닛을 수정하는 중 오류가 발생했습니다.',
    };
  }
}
