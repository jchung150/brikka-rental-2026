'use server';

import { database } from '@repo/database';
import type { ApplianceFurnitureCategory, Prisma } from '@repo/database';

export type BuildingApplianceFurnitureEntity =
  Prisma.BuildingApplianceFurnitureGetPayload<{
    include: {
      ApplianceFurniture: true;
      Manufacturer: true;
      Location: true;
      Unit: true;
    };
  }>;

export async function getBuildingApplianceFurnitures(
  buildingId: number,
  scope?: 'BUILDING_COMMON' | 'UNIT_COMMON' | 'UNIT_EXCLUSIVE'
): Promise<BuildingApplianceFurnitureEntity[]> {
  const where: Prisma.BuildingApplianceFurnitureWhereInput = {
    buildingId: buildingId,
  };
  if (scope) {
    where.usageScope = scope;
  }

  return await database.buildingApplianceFurniture.findMany({
    where,
    include: {
      ApplianceFurniture: true,
      Manufacturer: true,
      Location: true,
      Unit: true,
    },
  });
}

export async function getApplianceFurniture(type: ApplianceFurnitureCategory) {
  return await database.applianceFurniture.findMany({
    where: {
      category: type,
    },
  });
}

export async function getApplianceFurnitureLocation() {
  return await database.applianceFurnitureLocation.findMany();
}

export async function getApplianceFurnitureManufacturer() {
  return await database.applianceFurnitureManufacturer.findMany();
}
