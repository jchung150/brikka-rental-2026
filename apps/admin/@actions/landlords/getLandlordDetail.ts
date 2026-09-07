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

const landlordDetailInclude = Prisma.validator<Prisma.UserInclude>()({
  BuildingOwnerships: {
    include: {
      Building: {
        include: {
          Units: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  },
  Requests: {
    include: requestWithUnitAndBuildingInclude,
  },
});

export type RequestWithUnitAndBuilding = Prisma.RequestGetPayload<{
  include: typeof requestWithUnitAndBuildingInclude;
}>;

export type LandlordDetail = Prisma.UserGetPayload<{
  include: typeof landlordDetailInclude;
}>;

export async function getLandlordDetail(
  landlordId: number
): Promise<Result<LandlordDetail>> {
  try {
    const landlord = await database.user.findUnique({
      where: {
        id: BigInt(landlordId),
        userRole: 'LANDLORD',
      },
      include: landlordDetailInclude,
    });

    if (!landlord) {
      return {
        ok: false,
        code: 'NOT_FOUND',
        message: '임대인을 찾을 수 없습니다.',
      };
    }

    return { ok: true, data: landlord };
  } catch (error) {
    console.error('[getLandlordDetail] error:', error);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '임대인 정보를 불러오는 중 오류가 발생했습니다.',
    };
  }
}
