'use client';

import type { TenantListItem } from '@/@actions/tenants/listTenants';
import { DataTable } from '@/components/data-table/data-table';
import { createTenantColumns } from './tenant-columns';
import { TenantListToolbar } from './tenant-list-toolbar';

export function TenantTable({ tenants }: { tenants: TenantListItem[] }) {
  const tenantColumns = createTenantColumns();

  return (
    <DataTable
      columns={tenantColumns}
      data={tenants}
      Toolbar={({ table }) => (
        <TenantListToolbar table={table} tenants={tenants} />
      )}
    />
  );
}
