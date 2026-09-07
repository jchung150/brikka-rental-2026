'use client';

import type { LeaseLedgerTransaction } from '@/@actions/lease/getLeaseLedger';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Button } from '@repo/design-system/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye, MoreHorizontal } from 'lucide-react';

interface CreateLedgerColumnsProps {
  onViewDetails: (transaction: LeaseLedgerTransaction) => void;
}

export function createLedgerColumns({
  onViewDetails,
}: CreateLedgerColumnsProps): ColumnDef<LeaseLedgerTransaction>[] {
  const formatCurrency = (amount: number) => {
    if (amount === 0) return '-';
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'RECEIPT':
        return '수납';
      case 'BILLING':
        return '청구';
      default:
        return '알 수 없음';
    }
  };

  return [
    {
      accessorKey: 'date',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="날짜" />
      ),
      cell: ({ row }) => {
        const date = row.original.date;
        return <div className="text-sm">{formatDate(date)}</div>;
      },
    },
    {
      accessorKey: 'transactionType',
      header: '수납',
      cell: ({ row }) => {
        const type = row.original.transactionType;
        return <div className="text-sm">{getTransactionTypeLabel(type)}</div>;
      },
    },
    {
      accessorKey: 'billingItem',
      header: '청구항목',
      cell: ({ row }) => {
        const item = row.original.billingItem;
        return <div className="font-medium text-sm">{item}</div>;
      },
    },
    {
      accessorKey: 'referenceNumber',
      header: '거래 번호',
      cell: ({ row }) => {
        const refNumber = row.original.referenceNumber;
        return <div className="text-sm">{refNumber}</div>;
      },
    },
    {
      accessorKey: 'increase',
      header: '증가',
      cell: ({ row }) => {
        const increase = row.original.increase;
        return (
          <div className="font-medium text-green-600 text-sm">
            {formatCurrency(increase)}
          </div>
        );
      },
    },
    {
      accessorKey: 'decrease',
      header: '감소',
      cell: ({ row }) => {
        const decrease = row.original.decrease;
        return (
          <div className="font-medium text-red-600 text-sm">
            {formatCurrency(decrease)}
          </div>
        );
      },
    },
    {
      accessorKey: 'balance',
      header: '잔액',
      cell: ({ row }) => {
        const balance = row.original.balance;
        return (
          <div className="font-medium text-sm">{formatCurrency(balance)}</div>
        );
      },
    },
    {
      id: 'actions',
      header: '더보기',
      cell: ({ row }) => {
        const transaction = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">메뉴 열기</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails(transaction)}>
                <Eye className="mr-2 h-4 w-4" />
                상세 보기
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
