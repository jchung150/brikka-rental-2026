'use server';

import { auth } from '@/auth';
import type { Result } from '@repo/common/types';
import { database } from '@repo/database';
import { z } from 'zod';

const createParkingSpaceSchema = z.object({
  buildingId: z.string().min(1, '건물 ID는 필수입니다'),
  spaceName: z.string().min(1, '주차면 이름은 필수입니다'),
  spaceType: z.enum(['NORMAL', 'COMPACT', 'HANDICAPPED'], {
    required_error: '주차면 유형을 선택해주세요',
  }),
  memo: z.string().optional(),
});

export async function createParkingSpace(
  input: z.infer<typeof createParkingSpaceSchema>
): Promise<Result<{ id: string }>> {
  // 1) 입력 검증
  const parsed = createParkingSpaceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      code: 'VALIDATION_ERROR',
      message: '입력 데이터가 올바르지 않습니다.',
    };
  }

  // 2) 권한 검사
  const session = await auth();
  if (!session?.user) {
    return {
      ok: false,
      code: 'UNAUTHORIZED',
      message: '로그인이 필요합니다.',
    };
  }

  const { buildingId, spaceName, spaceType, memo } = parsed.data;

  try {
    // 3) 건물 존재 여부 확인
    const building = await database.building.findUnique({
      where: { id: BigInt(buildingId) },
      select: { id: true },
    });

    if (!building) {
      return {
        ok: false,
        code: 'NOT_FOUND',
        message: '해당 건물을 찾을 수 없습니다.',
      };
    }

    // 4) 주차면 생성
    const parkingSpace = await database.parkingSpace.create({
      data: {
        buildingId: BigInt(buildingId),
        spaceName,
        spaceType,
        memo: memo || '',
      },
      select: { id: true },
    });

    return {
      ok: true,
      data: { id: parkingSpace.id.toString() },
    };
  } catch (error) {
    console.error('[createParkingSpace] error', error);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '주차면 생성 중 오류가 발생했습니다.',
    };
  }
}
