'use client';
import { deleteParkingSpace } from '@/@actions/parking-spaces/deleteParkingSpace';
import type { BuildingDetailDto } from '@/@data/building';
import { DataTable } from '@/components/data-table/data-table';
import type { LeaseVehicle } from '@repo/database';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';
import type { ColumnDef } from '@tanstack/react-table';
import { Check, MoreVertical, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import ParkingDialog from '../../_components/dialogs/parking-dialog';
import { useBuildingDetailContext } from '../context';

interface ParkingLotSectionProps {
  building: BuildingDetailDto;
}

type ParkingSpace = BuildingDetailDto['ParkingSpaces'][0];

export function ParkingLotSection({ building }: ParkingLotSectionProps) {
  const { refetch } = useBuildingDetailContext();
  const [selectedSpace, setSelectedSpace] = useState<ParkingSpace | null>(null);

  const getSpaceTypeLabel = (type: string) => {
    switch (type) {
      case 'NORMAL':
        return '일반';
      case 'COMPACT':
        return '소형';
      case 'HANDICAPPED':
        return '장애인';
      default:
        return type;
    }
  };

  const getSpaceTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'NORMAL':
        return 'default' as const;
      case 'COMPACT':
        return 'secondary' as const;
      case 'HANDICAPPED':
        return 'destructive' as const;
      default:
        return 'outline' as const;
    }
  };

  const columns: ColumnDef<ParkingSpace>[] = [
    {
      accessorKey: 'spaceName',
      header: '주차면 이름',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('spaceName')}</div>
      ),
    },
    {
      accessorKey: 'spaceType',
      header: '주차면 유형',
      cell: ({ row }) => (
        <Badge variant={getSpaceTypeBadgeVariant(row.getValue('spaceType'))}>
          {getSpaceTypeLabel(row.getValue('spaceType'))}
        </Badge>
      ),
    },
    {
      header: '지정 여부',
      cell: ({ row }) => {
        const LeaseVehicle = row.getValue(
          'LeaseVehicle'
        ) as LeaseVehicle | null;
        return LeaseVehicle ? (
          <div className="flex items-center text-green-600">
            <Check className="mr-1 h-4 w-4" />
            지정됨
          </div>
        ) : (
          <div className="flex items-center text-gray-400">
            <X className="mr-1 h-4 w-4" />
            미지정
          </div>
        );
      },
    },
    {
      accessorKey: 'unitName',
      header: '유닛 이름',
      cell: ({ row }) => {
        return row.original.LeaseVehicle
          ? row.original.LeaseVehicle.Lease.Unit.name
          : '-';
      },
    },
    {
      accessorKey: 'memo',
      header: '메모',
      cell: ({ row }) => {
        const memo = row.getValue('memo') as string | null;
        return memo || '-';
      },
    },
    {
      id: 'actions',
      header: '더보기',
      cell: ({ row }) => {
        const space = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(space)}>
                수정
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(space.id.toString())}
                className="text-red-600"
              >
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const handleEdit = (space: ParkingSpace) => {
    setSelectedSpace(space);
  };

  const handleDelete = async (spaceId: string) => {
    if (!confirm('정말로 이 주차면을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const result = await deleteParkingSpace({ id: spaceId });

      if (result.ok) {
        toast.success('주차면이 삭제되었습니다.');
        refetch();
      } else {
        toast.error(result.message || '삭제 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Delete parking space failed:', error);
      toast.error('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleSuccess = () => {
    setSelectedSpace(null);
    refetch();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="font-semibold text-lg">주차장</CardTitle>
        <ParkingDialog
          mode="create"
          buildingId={building.id.toString()}
          onSuccess={handleSuccess}
          trigger={
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              주차면 등록
            </Button>
          }
        />
      </CardHeader>
      <CardContent>
        {building.ParkingSpaces && building.ParkingSpaces.length > 0 ? (
          <DataTable
            columns={columns}
            data={building.ParkingSpaces}
            pageSize={5}
          />
        ) : (
          <div className="py-8 text-center text-gray-500">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <span className="text-2xl">🚗</span>
            </div>
            <p className="text-sm">등록된 주차면이 없습니다.</p>
            <p className="mt-1 text-gray-400 text-xs">
              + 주차면 등록 버튼을 클릭하여 주차면을 추가해보세요.
            </p>
          </div>
        )}
      </CardContent>

      {/* 수정 다이얼로그 */}
      {selectedSpace && (
        <ParkingDialog
          mode="edit"
          buildingId={building.id.toString()}
          parkingSpace={{
            id: selectedSpace.id.toString(),
            spaceName: selectedSpace.spaceName,
            spaceType: selectedSpace.spaceType,
            memo: selectedSpace.memo,
          }}
          onSuccess={handleSuccess}
          open={!!selectedSpace}
          onOpenChange={(open) => !open && setSelectedSpace(null)}
        />
      )}
    </Card>
  );
}
