'use client';

import {
  createApplianceFurnitureManufacturer,
  getApplianceFurnitureManufacturer,
} from '@/@actions/appliances-furniture';
import { QueryKeys } from '@/@hooks/query-keys';
import { SearchableSelect } from '@/components/searchable-select';
import { useQuery } from '@tanstack/react-query';

export function SelectFurnitureManufacturer({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  const { data: items, refetch } = useQuery({
    queryKey: QueryKeys.ApplianceFurnitureManufacturer.List(),
    queryFn: () => getApplianceFurnitureManufacturer(),
  });

  const options =
    items?.map((manufacturer) => ({
      label: manufacturer.name,
      value: manufacturer.id.toString(),
    })) ?? [];

  return (
    <SearchableSelect
      options={options}
      onValueChange={onValueChange}
      value={value}
      onCreateOption={async (value) => {
        await createApplianceFurnitureManufacturer({
          name: value,
        });
        refetch();
      }}
      placeholder="제조사를 선택해주세요"
    />
  );
}
