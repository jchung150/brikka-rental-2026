'use client';

import {
  createApplianceFurniture,
  getApplianceFurniture,
} from '@/@actions/appliances-furniture';
import { QueryKeys } from '@/@hooks/query-keys';
import { SearchableSelect } from '@/components/searchable-select';
import type { ApplianceFurnitureCategory } from '@repo/database';
import { useQuery } from '@tanstack/react-query';

export function SelectFurniture({
  type,
  value,
  onValueChange,
}: {
  type: ApplianceFurnitureCategory;
  value: string;
  onValueChange: (value: string) => void;
}) {
  const { data: furniture, refetch } = useQuery({
    queryKey: QueryKeys.ApplianceFurniture.List(type),
    queryFn: () => getApplianceFurniture(type),
  });

  const options =
    furniture?.map((furniture) => ({
      label: furniture.name,
      value: furniture.id.toString(),
    })) ?? [];
  const typeLabel = type === 'APPLIANCE' ? '가전' : '가구';

  return (
    <SearchableSelect
      options={options}
      onValueChange={onValueChange}
      value={value}
      onCreateOption={async (value) => {
        await createApplianceFurniture({
          name: value,
          category: type,
        });
        refetch();
      }}
      placeholder={`${typeLabel}를 선택해주세요`}
    />
  );
}
