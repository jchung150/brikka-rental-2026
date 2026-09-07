'use server';

import { ERROR_CODES, ERROR_MESSAGES, type Result } from '@repo/common/types';
import { type Facility, type Prisma, database } from '@repo/database';
import { requireRole } from '../lib/auth';

export async function createFacility(
  input: Prisma.FacilityUncheckedCreateInput
): Promise<Result<{ id: number }>> {
  if (!requireRole('ADMIN')) {
    return {
      ok: false,
      code: ERROR_CODES.FORBIDDEN,
      message: ERROR_MESSAGES.FORBIDDEN,
    };
  }
  try {
    const facility = await database.facility.create({
      data: input,
      select: { id: true },
    });
    if (!facility) {
      return {
        ok: false,
        code: ERROR_CODES.INTERNAL_ERROR,
        message: '공용시설 등록 실패(중복)',
      };
    }
    return {
      ok: true,
      data: { id: Number(facility?.id) },
    };
  } catch (error) {
    return {
      ok: false,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: '공용시설 등록 실패(중복)',
    };
  }
}

export async function listFacilities(): Promise<Result<Facility[]>> {
  if (!requireRole('ADMIN')) {
    return {
      ok: false,
      code: ERROR_CODES.FORBIDDEN,
      message: ERROR_MESSAGES.FORBIDDEN,
    };
  }
  try {
    const facilities = await database.facility.findMany();
    return {
      ok: true,
      data: facilities,
    };
  } catch (error) {
    return {
      ok: false,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: ERROR_MESSAGES.INTERNAL_ERROR,
    };
  }
}

export async function updateFacility(
  id: number,
  input: Prisma.FacilityUpdateInput
): Promise<Result<void>> {
  if (!requireRole('ADMIN')) {
    return {
      ok: false,
      code: ERROR_CODES.FORBIDDEN,
      message: ERROR_MESSAGES.FORBIDDEN,
    };
  }

  const result = await database.facility.update({
    where: { id },
    data: input,
  });

  return {
    ok: true,
    data: undefined,
  };
}
