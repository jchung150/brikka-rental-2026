'use server';

import { auth } from '@/auth';
import type { Result } from '@repo/common/types';
import { Prisma, database } from '@repo/database';

const leaseDetailInclude = Prisma.validator<Prisma.LeaseInclude>()({
  Unit: {
    include: {
      Building: {
        include: {
          Manager: true,
          Ownerships: {
            include: {
              Landlord: true,
            },
          },
        },
      },
    },
  },
  LeaseTenants: {
    include: {
      Tenant: true,
    },
  },
  Contractor: true,
  BillingSchedules: true,
  NotificationSettings: true,
  Attachments: true,
  Company: true,
  Broker: true,
  Foreigner: true,
  Pet: true,
  Vehicles: {
    include: {
      ParkingSpace: true,
    },
  },
});

export type LeaseDetail = Prisma.LeaseGetPayload<{
  include: typeof leaseDetailInclude;
}>;

export async function getLeaseDetail(
  leaseId: number
): Promise<Result<LeaseDetail>> {
  // 2) 권한 검사
  const session = await auth();
  if (!session?.user) {
    return {
      ok: false,
      code: 'UNAUTHORIZED',
      message: '로그인이 필요합니다',
    };
  }

  try {
    // 3) 계약 상세 정보 조회
    const lease = await database.lease.findUnique({
      where: { id: BigInt(leaseId) },
      include: leaseDetailInclude,
    });

    if (!lease) {
      return {
        ok: false,
        code: 'NOT_FOUND',
        message: '계약을 찾을 수 없습니다',
      };
    }

    return {
      ok: true,
      data: lease,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getLeaseDetail] error:', error);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '계약 정보 조회 중 오류가 발생했습니다',
    };
  }
}
