'use server';

import { auth } from '@/auth';
import type { Paged, Result } from '@repo/common/types';
import { Prisma, database } from '@repo/database';

export interface ListBillsInput {
  leaseId?: number;
  buildingId?: number;
  status?: string;
  leaseStatus?: string;
  page?: number;
  limit?: number;
}

const billListItemInclude = Prisma.validator<Prisma.BillInclude>()({
  Lease: {
    include: {
      Unit: {
        select: {
          id: true,
          unitNumber: true,
          Building: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      LeaseTenants: {
        include: {
          Tenant: true,
        },
      },
    },
  },
  Payments: {
    select: {
      id: true,
      amountPaid: true,
      paymentDate: true,
      paymentMethod: true,
    },
  },
  LeaseBillingSchedule: true,
});

export type BillListItem = Prisma.BillGetPayload<{
  include: typeof billListItemInclude;
}>;

export async function listBills(
  input: ListBillsInput
): Promise<Result<Paged<BillListItem>>> {
  try {
    // 권한 검사
    const session = await auth();
    if (!session?.user) {
      return {
        ok: false,
        code: 'UNAUTHORIZED',
        message: '로그인이 필요합니다.',
      };
    }

    const {
      leaseId,
      buildingId,
      status,
      leaseStatus,
      page = 1,
      limit = 20,
    } = input;
    const skip = (page - 1) * limit;

    // where 조건 동적 생성
    const whereConditions: Prisma.BillWhereInput = {};

    if (leaseId != null) {
      whereConditions.leaseId = BigInt(leaseId);
    }

    const leaseWhere: Prisma.LeaseWhereInput = {};

    if (buildingId != null) {
      leaseWhere.Unit = {
        buildingId: BigInt(buildingId),
      };
    }

    if (leaseStatus != null) {
      leaseWhere.status = leaseStatus as any;
    }

    if (Object.keys(leaseWhere).length > 0) {
      whereConditions.Lease = leaseWhere;
    }

    if (status != null) {
      whereConditions.status = status as any;
    }

    // 청구서 목록 조회
    const bills = await database.bill.findMany({
      where: whereConditions,
      include: billListItemInclude,
      orderBy: {
        issueDate: 'desc',
      },
      skip,
      take: limit,
    });

    const total = await database.bill.count({ where: whereConditions });

    const lastPage = Math.ceil(total / limit);

    return {
      ok: true,
      data: {
        items: bills,
        page,
        limit,
        total,
        lastPage: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('[listBills] error:', error);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '청구서 목록을 조회하는 중 오류가 발생했습니다.',
    };
  }
}
