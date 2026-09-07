'use server';

import { auth } from '@/auth';
import type { Result } from '@repo/common/types';
import { database } from '@repo/database';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const updateParkingSpaceSchema = z.object({
  id: z.string().min(1, '주차면 ID는 필수입니다'),
  spaceName: z.string().min(1, '주차면 이름은 필수입니다'),
  spaceType: z.enum(['NORMAL', 'COMPACT', 'HANDICAPPED'], {
    required_error: '주차면 유형을 선택해주세요',
  }),
  memo: z.string().optional(),
});

export async function updateParkingSpace(
  input: z.infer<typeof updateParkingSpaceSchema>
): Promise<Result<{ id: string }>> {
  // 1) 입력 검증
  const parsed = updateParkingSpaceSchema.safeParse(input);
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

  const { id, spaceName, spaceType, memo } = parsed.data;

  try {
    // 3) 주차면 존재 여부 확인
    const existingSpace = await database.parkingSpace.findUnique({
      where: { id: BigInt(id) },
      select: { id: true, buildingId: true },
    });

    if (!existingSpace) {
      return {
        ok: false,
        code: 'NOT_FOUND',
        message: '해당 주차면을 찾을 수 없습니다.',
      };
    }

    // 4) 주차면 수정
    const updatedSpace = await database.parkingSpace.update({
      where: { id: BigInt(id) },
      data: {
        spaceName,
        spaceType,
        memo: memo || '',
      },
      select: { id: true, buildingId: true },
    });

    // 5) 캐시 무효화
    revalidatePath(`/buildings/${updatedSpace.buildingId}`);
    revalidatePath('/buildings');

    return {
      ok: true,
      data: { id: updatedSpace.id.toString() },
    };
  } catch (error) {
    console.error('[updateParkingSpace] error', error);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '주차면 수정 중 오류가 발생했습니다.',
    };
  }
}
