'use server';

import type { BuildingDto } from '@/@data/building';
import { buildingMapper } from '@/@data/mapper';
import {
  ERROR_CODES,
  ERROR_MESSAGES,
  type Paged,
  type Result,
} from '@repo/common/types';
import { Prisma, database } from '@repo/database';
import { requireRole } from '../lib/auth';

const listItemInclude = Prisma.validator<Prisma.BuildingInclude>()({
  Manager: true,
  Ownerships: {
    include: {
      Landlord: true,
    },
  },
});
export type BuildingEntity = Prisma.BuildingGetPayload<{
  include: typeof listItemInclude;
}>;

export async function allBuilding(): Promise<
  Result<{ id: number; name: string }[]>
> {
  const buildings = await database.building.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  return {
    ok: true,
    data: buildings.map((building) => ({
      id: Number(building.id),
      name: building.name,
    })),
  };
}

export async function buildingsForExcel(): Promise<
  {
    id: number;
    name: string;
    address: string;
    managerName: string;
    buildingType: string;
    landlordName: string;
  }[]
> {
  if (!requireRole('ADMIN')) {
    throw new Error(ERROR_MESSAGES.FORBIDDEN);
  }

  const buildings = await database.building.findMany({
    select: {
      id: true,
      name: true,
      address: true,
      addressDetail: true,
      zipcode: true,
      buildingType: true,
      Manager: {
        select: {
          name: true,
        },
      },
      Ownerships: {
        select: {
          Landlord: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  return buildings.map((building) => ({
    id: Number(building.id),
    name: building.name,
    address: `${building.address} ${building.addressDetail}`,
    buildingType: building.buildingType ?? '',
    managerName: building.Manager?.name ?? '',
    landlordName: building.Ownerships[0]?.Landlord?.name ?? '',
  }));
}

export async function listBuildings(
  page: number,
  limit: number,
  params: {
    q?: string;
    sortBy: keyof Prisma.BuildingOrderByWithRelationInput;
    sortOrder: 'asc' | 'desc';
  }
): Promise<Result<Paged<BuildingDto>>> {
  if (!requireRole('ADMIN')) {
    return {
      ok: false,
      code: ERROR_CODES.FORBIDDEN,
      message: ERROR_MESSAGES.FORBIDDEN,
    };
  }

  try {
    // 2) 검색 조건 구성
    const where: Prisma.BuildingWhereInput = {};

    if (params.q) {
      where.OR = [
        { name: { contains: params.q, mode: 'insensitive' } },
        { address: { contains: params.q, mode: 'insensitive' } },
        { description: { contains: params.q, mode: 'insensitive' } },
      ];
    }

    // if (managerId) {
    //   where.managerId = BigInt(managerId);
    // }

    // 3) 정렬 조건 구성
    const orderBy: Prisma.BuildingOrderByWithRelationInput = {};
    // orderBy[sortBy] = sortOrder;
    if (params.sortBy) {
      orderBy[params.sortBy] = params.sortOrder;
    }

    // 4) 총 건물 수 조회
    const total = await database.building.count({ where });

    // 5) 건물 목록 조회 (관리자 정보와 소유권 정보 포함)
    const items = await database.building.findMany({
      where,
      orderBy,
      take: limit,
      skip: (page - 1) * limit,
      include: listItemInclude,
    });
    const totalPages = Math.ceil(total / limit);
    // 7) 결과 구성
    const result: Paged<BuildingDto> = {
      items: items.map(buildingMapper),
      page,
      limit,
      total,
      lastPage: totalPages,
    };

    return { ok: true, data: result };
  } catch (e) {
    console.error('[listBuildings] error', e);
    return {
      ok: false,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: '건물 목록 조회 중 오류가 발생했습니다.',
    };
  }
}
