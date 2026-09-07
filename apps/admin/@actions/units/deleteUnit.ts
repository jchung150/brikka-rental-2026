'use server';

import type { Result } from '@repo/common/types';
import { database } from '@repo/database';
import { revalidatePath } from 'next/cache';
import { trackDelete } from '../lib/change-history';

export async function deleteUnit(id: string): Promise<Result<{ id: string }>> {
  try {
    // 유닛 존재 확인
    const existingUnit = await database.unit.findUnique({
      where: { id: BigInt(id) },
      include: {
        Leases: {
          where: {
            status: 'ACTIVE',
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!existingUnit) {
      return {
        ok: false,
        code: 'NOT_FOUND',
        message: '유닛을 찾을 수 없습니다.',
      };
    }

    // 활성 임대차 계약이 있는지 확인
    if (existingUnit.Leases.length > 0) {
      return {
        ok: false,
        code: 'CONFLICT',
        message: '활성 임대차 계약이 있는 유닛은 삭제할 수 없습니다.',
      };
    }

    // 유닛 삭제
    await database.unit.delete({
      where: { id: BigInt(id) },
    });

    // 변경 이력 기록
    const { Leases, ...unitData } = existingUnit;
    await trackDelete('UNIT', BigInt(id), unitData as Record<string, unknown>);

    // 캐시 무효화
    revalidatePath(`/buildings/${Number(existingUnit.buildingId)}`);

    return {
      ok: true,
      data: { id },
    };
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Server-side logging
    console.error('[deleteUnit] error:', error);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '유닛을 삭제하는 중 오류가 발생했습니다.',
    };
  }
}
