'use server';

import { auth } from '@/auth';
import type { Result } from '@repo/common/types';
import { type Prisma, database } from '@repo/database';

type ParkingSpaceWithLeaseVehicle = Prisma.ParkingSpaceGetPayload<{
  include: {
    LeaseVehicle: true;
  };
}>;

export async function listParkingSpace(
  buildingId: bigint,
  where?: Prisma.ParkingSpaceWhereInput
): Promise<Result<ParkingSpaceWithLeaseVehicle[]>> {
  const session = await auth();
  if (!session?.user) {
    return {
      ok: false,
      code: 'UNAUTHORIZED',
      message: '로그인이 필요합니다.',
    };
  }

  // 3) 건물 존재 여부 확인
  const building = await database.building.findUnique({
    where: { id: BigInt(buildingId) },
    select: { id: true },
  });

  if (!building) {
    return {
      ok: false,
      code: 'NOT_FOUND',
      message: '해당 건물을 찾을 수 없습니다.',
    };
  }

  const parkingSpaces = await database.parkingSpace.findMany({
    include: {
      LeaseVehicle: true,
    },
    where: { buildingId: buildingId, ...where },
  });

  return {
    ok: true,
    data: parkingSpaces,
  };
}
