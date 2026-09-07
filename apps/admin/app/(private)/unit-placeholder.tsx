'use client';

import { getUnitName } from '@/@actions/units/listUnits';
import { QueryKeys } from '@/@hooks/query-keys';
import { Input } from '@repo/design-system/components/ui/input';
import { useQuery } from '@tanstack/react-query';

export function UnitPlaceholder({ id }: { id: number }) {
  const { data, isLoading, error } = useQuery({
    queryKey: QueryKeys.Unit.Name(id),
    queryFn: () => getUnitName(BigInt(id)),
  });
  return (
    <div className="relative">
      <Input value={data} disabled />
    </div>
  );
}
