'use server';

import { auth } from '@/auth';
import type { Result } from '@repo/common/types';
import { database } from '@repo/database';
import { z } from 'zod';

const getLeaseLedgerSchema = z.object({
  leaseId: z.string().min(1, '계약 ID가 필요합니다'),
  filterType: z.enum(['ALL', 'RECEIPT', 'BILLING']).optional().default('ALL'),
});

export async function getLeaseLedger(
  input: z.infer<typeof getLeaseLedgerSchema>
): Promise<Result<LeaseLedgerTransaction[]>> {
  // 1) 입력 검증
  const parsed = getLeaseLedgerSchema.safeParse(input);
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

  const { leaseId, filterType } = parsed.data;

  try {
    // 3) 계약의 원장 정보 조회
    const lease = await database.lease.findUnique({
      where: { id: BigInt(leaseId) },
      include: {
        Bills: {
          select: {
            id: true,
            issueDate: true,
            dueDate: true,
            totalAmount: true,
            status: true,
            Payments: {
              select: {
                id: true,
                amountPaid: true,
                paymentDate: true,
                paymentMethod: true,
              },
            },
          },
          orderBy: {
            issueDate: 'desc',
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

    // 4) 원장 거래 내역 구성 (잔액 계산 포함)
    let runningBalance = 0;
    const ledgerTransactions: LeaseLedgerTransaction[] = [];

    // 청구서와 수납 내역을 시간순으로 정렬하여 원장 구성
    const allTransactions: Array<{
      id: string;
      date: Date;
      type: 'BILLING' | 'RECEIPT';
      amount: number;
      description: string;
      referenceNumber: string;
    }> = [];

    // 청구서를 거래 내역에 추가
    lease.Bills.forEach((bill) => {
      allTransactions.push({
        id: `bill-${bill.id}`,
        date: bill.issueDate,
        type: 'BILLING',
        amount: Number(bill.totalAmount),
        description: '청구서',
        referenceNumber: bill.id.toString(),
      });

      // 수납 내역을 거래 내역에 추가
      bill.Payments.forEach((payment) => {
        allTransactions.push({
          id: `payment-${payment.id}`,
          date: payment.paymentDate,
          type: 'RECEIPT',
          amount: Number(payment.amountPaid),
          description: '수납',
          referenceNumber: payment.id.toString(),
        });
      });
    });

    // 날짜순으로 정렬
    allTransactions.sort((a, b) => a.date.getTime() - b.date.getTime());

    // 필터링 적용
    let filteredTransactions = allTransactions;
    if (filterType === 'RECEIPT') {
      filteredTransactions = allTransactions.filter(
        (t) => t.type === 'RECEIPT'
      );
    } else if (filterType === 'BILLING') {
      filteredTransactions = allTransactions.filter(
        (t) => t.type === 'BILLING'
      );
    }

    // 원장 거래 내역 구성
    filteredTransactions.forEach((transaction) => {
      // 거래 유형에 따라 잔액 계산
      if (transaction.type === 'RECEIPT') {
        runningBalance += transaction.amount;
      } else if (transaction.type === 'BILLING') {
        runningBalance -= transaction.amount;
      }

      ledgerTransactions.push({
        id: transaction.id,
        date: transaction.date.toISOString(),
        transactionType: transaction.type,
        billingItem: transaction.description,
        referenceNumber: transaction.referenceNumber,
        increase: transaction.type === 'RECEIPT' ? transaction.amount : 0,
        decrease: transaction.type === 'BILLING' ? transaction.amount : 0,
        balance: runningBalance,
      });
    });

    return {
      ok: true,
      data: ledgerTransactions,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getLeaseLedger] error:', error);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '원장 정보 조회 중 오류가 발생했습니다',
    };
  }
}

export interface LeaseLedgerTransaction {
  id: string;
  date: string;
  transactionType: 'RECEIPT' | 'BILLING';
  billingItem: string;
  referenceNumber: string;
  increase: number;
  decrease: number;
  balance: number;
}
