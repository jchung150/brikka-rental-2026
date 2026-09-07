'use server';

import { auth } from '@/auth';
import { ERROR_CODES, type Result } from '@repo/common/types';
import { type Prisma, database } from '@repo/database';
import { revalidatePath } from 'next/cache';
import { trackUpdate } from '../lib/change-history';

export async function updateLease(
  id: bigint,
  input: Prisma.LeaseUncheckedUpdateInput
): Promise<Result<{ id: string; updatedAt: Date }>> {
  // 1) 권한 검사
  const session = await auth();
  if (!session?.user) {
    return {
      ok: false,
      code: ERROR_CODES.UNAUTHORIZED,
      message: '로그인이 필요합니다.',
    };
  }

  try {
    // 2) 계약 존재 여부 확인 (전체 데이터 조회)
    const existingLease = await database.lease.findUnique({
      where: { id },
    });

    if (!existingLease) {
      return {
        ok: false,
        code: ERROR_CODES.NOT_FOUND,
        message: '존재하지 않는 임대차 계약입니다.',
      };
    }

    // 3) 계약 정보 업데이트
    const updatedLease = await database.lease.update({
      where: { id },
      data: input,
      select: { id: true, updatedAt: true },
    });

    // 4) 변경 이력 기록
    const afterData = { ...existingLease, ...input };
    await trackUpdate(
      'LEASE',
      id,
      existingLease as Record<string, unknown>,
      afterData as Record<string, unknown>
    );

    // 5) 캐시 무효화
    revalidatePath('/leases');
    revalidatePath(`/leases/${id}`);

    return {
      ok: true,
      data: {
        id: updatedLease.id.toString(),
        updatedAt: updatedLease.updatedAt,
      },
    };
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Server-side logging
    console.error('[updateLease] error:', error);
    return {
      ok: false,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: '계약 정보 수정 중 오류가 발생했습니다.',
    };
  }
}
