'use client';

import type { UnitListItem } from '@/@data/unit';
import {
  formatArea,
  getUnitStatusVariant,
  unitStatusLabels,
} from '@/@data/unit';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';
import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';

interface UnitColumnsProps {
  onEdit: (unit: UnitListItem) => void;
  onDelete: (unit: UnitListItem) => void;
}

export const createUnitColumns = ({
  onEdit,
  onDelete,
}: UnitColumnsProps): ColumnDef<UnitListItem>[] => [
  {
    accessorKey: 'name',
    header: '유닛 이름',
    cell: ({ row }) => {
      const name = row.getValue('name') as string | null;
      return (
        <div className="font-medium">{name || row.original.unitNumber}</div>
      );
    },
  },
  {
    accessorKey: 'unitType',
    header: '유닛 유형',
    cell: ({ row }) => {
      const unitType = row.getValue('unitType') as string | null;
      return <div className="text-gray-600 text-sm">{unitType || '-'}</div>;
    },
  },
  {
    accessorKey: 'address',
    header: '유닛 주소',
    cell: ({ row }) => {
      const address = row.getValue('address') as string;
      return (
        <div className="max-w-xs truncate text-gray-600 text-sm">{address}</div>
      );
    },
  },
  {
    accessorKey: 'exclusiveAreaSqm',
    header: '전용 면적',
    cell: ({ row }) => {
      const exclusiveAreaSqm = row.getValue('exclusiveAreaSqm') as
        | number
        | null;
      return <div className="text-sm">{formatArea(exclusiveAreaSqm)}</div>;
    },
  },
  {
    accessorKey: 'status',
    header: '유닛 상태',
    cell: ({ row }) => {
      const status = row.getValue('status') as 'VACANT' | 'OCCUPIED';
      return (
        <Badge variant={getUnitStatusVariant(status)}>
          {unitStatusLabels[status]}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'representativeTenantName',
    header: '대표 입주자 이름',
    cell: ({ row }) => {
      const name = row.getValue('representativeTenantName') as string | null;
      return <div className="text-gray-600 text-sm">{name || '-'}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const unit = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">메뉴 열기</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* <DropdownMenuLabel>작업</DropdownMenuLabel> */}
            <DropdownMenuItem onClick={() => onEdit(unit)}>
              수정
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => onDelete(unit)}
            >
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
