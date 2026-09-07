'use client';

import {
  createApplianceFurnitureLocation,
  getApplianceFurnitureLocation,
} from '@/@actions/appliances-furniture';
import { QueryKeys } from '@/@hooks/query-keys';
import { SearchableSelect } from '@/components/searchable-select';
import { useQuery } from '@tanstack/react-query';

export function SelectFurnitureLocation({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  const { data: items, refetch } = useQuery({
    queryKey: QueryKeys.ApplianceFurnitureLocation.List(),
    queryFn: () => getApplianceFurnitureLocation(),
  });

  const options =
    items?.map((furniture) => ({
      label: furniture.name,
      value: furniture.id.toString(),
    })) ?? [];

  return (
    <SearchableSelect
      options={options}
      onValueChange={onValueChange}
      value={value}
      onCreateOption={async (value) => {
        await createApplianceFurnitureLocation({
          name: value,
        });
        refetch();
      }}
      placeholder="위치를 선택해주세요"
    />
  );
}
