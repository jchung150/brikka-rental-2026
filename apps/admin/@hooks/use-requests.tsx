'use client';

import { listRequests } from '@/@actions/requests/listRequests';
import type { RequestStatus } from '@repo/database/generated/client';
import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from './query-keys';

interface ListRequestsInput {
  buildingId?: number;
  leaseId?: number;
  unitId?: number;
  status?: RequestStatus;
}

export function useRequests(input?: ListRequestsInput) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QueryKeys.Request.List(input),
    queryFn: () => listRequests(input || {}),
  });

  return {
    data: data?.ok ? data.data.items : [],
    isLoading,
    error,
    refetch,
  };
}
