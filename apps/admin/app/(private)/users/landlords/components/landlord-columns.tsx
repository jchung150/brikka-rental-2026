'use client';

import type { LandlordListItem } from '@/@actions/landlords/listLandlords';
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

const contractStatusVariants: Record<string, string> = {
  active: 'default',
  expired: 'destructive',
  upcoming: 'secondary',
  none: 'outline',
} as const;

const contractStatusLabels: Record<string, string> = {
  active: '진행중',
  expired: '만료',
  upcoming: '예정',
  none: '없음',
} as const;

function getContractStatus(
  startDate: Date | null,
  endDate: Date | null
): { status: string; label: string; variant: string } {
  if (!startDate || !endDate) {
    return {
      status: 'none',
      label: contractStatusLabels.none,
      variant: contractStatusVariants.none,
    };
  }

  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) {
    return {
      status: 'upcoming',
      label: contractStatusLabels.upcoming,
      variant: contractStatusVariants.upcoming,
    };
  } else if (now > end) {
    return {
      status: 'expired',
      label: contractStatusLabels.expired,
      variant: contractStatusVariants.expired,
    };
  } else {
    return {
      status: 'active',
      label: contractStatusLabels.active,
      variant: contractStatusVariants.active,
    };
  }
}

export const createLandlordColumns = (): ColumnDef<LandlordListItem>[] => [
  {
    accessorKey: 'name',
    header: '이름',
    cell: ({ row }) => {
      const landlord = row.original;
      return (
        <div className="flex items-center space-x-3">
          {landlord.profileImageUrl ? (
            <img
              src={landlord.profileImageUrl}
              alt={landlord.name}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
              <span className="font-medium text-gray-600 text-sm">
                {landlord.name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <div className="font-medium">{landlord.name}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'ownedBuildings',
    header: '소유 건물명',
    accessorFn: (row) => row.ownedBuildings.map((b) => b.name).join(', '),
    cell: ({ row }) => {
      const buildings = row.original.ownedBuildings;

      if (buildings.length === 0) {
        return (
          <span className="text-muted-foreground text-sm">소유 건물 없음</span>
        );
      }

      return (
        <div className="space-y-1">
          {buildings.slice(0, 2).map((building) => (
            <div key={building.id} className="font-medium text-sm">
              {building.name}
            </div>
          ))}
          {buildings.length > 2 && (
            <div className="text-muted-foreground text-xs">
              +{buildings.length - 2}개 더
            </div>
          )}
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
    accessorKey: 'managementContract',
    header: ({ column }) => {
      return (
        <DataTableColumnHeader column={column} title="관리 위임계약기간" />
      );
    },
    accessorFn: (row) => {
      const { managementContractStartDate, managementContractEndDate } = row;
      if (!managementContractStartDate || !managementContractEndDate) {
        return 'none';
      }
      return getContractStatus(
        managementContractStartDate,
        managementContractEndDate
      ).status;
    },
    cell: ({ row }) => {
      const landlord = row.original;
      const { startDate, endDate } = {
        startDate: landlord.managementContractStartDate,
        endDate: landlord.managementContractEndDate,
      };

      const contractStatus = getContractStatus(startDate, endDate);

      return (
        <div className="space-y-1">
          <Badge variant={contractStatus.variant as any}>
            {contractStatus.label}
          </Badge>
          {startDate && endDate && (
            <div className="text-muted-foreground text-xs">
              {formatters.date(startDate)} ~ {formatters.date(endDate)}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'isPortalInvited',
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="임대인 포털 초대" />;
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
      const landlord = row.original;

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
              <Link href={`/users/landlords/${landlord.id}`}>
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
