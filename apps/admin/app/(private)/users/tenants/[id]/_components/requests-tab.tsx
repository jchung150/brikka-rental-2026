'use client';

import type {
  RequestWithUnitAndBuilding,
  TenantDetail,
} from '@/@actions/tenants/getTenantDetail';
import { DataTable } from '@/components/data-table/data-table';
import { formatters } from '@repo/common/formatters';
import { Strings } from '@repo/common/strings';
import {} from '@repo/design-system/components/ui/card';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';

interface RequestsTabProps {
  tenant: TenantDetail;
}

export function RequestsTab({ tenant }: RequestsTabProps) {
  const requests = useMemo(() => {
    return tenant.Requests;
  }, [tenant]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">요청 목록</h2>
      </div>

      <DataTable columns={requestColumns} data={requests} />
    </div>
  );
}

const requestColumns: ColumnDef<RequestWithUnitAndBuilding>[] = [
  {
    accessorKey: 'id',
    header: '요청 ID',
  },
  {
    accessorKey: 'title',
    header: '요청 제목',
  },
  {
    header: '출처',
    accessorFn: (row) =>
      row.requestSource ? Strings.requestSource[row.requestSource] : '-',
  },
  {
    header: '유닛고유번호',
    accessorFn: (row) => row.Unit?.unitNumber || '-',
  },
  {
    header: '등록일시',
    accessorFn: (row) => formatters.dateTime(row.createdAt),
  },
  {
    header: '처리상태',
    accessorFn: (row) => Strings.requestStatus[row.status],
  },
  {
    header: '요청유형',
    accessorFn: (row) =>
      row.requestType ? Strings.requestType[row.requestType] : '-',
  },
];
