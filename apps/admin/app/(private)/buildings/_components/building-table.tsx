'use client';
import type { BuildingDto } from '@/@data/building';
import { DataTable } from '@/components/data-table/data-table';
import { columns } from './building-columns';
import { BuildingsToolbar } from './building-toolbar';

export function BuildingsTable({ items }: { items: BuildingDto[] }) {
  return (
    <DataTable columns={columns} data={items} Toolbar={BuildingsToolbar} />
  );
}
