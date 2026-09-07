import { getBuildingDetail } from '@/@actions/buildings/getDetail';
import { allBuilding, listBuildings } from '@/@actions/buildings/listBuildings';
import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from './query-keys';

export const useBuildingDetail = (id: number) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QueryKeys.Building.Detail(id),
    queryFn: () => getBuildingDetail(id),
  });

  return { data: data?.ok ? data.data : null, isLoading, error, refetch };
};

export const useBuildings = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QueryKeys.Building.All(),
    queryFn: () => allBuilding(),
  });

  return { data: data?.ok ? data.data : null, isLoading, error, refetch };
};

export const useBuildingsList = (
  page: number,
  params?: { q?: string; sortBy?: any; sortOrder?: any }
) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QueryKeys.Building.List(JSON.stringify({ page, ...params })),
    queryFn: () =>
      listBuildings(page, 20, {
        sortBy: params?.sortBy ?? 'id',
        sortOrder: params?.sortOrder ?? 'desc',
        q: params?.q,
      }),
  });

  return { data: data?.ok ? data.data : null, isLoading, error, refetch };
};
