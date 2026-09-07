import type { BillingScheduleListItem } from '@/@actions/lease/listBillingSchedules';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { getNextBillingDate } from '@/lib/billing';
import { formatters } from '@repo/common/formatters';
import { Strings } from '@repo/common/strings';
import { Button } from '@repo/design-system/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';

interface CreateBillingItemsColumnsProps {
  onEdit: (item: BillingScheduleListItem) => void;
  onDelete: (item: BillingScheduleListItem) => void;
}

export function createBillingItemsColumns({
  onEdit,
  onDelete,
}: CreateBillingItemsColumnsProps): ColumnDef<BillingScheduleListItem>[] {
  return [
    {
      accessorKey: 'nextBillingDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="다음 납부일" />
      ),
      cell: ({ row }) => {
        const nextBillingDate = getNextBillingDate(row.original);
        return (
          <div className="text-sm">{formatters.date(nextBillingDate)}</div>
        );
      },
    },
    {
      accessorKey: 'billingItem',
      header: '청구항목',
      cell: ({ row }) => {
        const item = row.original.itemName;
        return <div className="font-medium text-sm">{item}</div>;
      },
    },
    {
      accessorKey: 'recurrenceType',
      header: '반복 유형',
      cell: ({ row }) => {
        const recurrenceType = row.original.recurrenceType;
        return (
          <div className="text-sm">
            {Strings.recurrenceType[recurrenceType]}
          </div>
        );
      },
    },
    {
      accessorKey: 'recurrencePeriod',
      header: '반복 주기',
      cell: ({ row }) => {
        const recurrencePeriod = row.original.recurrencePeriod;
        if (!recurrencePeriod) return '-';
        return (
          <div className="text-sm">
            {Strings.recurrencePeriod[recurrencePeriod]}
          </div>
        );
      },
    },
    {
      accessorKey: 'notificationDays',
      header: '납부 알림 설정',
      cell: ({ row }) => {
        const days = row.original.notificationDays;
        return days ? <div className="text-sm">{days}일 전에 발송</div> : '-';
      },
    },
    {
      accessorKey: 'amount',
      header: '청구액',
      cell: ({ row }) => {
        const amount = row.original.amount;
        return (
          <div className="font-medium text-sm">
            {formatters.currency(amount)}
          </div>
        );
      },
    },
    {
      accessorKey: 'vatIncluded',
      header: '부가세 포함',
      cell: ({ row }) => {
        const amount = row.original.amount;
        const vatIncluded = amount * 1.1;
        return (
          <div className="font-medium text-sm">
            {formatters.currency(vatIncluded)}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: '더보기',
      cell: ({ row }) => {
        const item = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">메뉴 열기</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Edit className="mr-2 h-4 w-4" />
                수정
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(item)}
                className="text-red-600"
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
