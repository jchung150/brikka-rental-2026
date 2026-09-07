'use client';

import type { RequestListItem } from '@/@actions/requests/listRequests';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
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
import { Edit, Eye, MoreHorizontal, Trash2 } from 'lucide-react';

interface CreateRequestsColumnsProps {
  onViewDetails: (request: RequestListItem) => void;
  onEdit: (request: RequestListItem) => void;
  onDelete: (request: RequestListItem) => void;
}

export function createRequestsColumns({
  onViewDetails,
  onEdit,
  onDelete,
}: CreateRequestsColumnsProps): ColumnDef<RequestListItem>[] {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500';
      case 'IN_PROGRESS':
        return 'bg-blue-500';
      case 'COMPLETED':
        return 'bg-green-500';
      case 'CANCELED':
        return 'bg-red-500';
      case 'REJECTED':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '미분류';
      case 'IN_PROGRESS':
        return '처리중';
      case 'COMPLETED':
        return '완료';
      case 'CANCELED':
        return '보류';
      case 'REJECTED':
        return '거부';
      default:
        return '알 수 없음';
    }
  };

  const getRequestTypeLabel = (type: string) => {
    switch (type) {
      case 'COMPLAINT':
        return '민원';
      case 'SUGGESTION':
        return '제안';
      case 'INQUIRY':
        return '문의';
      case 'REPAIR':
        return '수선';
      default:
        return '기타';
    }
  };

  return [
    {
      accessorKey: 'requestId',
      header: '요청 ID',
      cell: ({ row }) => {
        const requestId = row.original.id;
        return <div className="font-medium text-sm">{requestId}</div>;
      },
    },
    {
      accessorKey: 'title',
      header: '요청 내용',
      cell: ({ row }) => {
        const title = row.original.title;
        const description = row.original.details;
        return (
          <div className="max-w-xs">
            <div className="font-medium text-sm">{title}</div>
            {description && (
              <div className="mt-1 truncate text-gray-500 text-xs">
                {description}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'source',
      header: '출처',
      cell: ({ row }) => {
        const source = row.original.requestSource;
        const label = source ? Strings.requestSource[source] : '-';
        return <div className="text-sm">{label}</div>;
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="등록일시" />
      ),
      cell: ({ row }) => {
        const date = row.original.createdAt;
        return <div className="text-sm">{formatters.dateTime(date)}</div>;
      },
    },
    {
      accessorKey: 'status',
      header: '처리 상태',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${getStatusColor(status)}`} />
            <span className="text-sm">{getStatusLabel(status)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'requestType',
      header: '요청 유형',
      cell: ({ row }) => {
        const type = row.original.requestType;
        return <div className="text-sm">{getRequestTypeLabel(type)}</div>;
      },
    },
    {
      id: 'actions',
      header: '더보기',
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
              <DropdownMenuItem onClick={() => onViewDetails(request)}>
                <Eye className="mr-2 h-4 w-4" />
                상세 보기
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(request)}>
                <Edit className="mr-2 h-4 w-4" />
                수정
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(request)}
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
