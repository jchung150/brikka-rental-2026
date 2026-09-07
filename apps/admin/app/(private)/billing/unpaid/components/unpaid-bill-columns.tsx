'use client';

import type { BillListItem } from '@/@actions/bills/listBills';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { formatters } from '@repo/common/formatters';
import { Strings } from '@repo/common/strings';
import type { BillStatus, LeaseStatus } from '@repo/database';
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
import dayjs from 'dayjs';
import { Edit, MessageSquare, MoreHorizontal } from 'lucide-react';

export function createUnpaidBillColumns(): ColumnDef<BillListItem>[] {
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
        const contractName = `${buildingName} ${unitNumber}호-${tenantName}`;
        return (
          <div className="max-w-[250px] truncate font-medium">
            {contractName}
          </div>
        );
      },
    },
    {
      accessorKey: 'leaseStatus',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="계약 상태" />
      ),
      cell: ({ row }) => {
        const status = row.original.Lease.status;
        const statusConfig = getLeaseStatusConfig(status);

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
        return (
          <div className="text-sm">
            {row.original.LeaseBillingSchedule.itemName}
          </div>
        );
      },
    },
    {
      accessorKey: 'recurrenceType',
      header: '발복주기',
      cell: ({ row }) => {
        const schedule = row.original.LeaseBillingSchedule;
        const typeLabel = Strings.recurrenceType[schedule.recurrenceType];
        const periodLabel = schedule.recurrencePeriod
          ? ` (${Strings.recurrencePeriod[schedule.recurrencePeriod]})`
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
      accessorKey: 'totalAmount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="청구액" />
      ),
      cell: ({ row }) => {
        const amount = row.original.totalAmount;
        return <div className="font-medium">{formatters.currency(amount)}</div>;
      },
    },
    {
      accessorKey: 'paidAmount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="수납액" />
      ),
      cell: ({ row }) => {
        const payments = row.original.Payments;
        const paidAmount = payments.reduce((sum, p) => sum + p.amountPaid, 0);
        return (
          <div className="font-medium">{formatters.currency(paidAmount)}</div>
        );
      },
    },
    {
      accessorKey: 'unpaidAmount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="미납액" />
      ),
      cell: ({ row }) => {
        const totalAmount = row.original.totalAmount;
        const payments = row.original.Payments;
        const paidAmount = payments.reduce((sum, p) => sum + p.amountPaid, 0);
        const unpaidAmount = totalAmount - paidAmount;
        return (
          <div className="font-medium text-red-600">
            {formatters.currency(unpaidAmount)}
          </div>
        );
      },
    },
    {
      accessorKey: 'dueDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="납부 마감일" />
      ),
      cell: ({ row }) => {
        const dueDate = new Date(row.original.dueDate).toLocaleDateString(
          'ko-KR'
        );
        return <div className="text-sm">{dueDate}</div>;
      },
    },
    {
      accessorKey: 'overdueDays',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="경과 일수" />
      ),
      cell: ({ row }) => {
        const dueDate = dayjs(row.original.dueDate);
        const now = dayjs();
        const diffDays = now.diff(dueDate, 'day');

        if (diffDays < 0) {
          return (
            <div className="text-blue-600 text-sm">
              {Math.abs(diffDays)}일 남음
            </div>
          );
        }
        if (diffDays === 0) {
          return <div className="text-sm text-yellow-600">오늘 마감</div>;
        }
        return <div className="text-red-600 text-sm">{diffDays}일 경과</div>;
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="납부 상태" />
      ),
      cell: ({ row }) => {
        const status = row.original.status;
        const statusConfig = getBillStatusConfig(status);

        return (
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${statusConfig.color}`} />
            <span className="text-sm">{statusConfig.label}</span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: '더보기',
      cell: ({ row }) => {
        const bill = row.original;

        const handleSendNotification = () => {
          // TODO: 알림 발송
        };

        const handleEdit = () => {
          // TODO: 수정
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
              <DropdownMenuLabel>
                {bill.LeaseBillingSchedule.itemName}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSendNotification}>
                <MessageSquare className="mr-2 h-4 w-4" />
                알림 발송
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                수정
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}

function getLeaseStatusConfig(status: string) {
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

function getBillStatusConfig(status: string) {
  const label = Strings.billStatus[status as BillStatus];
  switch (status) {
    case 'PAID':
      return {
        label,
        color: 'bg-green-500',
      };
    case 'UNPAID':
      return {
        label,
        color: 'bg-yellow-500',
      };
    case 'OVERDUE':
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
