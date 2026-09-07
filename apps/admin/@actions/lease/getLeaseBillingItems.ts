'use server';

import { auth } from '@/auth';
import type { Result } from '@repo/common/types';
import { database } from '@repo/database';
import { z } from 'zod';

const getLeaseBillingItemsSchema = z.object({
  leaseId: z.string().min(1, '계약 ID가 필요합니다'),
});

export async function getLeaseBillingItems(
  input: z.infer<typeof getLeaseBillingItemsSchema>
): Promise<Result<LeaseBillingItem[]>> {
  // 1) 입력 검증
  const parsed = getLeaseBillingItemsSchema.safeParse(input);
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
    // 3) 계약의 청구항목 정보 조회
    const lease = await database.lease.findUnique({
      where: { id: BigInt(leaseId) },
      include: {
        BillingSchedules: {
          select: {
            id: true,
            itemName: true,
            amount: true,
            dueDate: true,
            recurrenceType: true,
            recurrencePeriod: true,
            recurrenceEndDate: true,
            isTaxable: true,
            memo: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            dueDate: 'asc',
          },
        },
      },
    });

    if (!lease) {
      return {
        ok: false,
        code: 'NOT_FOUND',
        message: '계약을 찾을 수 없습니다',
      };
    }

    // 4) 청구항목 목록 구성
    const billingItems: LeaseBillingItem[] = lease.BillingSchedules.map(
      (schedule) => {
        // 부가세 계산 (임시로 10% 적용)
        const amount = Number(schedule.amount);
        const vatIncluded = schedule.isTaxable
          ? Math.round(amount * 1.1)
          : amount;

        return {
          id: schedule.id.toString(),
          billingItem: schedule.itemName,
          recurrenceType: schedule.recurrenceType,
          nextBillingDate: schedule.dueDate.toISOString(),
          notificationDays: 5, // 임시로 고정값 설정
          amount: amount,
          vatIncluded: vatIncluded,
          isActive: true, // 임시로 고정값 설정
        };
      }
    );

    return {
      ok: true,
      data: billingItems,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getLeaseBillingItems] error:', error);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '청구항목 정보 조회 중 오류가 발생했습니다',
    };
  }
}

export interface LeaseBillingItem {
  id: string;
  billingItem: string;
  recurrenceType: string;
  nextBillingDate: string;
  notificationDays: number;
  amount: number;
  vatIncluded: number;
  isActive: boolean;
}
