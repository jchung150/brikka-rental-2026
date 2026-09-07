'use client';

import { listLeases } from '@/@actions/lease/listLeases';
import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from './query-keys';

interface UseLeasesParams {
  sortBy?: 'createdAt' | 'startDate' | 'endDate' | 'status' | 'remainingDays';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  status?: 'PREPARING' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED';
  buildingId?: string;
  unitId?: string;
  tenantId?: string;
  startDateFrom?: string;
  startDateTo?: string;
  remainingDaysFilter?: 'expired' | 'urgent' | 'upcoming' | 'normal';
  renewalNoticeFilter?: 'overdue' | 'urgent' | 'normal';
}

export function useLeases(page = 1, params: UseLeasesParams = {}) {
  return useQuery({
    queryKey: QueryKeys.Lease.List({ page, ...params }),
    queryFn: async () => {
      const result = await listLeases({
        page,
        limit: 20,
        sortBy: params.sortBy ?? 'createdAt',
        sortOrder: params.sortOrder ?? 'desc',
        search: params.search,
        status: params.status,
        buildingId: params.buildingId,
        unitId: params.unitId,
        tenantId: params.tenantId,
        startDateFrom: params.startDateFrom,
        startDateTo: params.startDateTo,
        remainingDaysFilter: params.remainingDaysFilter,
        renewalNoticeFilter: params.renewalNoticeFilter,
      });
      if (!result.ok) {
        throw new Error(result.message);
      }
      return result.data;
    },
  });
}
