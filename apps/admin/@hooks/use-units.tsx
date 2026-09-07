'use client';

import { listUnitsByBuildingId } from '@/@actions/units/listUnits';
import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from './query-keys';

export const useUnitsByBuildingId = (buildingId?: number) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QueryKeys.Unit.List(buildingId),
    queryFn: () => listUnitsByBuildingId(BigInt(buildingId ?? 0)),
    enabled: !!buildingId,
  });

  return data?.ok ? data.data : [];
};
