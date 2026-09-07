'use server';

import type { Result } from '@repo/common/types';
import { database } from '@repo/database';

export interface TenantListItem {
  id: number;
  name: string;
  email: string;
  phoneNumber: string | null;
  profileImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  lease: {
    id: number;
    status: string;
    startDate: Date;
    endDate: Date;
    unit: {
      id: number;
      name: string;
      building: {
        id: number;
        name: string;
      };
    };
  } | null;
  isPortalInvited: boolean;
}

export async function listTenants(): Promise<Result<TenantListItem[]>> {
  try {
    const tenants = await database.user.findMany({
      where: {
        userRole: 'TENANT',
      },
      include: {
        LeaseTenants: {
          where: {
            Lease: {
              status: {
                in: ['PREPARING', 'ACTIVE'],
              },
            },
          },
          include: {
            Lease: {
              include: {
                Unit: {
                  include: {
                    Building: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1, // 가장 최근 계약만 가져오기
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const tenantList: TenantListItem[] = tenants.map((tenant) => {
      const lease = tenant.LeaseTenants[0]?.Lease;
      return {
        id: Number(tenant.id),
        name: tenant.name,
        email: tenant.email,
        phoneNumber: tenant.phoneNumber,
        profileImageUrl: tenant.profileImageUrl,
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
        lease: lease
          ? {
              id: Number(lease.id),
              status: lease.status,
              startDate: lease.startDate,
              endDate: lease.endDate,
              unit: {
                id: Number(lease.Unit.id),
                name: lease.Unit.name || '',
                building: {
                  id: Number(lease.Unit.Building.id),
                  name: lease.Unit.Building.name,
                },
              },
            }
          : null,
        isPortalInvited: tenant.lastLoggedAt !== null,
      };
    });

    return { ok: true, data: tenantList };
  } catch (error) {
    console.error('[listTenants] error', error);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '입주자 목록을 불러오는 중 오류가 발생했습니다.',
    };
  }
}
