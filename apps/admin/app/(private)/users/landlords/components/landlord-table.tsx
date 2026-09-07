'use client';

import type { LandlordListItem } from '@/@actions/landlords/listLandlords';
import { DataTable } from '@/components/data-table/data-table';
import { createLandlordColumns } from './landlord-columns';
import { LandlordListToolbar } from './landlord-list-toolbar';

export function LandlordTable({
  landlords,
}: { landlords: LandlordListItem[] }) {
  const landlordColumns = createLandlordColumns();

  return (
    <DataTable
      columns={landlordColumns}
      data={landlords}
      Toolbar={({ table }) => (
        <LandlordListToolbar table={table} landlords={landlords} />
      )}
    />
  );
}
