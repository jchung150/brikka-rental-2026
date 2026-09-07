'use client';

import { listLandlords } from '@/@actions/landlords/listLandlords';
import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from './query-keys';

export function useLandlords() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QueryKeys.User.List(['LANDLORD']),
    queryFn: () => listLandlords(),
  });

  return {
    data: data?.ok ? data.data : null,
    isLoading,
    error,
    refetch,
  };
}
