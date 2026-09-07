'use client';

import { getBuildingApplianceFurnitures } from '@/@actions/appliances-furniture';
import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from './query-keys';

export function useBuildingFurnitures(
  buildingId: number,
  scope?: 'BUILDING_COMMON' | 'UNIT_COMMON' | 'UNIT_EXCLUSIVE'
) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QueryKeys.BuildingApplianceFurniture.List(buildingId, scope),
    queryFn: () => getBuildingApplianceFurnitures(buildingId, scope),
    enabled: !!buildingId,
  });

  return {
    data: data || null,
    isLoading,
    error,
    refetch,
  };
}
