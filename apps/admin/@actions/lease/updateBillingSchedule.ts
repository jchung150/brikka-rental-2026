'use server';

import { auth } from '@/auth';
import type { Result } from '@repo/common/types';
import { type RecurrenceType, database } from '@repo/database';
import { z } from 'zod';

const updateBillingScheduleSchema = z.object({
  id: z.string().min(1, '청구 스케줄 ID가 필요합니다'),
  itemName: z.string().min(1, '청구항목을 입력해주세요'),
  recurrenceType: z.string().optional(),
  amount: z.number().min(0, '청구액은 0 이상이어야 합니다'),
  dueDate: z.string().min(1, '청구일을 선택해주세요'),
  notificationDays: z.number().min(1).max(30).default(5),
  isTaxable: z.boolean().default(false),
  memo: z.string().optional(),
});

export async function updateBillingSchedule(
  input: z.infer<typeof updateBillingScheduleSchema>
): Promise<Result<{ id: string }>> {
  // 1) 입력 검증
  const parsed = updateBillingScheduleSchema.safeParse(input);
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

  const {
    id,
    itemName,
    recurrenceType,
    amount,
    dueDate,
    notificationDays,
    isTaxable,
    memo,
  } = parsed.data;

  try {
    // 3) 청구 스케줄 존재 여부 확인
    const existingSchedule = await database.leaseBillingSchedule.findUnique({
      where: { id: BigInt(id) },
      select: { id: true, leaseId: true },
    });

    if (!existingSchedule) {
      return {
        ok: false,
        code: 'NOT_FOUND',
        message: '청구 스케줄을 찾을 수 없습니다',
      };
    }

    // 4) 청구 스케줄 업데이트
    const updatedSchedule = await database.leaseBillingSchedule.update({
      where: { id: BigInt(id) },
      data: {
        itemName,
        recurrenceType: recurrenceType as RecurrenceType,
        amount,
        dueDate,
        notificationDays,
        isTaxable,
        memo,
      },
      select: { id: true, leaseId: true },
    });

    return {
      ok: true,
      data: { id: updatedSchedule.id.toString() },
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[updateBillingSchedule] error:', error);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '청구 스케줄 수정 중 오류가 발생했습니다',
    };
  }
}
