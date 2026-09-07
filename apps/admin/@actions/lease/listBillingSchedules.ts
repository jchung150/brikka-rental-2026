'use server';

import type { Paged, Result } from '@repo/common/types';
import { Prisma, database } from '@repo/database';

export interface ListBillingSchedulesInput {
  buildingId?: number;
  leaseId?: number;
  unitId?: number;
  tenantId?: number;
  status?: string;
  itemName?: string;
  dueDateStart?: string;
  dueDateEnd?: string;
  page?: number;
  limit?: number;
}

const billingScheduleListItemInclude =
  Prisma.validator<Prisma.LeaseBillingScheduleInclude>()({
    Lease: {
      include: {
        Unit: {
          include: {
            Building: true,
          },
        },
        LeaseTenants: {
          include: {
            Tenant: true,
          },
        },
        NotificationSettings: true,
      },
    },
  });

export type BillingScheduleListItem = Prisma.LeaseBillingScheduleGetPayload<{
  include: typeof billingScheduleListItemInclude;
}>;

export async function listBillingSchedules(
  input: ListBillingSchedulesInput
): Promise<Result<Paged<BillingScheduleListItem>>> {
  const {
    buildingId,
    leaseId,
    unitId,
    tenantId,
    status,
    itemName,
    dueDateStart,
    dueDateEnd,
    page = 1,
    limit = 20,
  } = input;

  try {
    const where: Prisma.LeaseBillingScheduleWhereInput = {};
    const leaseWhere: Prisma.LeaseWhereInput = {};

    const unitWhere: Prisma.UnitWhereInput = {};

    if (buildingId) {
      unitWhere.buildingId = BigInt(buildingId);
    }

    if (unitId) {
      unitWhere.id = BigInt(unitId);
    }

    if (Object.keys(unitWhere).length > 0) {
      leaseWhere.Unit = unitWhere;
    }

    if (status) {
      leaseWhere.status = status as any;
    }

    if (tenantId) {
      leaseWhere.LeaseTenants = {
        some: {
          Tenant: {
            id: BigInt(tenantId),
          },
        },
      };
    }

    if (Object.keys(leaseWhere).length > 0) {
      where.Lease = leaseWhere;
    }

    if (leaseId) {
      where.leaseId = BigInt(leaseId);
    }

    if (itemName) {
      where.itemName = {
        contains: itemName,
      };
    }

    if (dueDateStart || dueDateEnd) {
      where.dueDate = {};
      if (dueDateStart) {
        where.dueDate.gte = new Date(dueDateStart);
      }
      if (dueDateEnd) {
        where.dueDate.lte = new Date(dueDateEnd);
      }
    }

    const billingSchedules = await database.leaseBillingSchedule.findMany({
      where,
      include: billingScheduleListItemInclude,
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await database.leaseBillingSchedule.count({ where });

    const lastPage = Math.ceil(total / limit);

    return {
      ok: true,
      data: {
        items: billingSchedules,
        page,
        limit,
        total,
        lastPage,
      },
    };
  } catch (error) {
    console.error('[listBillingSchedules] error:', error);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '청구 스케줄 목록을 조회하는 중 오류가 발생했습니다.',
    };
  }
}
