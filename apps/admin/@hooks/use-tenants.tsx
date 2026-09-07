'use client';

import { listTenants } from '@/@actions/tenants/listTenants';
import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from './query-keys';

export function useTenants() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QueryKeys.User.List(['TENANT']),
    queryFn: () => listTenants(),
  });

  return {
    data: data?.ok ? data.data : null,
    isLoading,
    error,
    refetch,
  };
}
