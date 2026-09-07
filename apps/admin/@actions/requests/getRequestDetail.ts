'use server';

import type { Result } from '@repo/common/types';
import { Prisma, database } from '@repo/database';

const requestDetailInclude = Prisma.validator<Prisma.RequestInclude>()({
  Requester: {
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
    },
  },
  Building: {
    select: {
      id: true,
      name: true,
      address: true,
    },
  },
  Unit: {
    select: {
      id: true,
      name: true,
      unitNumber: true,
      floor: true,
    },
  },
  Lease: {
    select: {
      id: true,
      status: true,
      startDate: true,
      endDate: true,
      LeaseTenants: {
        include: {
          Tenant: {
            select: {
              id: true,
              name: true,
              email: true,
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

export type RequestDetail = Prisma.RequestGetPayload<{
  include: typeof requestDetailInclude;
}>;

export async function getRequestDetail(
  id: number
): Promise<Result<RequestDetail>> {
  try {
    const request = await database.request.findUnique({
      where: { id: BigInt(id) },
      include: requestDetailInclude,
    });

    if (!request) {
      return {
        ok: false,
        code: 'NOT_FOUND',
        message: '요청을 찾을 수 없습니다.',
      };
    }

    return {
      ok: true,
      data: request,
    };
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Server-side logging
    console.error('[getRequestDetail] error:', error);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '요청 상세 정보를 조회하는 중 오류가 발생했습니다.',
    };
  }
}
