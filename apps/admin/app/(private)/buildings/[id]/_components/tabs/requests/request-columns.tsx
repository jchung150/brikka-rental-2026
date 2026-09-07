'use client';

import type { RequestListItem } from '@/@actions/requests/listRequests';
import {
  formatRequestDate,
  getRequestStatusColor,
  requestStatusLabels,
  requestTypeLabels,
} from '@/@data/request';
import { Badge } from '@repo/design-system/components/ui/badge';
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
import { MoreHorizontal } from 'lucide-react';

export const requestColumns: ColumnDef<RequestListItem>[] = [
  {
    accessorKey: 'id',
    header: '요청 ID',
    cell: ({ row }) => {
      const id = row.getValue('id') as string;
      return <div className="font-medium">{id}</div>;
    },
  },
  {
    accessorKey: 'details',
    header: '요청 내용',
    cell: ({ row }) => {
      const details = row.getValue('details') as string;
      return (
        <div className="max-w-xs truncate text-sm" title={details}>
          {details}
        </div>
      );
    },
  },
  {
    accessorKey: 'source',
    header: '출처',
    cell: ({ row }) => {
      const source = row.getValue('source') as string;
      return <div className="text-gray-600 text-sm">{source}</div>;
    },
  },
  {
    accessorKey: 'unitName',
    header: '유닛 이름',
    cell: ({ row }) => {
      const unitName = row.getValue('unitName') as string | null;
      return <div className="text-gray-600 text-sm">{unitName || '-'}</div>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: '등록 일시',
    cell: ({ row }) => {
      const createdAt = row.getValue('createdAt') as string;
      return <div className="text-sm">{formatRequestDate(createdAt)}</div>;
    },
  },
  {
    accessorKey: 'status',
    header: '처리 상태',
    cell: ({ row }) => {
      const status = row.getValue('status') as
        | 'PENDING'
        | 'IN_PROGRESS'
        | 'COMPLETED'
        | 'CANCELED';
      return (
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${getRequestStatusColor(status).replace('text-', 'bg-')}`}
          />
          <span className={`text-sm ${getRequestStatusColor(status)}`}>
            {requestStatusLabels[status]}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'requestType',
    header: '요청 유형',
    cell: ({ row }) => {
      const requestType = row.getValue('requestType') as
        | 'REPAIR'
        | 'COMPLAINT'
        | 'INQUIRY';
      return <Badge variant="outline">{requestTypeLabels[requestType]}</Badge>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const request = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">메뉴 열기</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>작업</DropdownMenuLabel>
            <DropdownMenuItem>상세 보기</DropdownMenuItem>
            <DropdownMenuItem>수정</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">삭제</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
