'use server';
import type { UnitListItem } from '@/@data/unit';
import type { Paged, Result } from '@repo/common/types';
import { Prisma, database } from '@repo/database';

interface ListUnitsInput {
  buildingId: number;
  page?: number;
  limit?: number;
}

const selectUnit = Prisma.validator<Prisma.UnitSelect>()({
  id: true,
  name: true,
  unitType: true,
  unitNumber: true,
  floor: true,
  supplyAreaSqm: true,
  serviceAreaSqm: true,
  roomCount: true,
  bathroomCount: true,
  bedroomDirection: true,
  exclusiveAreaSqm: true,
  status: true,
  Building: {
    select: {
      address: true,
      addressDetail: true,
    },
  },
  Leases: {
    include: {
      LeaseTenants: {
        include: {
          Tenant: true,
        },
      },
    },
  },
});

type UnitWithDetails = Prisma.UnitGetPayload<{ select: typeof selectUnit }>;

const mapUnitToListItem = (unit: UnitWithDetails): UnitListItem => {
  const lease = unit.Leases[0];
  const representativeTenant = lease?.LeaseTenants.find(
    (tenant) => tenant.isRepresentative
  )?.Tenant;

  return {
    id: Number(unit.id),
    name: unit.name || unit.unitNumber,
    unitType: unit.unitType,
    unitNumber: unit.unitNumber,
    exclusiveAreaSqm: unit.exclusiveAreaSqm
      ? Number(unit.exclusiveAreaSqm)
      : null,
    floor: unit.floor,
    supplyAreaSqm: unit.supplyAreaSqm ? Number(unit.supplyAreaSqm) : null,
    serviceAreaSqm: unit.serviceAreaSqm ? Number(unit.serviceAreaSqm) : null,
    roomCount: unit.roomCount,
    bathroomCount: unit.bathroomCount,
    bedroomDirection: unit.bedroomDirection,
    status: unit.status,
    representativeTenantId: representativeTenant?.id
      ? Number(representativeTenant.id)
      : null,
    representativeTenantName: representativeTenant?.name || null,
    address: `${
      unit.Building.address +
      (unit.Building.addressDetail ? ` ${unit.Building.addressDetail}` : '')
    } ${unit.unitNumber}`,
  };
};

export async function listUnitsByBuildingId(
  buildingId: bigint
): Promise<Result<UnitListItem[]>> {
  const units = await database.unit.findMany({
    where: { buildingId: BigInt(buildingId), status: 'VACANT' },
    select: selectUnit,
  });

  return {
    ok: true,
    data: units.map((unit) => mapUnitToListItem(unit)),
  };
}

export async function listUnits(
  input: ListUnitsInput
): Promise<Result<Paged<UnitListItem>>> {
  try {
    const { buildingId, page = 1, limit = 25 } = input;
    const skip = (page - 1) * limit;

    // 유닛 목록 조회 (임대차 정보와 함께)
    const units = await database.unit.findMany({
      where: { buildingId: BigInt(buildingId) },
      select: selectUnit,
      orderBy: {
        unitNumber: 'asc',
      },
      skip,
      take: limit,
    });

    // 전체 개수 조회
    const total = await database.unit.count({
      where: { buildingId: BigInt(buildingId) },
    });

    // 데이터 변환
    const items = units.map((unit) => mapUnitToListItem(unit));

    return {
      ok: true,
      data: {
        items: items as UnitListItem[],
        page,
        limit,
        total,
        lastPage: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('[listUnits] error:', error);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '유닛 목록을 조회하는 중 오류가 발생했습니다.',
    };
  }
}

export async function getUnitName(id: bigint): Promise<string> {
  const unit = await database.unit.findUnique({
    where: { id: BigInt(id) },
    select: { name: true },
  });

  return unit?.name || '잘못된 유닛 아이디';
}
