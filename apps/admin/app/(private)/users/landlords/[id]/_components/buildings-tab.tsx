'use client';

import type { LandlordDetail } from '@/@actions/landlords/getLandlordDetail';
import { DataTable } from '@/components/data-table/data-table';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import {} from '@repo/design-system/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye, MapPin, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

interface BuildingsTabProps {
  landlord: LandlordDetail;
}

type BuildingItem = {
  id: number;
  name: string;
  address: string;
  buildingType: string | null;
  totalUnits: number;
};

function BuildingsToolbar() {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-semibold text-lg">소유 건물</h2>
    </div>
  );
}

export function BuildingsTab({ landlord }: BuildingsTabProps) {
  const buildings = useMemo(() => {
    return landlord.BuildingOwnerships.map((ownership) => {
      const building = ownership.Building;
      const totalUnits = building.Units.length;

      return {
        id: Number(building.id),
        name: building.name,
        address: building.address,
        buildingType: building.buildingType,
        totalUnits,
      };
    });
  }, [landlord.BuildingOwnerships]);

  const columns: ColumnDef<BuildingItem>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: '건물명',
      },
      {
        accessorKey: 'address',
        header: '건물 주소',
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{row.getValue('address')}</span>
          </div>
        ),
      },
      {
        accessorKey: 'buildingType',
        header: '건물 구분',
        cell: ({ row }) => {
          const buildingType = row.getValue('buildingType') as string | null;
          return <Badge variant="secondary">{buildingType || '-'}</Badge>;
        },
      },
      {
        id: 'actions',
        header: '더보기',
        cell: ({ row }) => {
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
                  <Link href={`/buildings/${row.original.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    상세보기
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <DataTable
        columns={columns}
        data={buildings}
        Toolbar={BuildingsToolbar}
        pageSize={10}
      />
    </div>
  );
}
