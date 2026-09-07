'use server';

import { ERROR_CODES, ERROR_MESSAGES, type Result } from '@repo/common/types';
import { type Prisma, database } from '@repo/database';
import { requireRole } from '../lib/auth';

export async function addBuildingFacilities(
  input: Prisma.BuildingFacilityCreateManyInput[]
): Promise<Result<{ count: number }>> {
  if (!requireRole('ADMIN')) {
    return {
      ok: false,
      code: ERROR_CODES.FORBIDDEN,
      message: ERROR_MESSAGES.FORBIDDEN,
    };
  }

  const result = await database.buildingFacility.createMany({
    data: input,
  });

  return {
    ok: true,
    data: { count: result.count },
  };
}

export async function deleteBuildingFacilities(
  id: bigint
): Promise<Result<void>> {
  if (!requireRole('ADMIN')) {
    return {
      ok: false,
      message: ERROR_MESSAGES.FORBIDDEN,
    };
  }

  const result = await database.buildingFacility.delete({
    where: { id },
  });

  return {
    ok: true,
    data: undefined,
  };
}

export async function updateBuildingFacilities(
  id: bigint,
  input: Prisma.BuildingFacilityUpdateInput
): Promise<Result<void>> {
  if (!requireRole('ADMIN')) {
    return {
      ok: false,
      code: ERROR_CODES.FORBIDDEN,
      message: ERROR_MESSAGES.FORBIDDEN,
    };
  }

  const result = await database.buildingFacility.update({
    where: { id },
    data: input,
  });

  return {
    ok: true,
    data: undefined,
  };
}
