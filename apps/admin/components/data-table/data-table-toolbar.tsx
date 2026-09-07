'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import type { Table } from '@tanstack/react-table';
import { X } from 'lucide-react';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="검색..."
        value={
          (table.getColumn('contractName')?.getFilterValue() as string) ?? ''
        }
        onChange={(event) =>
          table.getColumn('contractName')?.setFilterValue(event.target.value)
        }
        className="h-8 w-[250px]"
      />
      {isFiltered && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => table.resetColumnFilters()}
          className="h-8 px-2 lg:px-3"
        >
          초기화
          <X className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
