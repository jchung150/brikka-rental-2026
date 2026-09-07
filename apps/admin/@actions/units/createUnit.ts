'use server';

import type { Result } from '@repo/common/types';
import { type Prisma, database } from '@repo/database';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { trackCreate } from '../lib/change-history';

const createUnitSchema = z.object({
  buildingId: z.number(),
  name: z.string().optional(),
  unitType: z.string().optional(),
  floor: z.number().optional(),
  unitNumber: z.string().min(1, '호수는 필수입니다'),
  supplyAreaSqm: z.number().optional(),
  exclusiveAreaSqm: z.number().optional(),
  serviceAreaSqm: z.number().optional(),
  roomCount: z.number().optional(),
  bathroomCount: z.number().optional(),
  bedroomDirection: z.string().optional(),
  status: z.enum(['VACANT', 'OCCUPIED']).default('VACANT'),
  depositAmount: z.number().optional(),
  rentAmount: z.number().optional(),
});

export async function createUnit(
  input: Prisma.UnitUncheckedCreateInput
): Promise<Result<{ id: string }>> {
  try {
    // 입력 검증
    const parsed = createUnitSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        code: 'VALIDATION_ERROR',
        message: '입력 데이터가 올바르지 않습니다.',
      };
    }

    const { buildingId, unitNumber } = parsed.data;

    // 중복 호수 확인
    const existingUnit = await database.unit.findFirst({
      where: {
        buildingId: BigInt(buildingId),
        unitNumber,
      },
    });

    if (existingUnit) {
      return {
        ok: false,
        code: 'CONFLICT',
        message: '이미 존재하는 호수입니다.',
      };
    }

    // 유닛 생성
    const unit = await database.unit.create({
      data: {
        ...input,
        buildingId: BigInt(buildingId),
        supplyAreaSqm: input.supplyAreaSqm ? Number(input.supplyAreaSqm) : null,
        exclusiveAreaSqm: input.exclusiveAreaSqm
          ? Number(input.exclusiveAreaSqm)
          : null,
        serviceAreaSqm: input.serviceAreaSqm
          ? Number(input.serviceAreaSqm)
          : null,
        depositAmount: input.depositAmount ? Number(input.depositAmount) : null,
        rentAmount: input.rentAmount ? Number(input.rentAmount) : null,
      },
      select: {
        id: true,
      },
    });

    // 변경 이력 기록
    await trackCreate('UNIT', unit.id, input as Record<string, unknown>);

    // 캐시 무효화
    revalidatePath(`/buildings/${buildingId}`);

    return {
      ok: true,
      data: { id: unit.id.toString() },
    };
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Server-side logging
    console.error('[createUnit] error:', error);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '유닛을 생성하는 중 오류가 발생했습니다.',
    };
  }
}
