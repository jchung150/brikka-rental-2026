'use server';

import {
  ERROR_CODES,
  ERROR_MESSAGES,
  type Paged,
  type Result,
} from '@repo/common/types';
import { type Prisma, database } from '@repo/database';
import { z } from 'zod';
import { requireRole } from '../lib/auth';

const Input = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['PREPARING', 'ACTIVE', 'COMPLETED', 'TERMINATED']).optional(),
  buildingId: z.string().optional(),
  unitId: z.string().optional(),
  tenantId: z.string().optional(),
  startDateFrom: z.string().datetime().optional(),
  startDateTo: z.string().datetime().optional(),
  remainingDaysFilter: z
    .enum(['expired', 'urgent', 'upcoming', 'normal'])
    .optional(),
  renewalNoticeFilter: z.enum(['overdue', 'urgent', 'normal']).optional(),
  sortBy: z
    .enum(['createdAt', 'startDate', 'endDate', 'status', 'remainingDays'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

type Params = z.infer<typeof Input>;

export type LeaseListItem = {
  id: string;
  unitId: string;
  unitName: string;
  unitNumber: string;
  buildingId: string;
  buildingName: string;
  tenantId: string | null;
  tenantName: string | null;
  tenantEmail: string | null;
  contractorId: string | null;
  contractorName: string | null;
  startDate: string;
  endDate: string;
  status: string;
  numberOfOccupants: number | null;
  isSublease: boolean;
  isBrokerLinked: boolean;
  isCorporate: boolean;
  isForeigner: boolean;
  issueTaxInvoice: boolean;
  depositReturnDate: string | null;
  memo: string | null;
  createdAt: string;
  updatedAt: string;
  remainingDays: number;
  renewalNoticeDaysLeft: number;
};

export async function listLeases(
  input: Params
): Promise<Result<Paged<LeaseListItem>>> {
  if (!requireRole('ADMIN')) {
    return {
      ok: false,
      code: ERROR_CODES.FORBIDDEN,
      message: ERROR_MESSAGES.FORBIDDEN,
    };
  }

  const {
    page,
    limit,
    search,
    status,
    buildingId,
    unitId,
    startDateFrom,
    startDateTo,
    remainingDaysFilter,
    sortBy,
    sortOrder,
  } = input;

  try {
    // 2) 검색 조건 구성
    const where: Prisma.LeaseWhereInput = {};

    if (search) {
      where.OR = [
        {
          Unit: {
            name: { contains: search, mode: 'insensitive' },
          },
        },
        {
          Unit: {
            unitNumber: { contains: search, mode: 'insensitive' },
          },
        },
        {
          Unit: {
            Building: {
              name: { contains: search, mode: 'insensitive' },
            },
          },
        },
        {
          LeaseTenants: {
            some: {
              Tenant: {
                name: { contains: search, mode: 'insensitive' },
              },
            },
          },
        },
        {
          memo: { contains: search, mode: 'insensitive' },
        },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (buildingId) {
      where.Unit = {
        ...where.Unit,
      };
      where.Unit.Building = {
        id: BigInt(buildingId),
      };
    }

    if (unitId) {
      where.unitId = BigInt(unitId);
    }

    if (startDateFrom || startDateTo) {
      where.startDate = {};
      if (startDateFrom) {
        where.startDate.gte = new Date(startDateFrom);
      }
      if (startDateTo) {
        where.startDate.lte = new Date(startDateTo);
      }
    }

    // remainingDaysFilter: endDate 기준으로 필터링
    if (remainingDaysFilter) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (remainingDaysFilter) {
        case 'expired': {
          // 만료됨: endDate < today
          where.endDate = { lt: today };
          break;
        }
        case 'urgent': {
          // 3일 이내: today <= endDate <= today + 3일
          const urgentEnd = new Date(today);
          urgentEnd.setDate(urgentEnd.getDate() + 3);
          where.endDate = { gte: today, lte: urgentEnd };
          break;
        }
        case 'upcoming': {
          // 30일 이내: today + 3일 < endDate <= today + 30일
          const upcomingStart = new Date(today);
          upcomingStart.setDate(upcomingStart.getDate() + 3);
          const upcomingEnd = new Date(today);
          upcomingEnd.setDate(upcomingEnd.getDate() + 30);
          where.endDate = { gt: upcomingStart, lte: upcomingEnd };
          break;
        }
        case 'normal': {
          // 30일 이후: endDate > today + 30일
          const normalStart = new Date(today);
          normalStart.setDate(normalStart.getDate() + 30);
          where.endDate = { gt: normalStart };
          break;
        }
      }
    }

    // TODO: renewalNoticeFilter 구현 필요
    // 갱신 통지 마감일 기준 필터링은 계산된 값이므로 별도 구현 필요

    // 3) 정렬 조건 구성
    const orderBy: Prisma.LeaseOrderByWithRelationInput = {};

    if (sortBy === 'remainingDays') {
      orderBy.endDate = sortOrder;
    } else {
      orderBy[sortBy] = sortOrder;
    }

    // 4) 총 계약 수 조회
    const total = await database.lease.count({ where });

    // 5) 계약 목록 조회
    const leases = await database.lease.findMany({
      where,
      select: {
        id: true,
        unitId: true,
        contractorId: true,
        startDate: true,
        endDate: true,
        status: true,
        numberOfOccupants: true,
        isSublease: true,
        isBrokerLinked: true,
        isCorporate: true,
        isForeigner: true,
        issueTaxInvoice: true,
        depositReturnDate: true,
        memo: true,
        createdAt: true,
        updatedAt: true,
        Unit: {
          select: {
            id: true,
            name: true,
            unitNumber: true,
            Building: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        LeaseTenants: {
          include: {
            Tenant: true,
          },
          where: {
            isRepresentative: true,
          },
        },
        Contractor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy,
      take: limit,
      skip: (page - 1) * limit,
    });

    // 6) 페이징 정보 계산
    const totalPages = Math.ceil(total / limit);

    // 7) 데이터 변환 및 계산
    const today = new Date();
    const items: LeaseListItem[] = leases.map((lease) => {
      const endDate = new Date(lease.endDate);
      const remainingDays = Math.ceil(
        (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      // TODO: 갱신 통지 마감일 계산
      // 갱신 통지 마감일: 계약 종료일 6개월 전
      const renewalNoticeDeadline = new Date(lease.endDate);
      renewalNoticeDeadline.setMonth(renewalNoticeDeadline.getMonth() - 6);
      const renewalNoticeDaysLeft = Math.ceil(
        (renewalNoticeDeadline.getTime() - today.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      const representativeTenant = lease.LeaseTenants[0] || null;

      return {
        id: lease.id.toString(),
        unitId: lease.unitId.toString(),
        unitName: lease.Unit.name || '',
        unitNumber: lease.Unit.unitNumber,
        buildingId: lease.Unit.Building.id.toString(),
        buildingName: lease.Unit.Building.name,
        tenantId: representativeTenant?.Tenant.id.toString() || null,
        tenantName: representativeTenant?.Tenant.name || null,
        tenantEmail: representativeTenant?.Tenant.email || null,
        contractorId: lease.Contractor?.id.toString() || null,
        contractorName: lease.Contractor?.name || null,
        startDate: lease.startDate.toISOString(),
        endDate: lease.endDate.toISOString(),
        status: lease.status,
        numberOfOccupants: lease.numberOfOccupants,
        isSublease: lease.isSublease,
        isBrokerLinked: lease.isBrokerLinked,
        isCorporate: lease.isCorporate,
        isForeigner: lease.isForeigner,
        issueTaxInvoice: lease.issueTaxInvoice,
        depositReturnDate: lease.depositReturnDate?.toISOString() || null,
        memo: lease.memo,
        createdAt: lease.createdAt.toISOString(),
        updatedAt: lease.updatedAt.toISOString(),
        remainingDays,
        renewalNoticeDaysLeft,
      };
    });

    // 8) 결과 구성
    const result: Paged<LeaseListItem> = {
      items,
      page,
      limit,
      total,
      lastPage: totalPages,
    };

    return { ok: true, data: result };
  } catch (e) {
    console.error('[listLeases] error', e);
    return {
      ok: false,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: '임대차 계약 목록 조회 중 오류가 발생했습니다.',
    };
  }
}
