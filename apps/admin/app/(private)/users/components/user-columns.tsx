'use client';

import type { UserListItem } from '@/@actions/users/listUsers';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { formatters } from '@repo/common/formatters';
import { Strings } from '@repo/common/strings';
import type { UserRole } from '@repo/database/generated/client';
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
import { Edit, Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import Link from 'next/link';

const userRoleVariants: Record<UserRole, string> = {
  ADMIN: 'destructive',
  MANAGER: 'secondary',
  TENANT: 'outline',
  LANDLORD: 'outline',
} as const;

export const createUserColumns = (): ColumnDef<UserListItem>[] => [
  {
    accessorKey: 'name',
    header: '이름',
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center space-x-3">
          {user.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt={user.name}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
              <span className="font-medium text-gray-600 text-sm">
                {user.name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <div className="font-medium">{user.name}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'userRole',
    header: '역할',
    filterFn: (row, columnId, filterValue, addMeta) => {
      if (filterValue.includes(',')) {
        return filterValue
          .split(',')
          .includes(row.getValue(columnId) as UserRole);
      }
      const role = row.getValue(columnId) as UserRole;
      return role === filterValue;
    },
    cell: ({ row }) => {
      const role = row.getValue('userRole') as UserRole;
      return (
        <Badge
          variant={
            userRoleVariants[role] as
              | 'default'
              | 'secondary'
              | 'destructive'
              | 'outline'
          }
        >
          {Strings.userRole[role]}
        </Badge>
      );
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
    accessorKey: 'phoneNumber',
    header: '연락처',
    cell: ({ row }) => {
      const phoneNumber = row.getValue('phoneNumber') as string | null;
      return phoneNumber || '-';
    },
  },
  {
    accessorKey: 'createdAt',
    header: '가입일',
    accessorFn: (row) => formatters.dateTime(row.createdAt),
  },
  {
    accessorKey: 'updatedAt',
    header: '마지막 로그인',
    accessorFn: (row) => formatters.dateTime(row.updatedAt),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="계정 상태" />;
    },
    cell: ({ row }) => {
      // 임시로 다양한 상태를 표시 (실제로는 사용자 상태 필드가 필요)
      // TODO: 실제 사용자 상태 필드 추가 후 수정 필요
      const user = row.original;
      const statuses = ['active', 'inactive', 'blocked'];
      const status = statuses[Number.parseInt(user.id) % 3]; // 임시로 ID 기반으로 상태 결정

      const statusConfig = {
        active: { label: '활성', variant: 'default' as const },
        inactive: { label: '비활성', variant: 'secondary' as const },
        blocked: { label: '접근 차단', variant: 'destructive' as const },
      };

      const config =
        statusConfig[status as keyof typeof statusConfig] ||
        statusConfig.active;
      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
  },
  {
    accessorKey: 'accessibleBuildings',
    header: '접근 가능 건물',
    cell: ({ row }) => {
      const user = row.original;

      if (user.userRole === 'ADMIN') {
        return <span className="text-muted-foreground text-sm">모든 건물</span>;
      }

      if (user.accessibleBuildings.length === 0) {
        return <span className="text-muted-foreground text-sm">-</span>;
      }

      return (
        <div className="flex flex-wrap gap-1">
          {user.accessibleBuildings.map((building) => (
            <Badge key={building.id} variant="outline" className="text-xs">
              {building.name}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: '더보기',
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">메뉴 열기</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>액션</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/users/${user.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                상세 보기
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/users/${user.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                수정
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
