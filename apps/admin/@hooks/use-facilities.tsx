'use client';

import { listFacilities } from '@/@actions/facilities';
import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from './query-keys';

export function useFacilities() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QueryKeys.Facilities.List(),
    queryFn: () => listFacilities(),
  });

  return {
    data: data?.ok ? data.data : [],
    isLoading,
    error,
    refetch,
  };
}
