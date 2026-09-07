'use server';

import type { Result } from '@repo/common/types';
import { Prisma, database } from '@repo/database';

const buildingOwnershipInclude =
  Prisma.validator<Prisma.BuildingOwnershipInclude>()({
    Building: {
      select: {
        id: true,
        name: true,
        address: true,
      },
    },
  });

export type BuildingOwnership = Prisma.BuildingOwnershipGetPayload<{
  include: typeof buildingOwnershipInclude;
}>;

export async function getUserBuildingOwnerships(
  userId: string
): Promise<Result<BuildingOwnership[]>> {
  try {
    const ownerships = await database.buildingOwnership.findMany({
      where: {
        landlordId: BigInt(userId),
      },
      include: buildingOwnershipInclude,
    });

    return {
      ok: true,
      data: ownerships,
    };
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Server-side logging
    console.error('[getUserBuildingOwnerships] error:', error);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '건물 소유권 정보를 조회하는 중 오류가 발생했습니다.',
    };
  }
}
