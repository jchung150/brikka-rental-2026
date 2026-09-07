'use server';

import { ERROR_CODES, ERROR_MESSAGES, type Result } from '@repo/common/types';
import { type Prisma, database } from '@repo/database';
import { requireRole } from '../lib/auth';
import { trackUpdate } from '../lib/change-history';

export async function updateBuilding(
  id: bigint,
  input: Prisma.BuildingUncheckedUpdateInput
): Promise<Result<{ id: string; updatedAt: string }>> {
  if (!requireRole('ADMIN')) {
    return {
      ok: false,
      code: ERROR_CODES.FORBIDDEN,
      message: ERROR_MESSAGES.FORBIDDEN,
    };
  }

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

    await database.buildingOwnership.deleteMany({
      where: {
        buildingId: id,
      },
    });

    // 7) 건물 정보 업데이트
    const updatedBuilding = await database.building.update({
      where: {
        id: id,
      },
      data: input,
      select: { id: true, updatedAt: true },
    });

    // 8) 변경 이력 기록
    const afterData = { ...existingBuilding, ...input };
    await trackUpdate(
      'BUILDING',
      id,
      existingBuilding as Record<string, unknown>,
      afterData as Record<string, unknown>
    );

    return {
      ok: true,
      data: {
        id: updatedBuilding.id.toString(),
        updatedAt: updatedBuilding.updatedAt.toISOString(),
      },
    };
  } catch (e) {
    // biome-ignore lint/suspicious/noConsole: Server-side logging
    console.error('[updateBuilding] error', e);

    // Prisma 에러 처리
    if (
      e instanceof Error &&
      e.message.includes('Record to update not found')
    ) {
      return {
        ok: false,
        code: ERROR_CODES.CONFLICT,
        message:
          '다른 사용자가 이미 수정했습니다. 페이지를 새로고침하고 다시 시도해주세요.',
      };
    }

    return {
      ok: false,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: '건물 정보 수정 중 오류가 발생했습니다.',
    };
  }
}
