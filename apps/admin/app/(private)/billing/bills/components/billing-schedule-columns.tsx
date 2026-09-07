'use client';

import type { BillingScheduleListItem } from '@/@actions/lease/listBillingSchedules';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { formatters } from '@repo/common/formatters';
import { Strings } from '@repo/common/strings';
import type { LeaseStatus } from '@repo/database';
import { Button } from '@repo/design-system/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';

export function createBillingScheduleColumns(): ColumnDef<BillingScheduleListItem>[] {
  return [
    {
      accessorKey: 'contractName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="계약명" />
      ),
      cell: ({ row }) => {
        const item = row.original;
        const buildingName = item.Lease.Unit.Building.name;
        const unitNumber = item.Lease.Unit.unitNumber;
        const tenantName = item.Lease.LeaseTenants[0]?.Tenant.name || '미지정';
        const contractName = `${buildingName} ${unitNumber}호 - ${tenantName}`;
        return (
          <div className="max-w-[300px] truncate font-medium">
            {contractName}
          </div>
        );
      },
    },
    {
      accessorKey: 'dueDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="다음 납부일" />
      ),
      cell: ({ row }) => {
        const dueDate = new Date(row.original.dueDate).toLocaleDateString(
          'ko-KR'
        );
        return <div className="text-sm">{dueDate}</div>;
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="계약 상태" />
      ),
      cell: ({ row }) => {
        const status = row.original.Lease.status;
        const statusConfig = getStatusConfig(status);

        return (
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${statusConfig.color}`} />
            <span className="text-sm">{statusConfig.label}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'itemName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="청구 항목" />
      ),
      cell: ({ row }) => {
        return <div className="text-sm">{row.original.itemName}</div>;
      },
    },
    {
      accessorKey: 'recurrenceType',
      header: '발생주기',
      cell: ({ row }) => {
        const { recurrenceType, recurrencePeriod } = row.original;
        const typeLabel = Strings.recurrenceType[recurrenceType];
        const periodLabel = recurrencePeriod
          ? ` (${Strings.recurrencePeriod[recurrencePeriod]})`
          : '';
        return (
          <div className="text-sm">
            {typeLabel}
            {periodLabel}
          </div>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="청구액" />
      ),
      cell: ({ row }) => {
        const amount = row.original.amount;
        return <div className="font-medium">{formatters.currency(amount)}</div>;
      },
    },
    {
      accessorKey: 'isTaxable',
      header: '부가세 포함 여부',
      cell: ({ row }) => {
        const isTaxable = row.original.isTaxable;
        return <div className="text-sm">{isTaxable ? '포함' : '미포함'}</div>;
      },
    },
    {
      id: 'actions',
      header: '더보기',
      cell: ({ row }) => {
        const schedule = row.original;

        const handleEdit = () => {
          // TODO: 수정 다이얼로그 열기
        };

        const handleDelete = () => {
          // TODO: 삭제 확인 다이얼로그
        };

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">메뉴 열기</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{schedule.itemName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                수정
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}

function getStatusConfig(status: string) {
  const label = Strings.leaseStatus[status as LeaseStatus];
  switch (status) {
    case 'PREPARING':
      return {
        label,
        color: 'bg-yellow-500',
      };
    case 'ACTIVE':
      return {
        label,
        color: 'bg-blue-500',
      };
    case 'COMPLETED':
      return {
        label,
        color: 'bg-gray-500',
      };
    case 'TERMINATED':
      return {
        label,
        color: 'bg-red-500',
      };
    default:
      return {
        label: '알 수 없음',
        color: 'bg-gray-400',
      };
  }
}
