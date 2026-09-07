'use server';

import type { Result } from '@repo/common/types';
import { Prisma, database } from '@repo/database';

// 요청 목록 아이템 타입
const requestListItemInclude = Prisma.validator<Prisma.RequestInclude>()({
  Requester: {
    select: {
      id: true,
      name: true,
    },
  },
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
  Lease: {
    select: {
      id: true,
      LeaseTenants: {
        select: {
          Tenant: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        where: {
          isRepresentative: true,
        },
      },
    },
  },
});

export type DashboardRequestItem = Prisma.RequestGetPayload<{
  include: typeof requestListItemInclude;
}>;

// 미납금 현황 아이템 타입
const unpaidBillInclude = Prisma.validator<Prisma.BillInclude>()({
  Lease: {
    select: {
      id: true,
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
        select: {
          Tenant: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        where: {
          isRepresentative: true,
        },
      },
    },
  },
  Payments: {
    select: {
      amountPaid: true,
    },
  },
});

export type DashboardUnpaidBillItem = Prisma.BillGetPayload<{
  include: typeof unpaidBillInclude;
}>;

// 만료 예정 계약 아이템 타입
const expiringLeaseInclude = Prisma.validator<Prisma.LeaseInclude>()({
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
    select: {
      Tenant: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    where: {
      isRepresentative: true,
    },
  },
});

export type DashboardExpiringLeaseItem = Prisma.LeaseGetPayload<{
  include: typeof expiringLeaseInclude;
}>;

export interface DashboardData {
  requests: DashboardRequestItem[];
  unpaidBills: DashboardUnpaidBillItem[];
  unpaidBillsCount: number;
  expiringLeases: DashboardExpiringLeaseItem[];
}

export async function getDashboardData(): Promise<Result<DashboardData>> {
  try {
    // 1. 최근 요청 목록 5개 조회 (모든 상태, 최신순)
    const requests = await database.request.findMany({
      include: requestListItemInclude,
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    // 2. 미납금 현황 조회 (UNPAID 또는 OVERDUE 상태, 미납액 큰 순)
    const unpaidBills = await database.bill.findMany({
      where: {
        status: {
          in: ['UNPAID', 'OVERDUE'],
        },
      },
      include: unpaidBillInclude,
      orderBy: {
        totalAmount: 'desc',
      },
      take: 5,
    });

    // 3. 미납금 총 건수
    const unpaidBillsCount = await database.bill.count({
      where: {
        status: {
          in: ['UNPAID', 'OVERDUE'],
        },
      },
    });

    // 4. 만료 예정 계약 5개 조회 (ACTIVE 상태, 종료일 가까운 순)
    const expiringLeases = await database.lease.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          gte: new Date(), // 만료되지 않은 계약만
        },
      },
      include: expiringLeaseInclude,
      orderBy: {
        endDate: 'asc',
      },
      take: 5,
    });

    return {
      ok: true,
      data: {
        requests,
        unpaidBills,
        unpaidBillsCount,
        expiringLeases,
      },
    };
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Server-side logging
    console.error('[getDashboardData] error:', error);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '대시보드 데이터를 조회하는 중 오류가 발생했습니다.',
    };
  }
}
