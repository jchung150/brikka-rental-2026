'use client';

import type { RequestListItem } from '@/@actions/requests/listRequests';
import { DataTable } from '@/components/data-table/data-table';
import { requestColumns } from './request-columns';
import { RequestToolbar } from './request-toolbar';

interface RequestTableProps {
  items: RequestListItem[];
  onAddRequest: () => void;
}

export function RequestTable({ items, onAddRequest }: RequestTableProps) {
  return (
    <DataTable
      columns={requestColumns}
      data={items}
      Toolbar={({ table }) => (
        <RequestToolbar table={table} onAddRequest={onAddRequest} />
      )}
    />
  );
}
