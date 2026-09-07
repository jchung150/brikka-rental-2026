'use client';

import { listParkingSpace } from '@/@actions/parking-spaces/listParkingSpace';
import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from './query-keys';

interface UseParkingSpacesInput {
  buildingId: number;
  where?: any; // Prisma.ParkingSpaceWhereInput
}

export function useParkingSpaces(input: UseParkingSpacesInput) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QueryKeys.ParkingSpace.List(input.buildingId, input.where),
    queryFn: () => listParkingSpace(BigInt(input.buildingId), input.where),
    enabled: !!input.buildingId,
  });

  return {
    data: data?.ok ? data.data : null,
    isLoading,
    error,
    refetch,
  };
}
