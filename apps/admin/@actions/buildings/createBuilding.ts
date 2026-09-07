'use server';

import { ERROR_CODES, ERROR_MESSAGES, type Result } from '@repo/common/types';
import { type Prisma, database } from '@repo/database';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireRole } from '../lib/auth';
import { trackCreate } from '../lib/change-history';
import { addLog } from '../log/addLog';

const createBuildingValidSchema = z.object({
  name: z
    .string()
    .min(1, '건물명은 필수입니다')
    .max(255, '건물명은 255자 이하여야 합니다'),
  address: z.string().min(1, '주소는 필수입니다'),
});

export async function createBuilding(
  input: Prisma.BuildingUncheckedCreateInput
): Promise<Result<{ id: string }>> {
  if (!requireRole('ADMIN')) {
    return {
      ok: false,
      code: ERROR_CODES.FORBIDDEN,
      message: ERROR_MESSAGES.FORBIDDEN,
    };
  }

  // 1) 입력 검증
  const parsed = createBuildingValidSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: ERROR_MESSAGES.VALIDATION_ERROR + parsed.error.message,
    };
  }

  try {
    // 2) 건물명 중복 확인 (같은 주소에 같은 이름의 건물이 있는지)
    const existingBuilding = await database.building.findFirst({
      where: {
        name: input.name,
        address: input.address,
      },
      select: { id: true },
    });

    if (existingBuilding) {
      return {
        ok: false,
        code: ERROR_CODES.CONFLICT,
        message: '같은 주소에 같은 이름의 건물이 이미 존재합니다.',
      };
    }

    // 4) 건물 생성
    const building = await database.building.create({
      data: input,
      select: { id: true },
    });

    // 5) 변경 이력 기록
    await trackCreate(
      'BUILDING',
      building.id,
      input as Record<string, unknown>
    );

    await addLog('BuildingsCreate', { id: building.id });
    revalidatePath('/admin/buildings');
    return { ok: true, data: { id: building.id.toString() } };
  } catch (e) {
    // biome-ignore lint/suspicious/noConsole: Server-side logging
    console.error('[createBuilding] error', e);
    return {
      ok: false,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: '건물 생성 중 오류가 발생했습니다.',
    };
  }
}
