'use server';

import { auth } from '@/auth';
import type { Result } from '@repo/common/types';
import { database } from '@repo/database';
import { z } from 'zod';

const getLeaseMessagesSchema = z.object({
  leaseId: z.string().min(1, '계약 ID가 필요합니다'),
});

export async function getLeaseMessages(
  input: z.infer<typeof getLeaseMessagesSchema>
): Promise<Result<LeaseMessage[]>> {
  // 1) 입력 검증
  const parsed = getLeaseMessagesSchema.safeParse(input);
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

  const { leaseId } = parsed.data;

  try {
    // 3) 계약 존재 여부 확인
    const lease = await database.lease.findUnique({
      where: { id: BigInt(leaseId) },
      select: { id: true },
    });

    if (!lease) {
      return {
        ok: false,
        code: 'NOT_FOUND',
        message: '계약을 찾을 수 없습니다',
      };
    }

    // 4) 메시지 이력 구성 (임시로 빈 배열 반환)
    // 실제로는 Message 모델이 구현되면 해당 모델을 사용
    const messages: LeaseMessage[] = [];

    return {
      ok: true,
      data: messages,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getLeaseMessages] error:', error);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '메시지 이력 조회 중 오류가 발생했습니다',
    };
  }
}

export interface LeaseMessage {
  id: string;
  sentAt: string;
  channel: 'EMAIL' | 'SMS' | 'ALIMTALK' | 'PUSH';
  title: string;
  recipient: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  sendMethod: 'AUTOMATIC' | 'MANUAL';
  sender: string;
  content: string;
}
