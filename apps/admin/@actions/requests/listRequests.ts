'use server';

import type { Paged, Result } from '@repo/common/types';
import {
  Prisma,
  type RequestPriority,
  type RequestStatus,
  type RequestType,
  database,
} from '@repo/database';

interface ListRequestsInput {
  buildingId?: number;
  leaseId?: number;
  unitId?: number;
  status?: RequestStatus;
  requestType?: RequestType;
  priority?: RequestPriority;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

const requestListItemInclude = Prisma.validator<Prisma.RequestInclude>()({
  Requester: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  Building: {
    select: {
      id: true,
      name: true,
    },
  },
  Unit: {
    select: {
      id: true,
      name: true,
      unitNumber: true,
    },
  },
  Lease: {
    select: {
      id: true,
      status: true,
    },
  },
});

export type RequestListItem = Prisma.RequestGetPayload<{
  include: typeof requestListItemInclude;
}>;

export async function listRequests(
  input: ListRequestsInput
): Promise<Result<Paged<RequestListItem>>> {
  try {
    const {
      buildingId,
      leaseId,
      unitId,
      status,
      requestType,
      priority,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = input;

    const skip = (page - 1) * limit;

    // where 조건 동적 생성
    const whereConditions: Prisma.RequestWhereInput = {};

    if (buildingId) {
      whereConditions.buildingId = BigInt(buildingId);
    }

    if (leaseId) {
      whereConditions.leaseId = BigInt(leaseId);
    }

    if (unitId) {
      whereConditions.unitId = BigInt(unitId);
    }

    if (status) {
      whereConditions.status = status;
    }

    if (requestType) {
      whereConditions.requestType = requestType;
    }

    if (priority) {
      whereConditions.priority = priority;
    }

    // 정렬 조건 구성
    const orderBy: Prisma.RequestOrderByWithRelationInput = {};
    if (sortBy === 'priority') {
      orderBy.priority = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    // 요청 목록 조회
    const requests = await database.request.findMany({
      where: whereConditions,
      include: requestListItemInclude,
      orderBy,
      skip,
      take: limit,
    });

    // 전체 개수 조회
    const total = await database.request.count({
      where: whereConditions,
    });

    const lastPage = Math.ceil(total / limit);

    return {
      ok: true,
      data: {
        items: requests,
        page,
        limit,
        total,
        lastPage,
      },
    };
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Server-side logging
    console.error('[listRequests] error:', error);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '요청 목록을 조회하는 중 오류가 발생했습니다.',
    };
  }
}
