'use client';

import type { UnitListItem } from '@/@data/unit';
import { DataTable } from '@/components/data-table/data-table';
import { createUnitColumns } from './unit-columns';
import { UnitToolbar } from './unit-toolbar';

interface UnitTableProps {
  items: UnitListItem[];
  onAddUnit: () => void;
  onEditUnit: (unit: UnitListItem) => void;
  onDeleteUnit: (unit: UnitListItem) => void;
}

export function UnitTable({
  items,
  onAddUnit,
  onEditUnit,
  onDeleteUnit,
}: UnitTableProps) {
  const columns = createUnitColumns({
    onEdit: onEditUnit,
    onDelete: onDeleteUnit,
  });

  return (
    <DataTable
      columns={columns}
      data={items}
      Toolbar={({ table }) => (
        <UnitToolbar table={table} onAddUnit={onAddUnit} />
      )}
    />
  );
}
