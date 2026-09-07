'use server';

import type { Result } from '@repo/common/types';
import { Prisma, database } from '@repo/database';

const requestWithUnitAndBuildingInclude =
  Prisma.validator<Prisma.RequestInclude>()({
    Unit: {
      include: {
        Building: true,
      },
    },
  });

const tenantDetailInclude = Prisma.validator<Prisma.UserInclude>()({
  LeaseTenants: {
    include: {
      Lease: {
        include: {
          Unit: {
            include: {
              Building: true,
            },
          },
        },
      },
    },
  },
  Requests: {
    include: requestWithUnitAndBuildingInclude,
  },
  Attachments: {
    include: {
      File: true,
    },
  },
});

export type RequestWithUnitAndBuilding = Prisma.RequestGetPayload<{
  include: typeof requestWithUnitAndBuildingInclude;
}>;

export type TenantDetail = Prisma.UserGetPayload<{
  include: typeof tenantDetailInclude;
}>;

export async function getTenantDetail(
  tenantId: number
): Promise<Result<TenantDetail>> {
  try {
    const tenant = await database.user.findUnique({
      where: {
        id: tenantId,
        userRole: 'TENANT',
      },
      include: tenantDetailInclude,
    });

    if (!tenant) {
      return {
        ok: false,
        code: 'NOT_FOUND',
        message: '입주자를 찾을 수 없습니다.',
      };
    }

    return { ok: true, data: tenant };
  } catch (error) {
    console.error('[getTenantDetail] error', error);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '입주자 상세 정보를 불러오는 중 오류가 발생했습니다.',
    };
  }
}
