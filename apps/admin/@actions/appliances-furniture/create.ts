'use server';

import { auth } from '@/auth';
import type { Result } from '@repo/common/types';
import { type Prisma, database } from '@repo/database';

export async function createBuildingApplianceFurniture(
  input: Prisma.BuildingApplianceFurnitureUncheckedCreateInput
): Promise<Result<{ id: number }>> {
  // 권한 검사
  const session = await auth();
  if (!session?.user) {
    return { ok: false, code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' };
  }

  const result = await database.buildingApplianceFurniture.create({
    data: input,
    select: { id: true },
  });

  return { ok: true, data: { id: Number(result.id) } };
}

export async function createApplianceFurniture(
  input: Prisma.ApplianceFurnitureUncheckedCreateInput
): Promise<Result<{ id: string }>> {
  // 권한 검사
  const session = await auth();
  if (!session?.user) {
    return { ok: false, code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' };
  }

  try {
    const applianceFurniture = await database.applianceFurniture.create({
      data: input,
      select: { id: true },
    });

    return { ok: true, data: { id: applianceFurniture.id.toString() } };
  } catch (e) {
    console.error('[createApplianceFurniture] error', e);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '처리 중 오류가 발생했습니다.',
    };
  }
}

export async function createApplianceFurnitureLocation(
  input: Prisma.ApplianceFurnitureLocationUncheckedCreateInput
) {
  return await database.applianceFurnitureLocation.create({
    data: input,
    select: { id: true },
  });
}

export async function createApplianceFurnitureManufacturer(
  input: Prisma.ApplianceFurnitureManufacturerUncheckedCreateInput
) {
  return await database.applianceFurnitureManufacturer.create({
    data: input,
    select: { id: true },
  });
}
