'use server';

import { auth } from '@/auth';
import type { Result } from '@repo/common/types';
import { database } from '@repo/database';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const deleteParkingSpaceSchema = z.object({
  id: z.string().min(1, '주차면 ID는 필수입니다'),
});

export async function deleteParkingSpace(
  input: z.infer<typeof deleteParkingSpaceSchema>
): Promise<Result<{ success: boolean }>> {
  // 1) 입력 검증
  const parsed = deleteParkingSpaceSchema.safeParse(input);
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

  const { id } = parsed.data;

  try {
    // 3) 주차면 존재 여부 확인
    const existingSpace = await database.parkingSpace.findUnique({
      where: { id: BigInt(id) },
      select: { id: true, buildingId: true, LeaseVehicle: true },
    });

    if (!existingSpace) {
      return {
        ok: false,
        code: 'NOT_FOUND',
        message: '해당 주차면을 찾을 수 없습니다.',
      };
    }

    // 4) 사용 중인 주차면인지 확인
    if (existingSpace.LeaseVehicle) {
      return {
        ok: false,
        code: 'CONFLICT',
        message: '사용 중인 주차면은 삭제할 수 없습니다.',
      };
    }

    // 5) 주차면 삭제
    await database.parkingSpace.delete({
      where: { id: BigInt(id) },
    });

    // 6) 캐시 무효화
    revalidatePath(`/buildings/${existingSpace.buildingId}`);
    revalidatePath('/buildings');

    return {
      ok: true,
      data: { success: true },
    };
  } catch (error) {
    console.error('[deleteParkingSpace] error', error);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '주차면 삭제 중 오류가 발생했습니다.',
    };
  }
}
