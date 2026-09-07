'use client';

import { listParkingSpace } from '@/@actions/parking-spaces/listParkingSpace';
import { QueryKeys } from '@/@hooks/query-keys';
import { useQuery } from '@tanstack/react-query';
import { useFormContext } from 'react-hook-form';

export function useParkingSpaces() {
  const { watch } = useFormContext<{
    basicInfo: { buildingId: string };
  }>();

  const buildingId = watch('basicInfo.buildingId');

  return useQuery({
    queryKey: QueryKeys.ParkingSpace.List(Number(buildingId)),
    queryFn: () => listParkingSpace(BigInt(buildingId)),
    enabled: !!buildingId,
    select: (data) => {
      if (!data.ok) return [];
      return data.data;
    },
  });
}
