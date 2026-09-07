'use server';

import { auth } from '@/auth';
import type { Result } from '@repo/common/types';
import { database } from '@repo/database';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const updateLeaseStatusSchema = z.object({
  leaseId: z.string().min(1, '계약 ID가 필요합니다'),
  status: z.enum(['PREPARING', 'ACTIVE', 'COMPLETED', 'TERMINATED'], {
    errorMap: () => ({ message: '유효하지 않은 상태입니다' }),
  }),
});

export async function updateLeaseStatus(
  input: z.infer<typeof updateLeaseStatusSchema>
): Promise<Result<{ id: string; status: string }>> {
  // 1) 입력 검증
  const parsed = updateLeaseStatusSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      code: 'VALIDATION_ERROR',
      message: parsed.error.errors[0]?.message || '입력 오류가 발생했습니다',
    };
  }

  // 2) 권한 검사
  const session = await auth();
  if (!session?.user) {
    return {
      ok: false,
      code: 'UNAUTHORIZED',
      message: '로그인이 필요합니다',
    };
  }

  const { leaseId, status } = parsed.data;

  try {
    // 3) 계약 존재 여부 확인
    const existingLease = await database.lease.findUnique({
      where: { id: BigInt(leaseId) },
      select: { id: true, status: true },
    });

    if (!existingLease) {
      return {
        ok: false,
        code: 'NOT_FOUND',
        message: '계약을 찾을 수 없습니다',
      };
    }

    // 4) 상태 업데이트
    const updatedLease = await database.lease.update({
      where: { id: BigInt(leaseId) },
      data: { status },
      select: { id: true, status: true },
    });

    // 5) 캐시 무효화
    revalidatePath('/leases');
    revalidatePath(`/leases/${leaseId}`);

    return {
      ok: true,
      data: {
        id: updatedLease.id.toString(),
        status: updatedLease.status,
      },
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[updateLeaseStatus] error:', error);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '상태 변경 중 오류가 발생했습니다',
    };
  }
}
