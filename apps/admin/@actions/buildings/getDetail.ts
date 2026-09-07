'use server';

import type { BuildingDetailDto } from '@/@data/building';
import { buildingDetailMapper } from '@/@data/mapper';
import { ERROR_CODES, ERROR_MESSAGES, type Result } from '@repo/common/types';
import { Prisma, database } from '@repo/database';
import { requireRole } from '../lib/auth';

const buildingDetailInclude = Prisma.validator<Prisma.BuildingInclude>()({
  Manager: true,
  Ownerships: {
    include: {
      Landlord: true,
    },
  },
  Facilities: {
    include: {
      Facility: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  },
  ParkingSpaces: {
    include: {
      LeaseVehicle: {
        include: {
          Lease: {
            include: {
              Unit: true,
            },
          },
        },
      },
    },
    orderBy: {
      spaceName: 'asc',
    },
  },
  BuildingApplianceFurniture: {
    include: {
      ApplianceFurniture: true,
      Manufacturer: true,
      Location: true,
      Unit: {
        select: {
          id: true,
          unitNumber: true,
        },
      },
    },
    orderBy: {
      installationDate: 'desc',
    },
  },
});

export type BuildingDetailEntity = Prisma.BuildingGetPayload<{
  include: typeof buildingDetailInclude;
}>;

export async function getBuildingDetail(
  id: number
): Promise<Result<BuildingDetailDto>> {
  if (!requireRole('ADMIN')) {
    return {
      ok: false,
      code: ERROR_CODES.FORBIDDEN,
      message: ERROR_MESSAGES.FORBIDDEN,
    };
  }
  try {
    // 2) 건물 상세 정보 조회
    const building = await database.building.findUnique({
      where: { id: id },
      include: buildingDetailInclude,
    });

    if (!building) {
      return {
        ok: false,
        code: ERROR_CODES.NOT_FOUND,
        message: '건물을 찾을 수 없습니다.',
      };
    }

    return {
      ok: true,
      data: buildingDetailMapper(building),
    };
  } catch (e) {
    console.error('[getBuildingDetail] error', e);
    return {
      ok: false,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: '건물 상세 정보 조회 중 오류가 발생했습니다.',
    };
  }
}
