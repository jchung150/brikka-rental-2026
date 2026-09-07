'use client';

import type { TenantListItem } from '@/@actions/tenants/listTenants';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { formatters } from '@repo/common/formatters';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye, MoreHorizontal, UserCheck, UserX } from 'lucide-react';
import Link from 'next/link';

const leaseStatusVariants: Record<string, string> = {
  PREPARING: 'secondary',
  ACTIVE: 'default',
  TERMINATED: 'destructive',
} as const;

const leaseStatusLabels: Record<string, string> = {
  PREPARING: '준비중',
  ACTIVE: '진행중',
  TERMINATED: '종료',
} as const;

export const createTenantColumns = (): ColumnDef<TenantListItem>[] => [
  {
    accessorKey: 'name',
    header: '이름',
    cell: ({ row }) => {
      const tenant = row.original;
      return (
        <div className="flex items-center space-x-3">
          {tenant.profileImageUrl ? (
            <img
              src={tenant.profileImageUrl}
              alt={tenant.name}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
              <span className="font-medium text-gray-600 text-sm">
                {tenant.name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <div className="font-medium">{tenant.name}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'lease',
    header: '계약명',
    accessorFn: (row) => row.lease?.unit?.building?.name || '',
    cell: ({ row }) => {
      const tenant = row.original;
      const lease = tenant.lease;

      if (!lease) {
        return <span className="text-muted-foreground text-sm">계약 없음</span>;
      }

      return (
        <div className="space-y-1">
          <div className="font-medium text-sm">
            {lease.unit.building.name} {lease.unit.name}
          </div>
          <div className="text-muted-foreground text-xs">
            {formatters.date(lease.startDate)} ~{' '}
            {formatters.date(lease.endDate)}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'phoneNumber',
    header: '연락처',
    cell: ({ row }) => {
      const phoneNumber = row.getValue('phoneNumber') as string | null;
      return phoneNumber || '-';
    },
  },
  {
    accessorKey: 'email',
    header: '이메일',
    cell: ({ row }) => {
      const email = row.getValue('email') as string;
      return <span className="text-sm">{email}</span>;
    },
  },
  {
    accessorKey: 'leaseStatus',
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="계약 상태" />;
    },
    accessorFn: (row) => row.lease?.status || '',
    cell: ({ row }) => {
      const tenant = row.original;
      const status = tenant.lease?.status;

      if (!status) {
        return <span className="text-muted-foreground text-sm">-</span>;
      }

      const statusConfig = {
        label: leaseStatusLabels[status] || status,
        variant:
          (leaseStatusVariants[status] as
            | 'default'
            | 'secondary'
            | 'destructive') || 'default',
      };

      return <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>;
    },
  },
  {
    accessorKey: 'isPortalInvited',
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="입주자 포털 초대" />;
    },
    cell: ({ row }) => {
      const isInvited = row.getValue('isPortalInvited') as boolean;

      return (
        <div className="flex items-center space-x-2">
          {isInvited ? (
            <>
              <UserCheck className="h-4 w-4 text-green-600" />
              <span className="text-green-600 text-sm">초대됨</span>
            </>
          ) : (
            <>
              <UserX className="h-4 w-4 text-gray-400" />
              <span className="text-muted-foreground text-sm">미초대</span>
            </>
          )}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: '더보기',
    cell: ({ row }) => {
      const tenant = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">메뉴 열기</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/users/tenants/${tenant.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                상세 보기
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
