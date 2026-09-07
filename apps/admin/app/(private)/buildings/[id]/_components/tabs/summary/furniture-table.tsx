'use client';

import {
  type BuildingApplianceFurnitureEntity,
  deleteBuildingApplianceFurniture,
} from '@/@actions/appliances-furniture';
import { Namespace } from '@/@hooks/query-keys';
import { useBuildingFurnitures } from '@/@hooks/use-building-furnitures';
import FurnitureDialog from '@/app/(private)/buildings/_components/dialogs/furniture-dialog';
import { DataTable } from '@/components/data-table/data-table';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import {} from '@repo/design-system/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';
import { useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { MoreVertical } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

export function ApplianceFurnitureTable({
  buildingId,
  scope,
}: {
  buildingId: number;
  scope?: 'BUILDING_COMMON' | 'UNIT_COMMON' | 'UNIT_EXCLUSIVE';
}) {
  const [selectedApplianceFurniture, setSelectedApplianceFurniture] =
    useState<BuildingApplianceFurnitureEntity | null>(null);
  const { data, isLoading, error } = useBuildingFurnitures(
    Number(buildingId),
    scope
  );

  const items = useMemo(() => {
    return data || [];
  }, [data]);

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'APPLIANCE':
        return '가전제품';
      case 'FURNITURE':
        return '가구';
      default:
        return category;
    }
  };

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'APPLIANCE':
        return 'default' as const;
      case 'FURNITURE':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  const getUsageScopeLabel = (item: BuildingApplianceFurnitureEntity) => {
    switch (item.usageScope) {
      case 'BUILDING_COMMON':
        return '건물 공용';
      case 'UNIT_COMMON':
        return '유닛 공통';
      case 'UNIT_EXCLUSIVE':
        return '유닛 전용';
      default:
        return '미분류';
    }
  };

  const getUsageScopeBadgeVariant = (
    item: BuildingApplianceFurnitureEntity
  ) => {
    switch (item.usageScope) {
      case 'BUILDING_COMMON':
        return 'default' as const;
      case 'UNIT_COMMON':
        return 'secondary' as const;
      case 'UNIT_EXCLUSIVE':
        return 'destructive' as const;
      default:
        return 'outline' as const;
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('ko-KR');
  };

  const handleEdit = (item: BuildingApplianceFurnitureEntity) => {
    setSelectedApplianceFurniture(item);
  };

  const handleDelete = async (itemId: number) => {
    const result = await deleteBuildingApplianceFurniture(itemId);
    if (result.ok) {
      toast.success('가전제품 및 가구가 삭제되었습니다.');
    } else {
      toast.error(result.message || '삭제 중 오류가 발생했습니다.');
    }
  };

  const columns: ColumnDef<BuildingApplianceFurnitureEntity>[] = [
    {
      accessorKey: 'ApplianceFurniture.category',
      header: '제품 구분',
      cell: ({ row }) => {
        const category = row.original.ApplianceFurniture.category;
        return (
          <Badge variant={getCategoryBadgeVariant(category)}>
            {getCategoryLabel(category)}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'usageScope',
      header: '사용 범위',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <Badge variant={getUsageScopeBadgeVariant(item)}>
            {getUsageScopeLabel(item)}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'ApplianceFurniture.name',
      header: '제품명',
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            {row.original.ApplianceFurniture.name}
          </div>
        );
      },
    },
    {
      accessorKey: 'quantity',
      header: '수량',
      cell: ({ row }) => {
        return <div>{row.original.quantity}</div>;
      },
    },
    {
      accessorKey: 'Manufacturer.name',
      header: '제조사',
      cell: ({ row }) => {
        return <div>{row.original.Manufacturer.name}</div>;
      },
    },
    {
      accessorKey: 'Location.name',
      header: '설치 위치',
      cell: ({ row }) => {
        return <div>{row.original.Location?.name || '-'}</div>;
      },
    },
    {
      accessorKey: 'installationDate',
      header: '설치 일자',
      cell: ({ row }) => {
        return <div>{formatDate(row.original.installationDate)}</div>;
      },
    },
    {
      id: 'actions',
      header: '더보기',
      cell: ({ row }) => {
        const itemId = row.original.id;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(row.original)}>
                수정
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(Number(itemId))}
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

  if (error) {
    return <div>오류가 발생했습니다.</div>;
  }

  if (!items || items.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <span className="text-2xl">🏠</span>
        </div>
        <p className="text-sm">등록된 가전제품 및 가구가 없습니다.</p>
        <p className="mt-1 text-gray-400 text-xs">
          + 가전제품 및 가구 등록 버튼을 클릭하여 항목을 추가해보세요.
        </p>
      </div>
    );
  }

  return (
    <>
      <DataTable columns={columns} data={items} pageSize={5} />
      {selectedApplianceFurniture && (
        <Dialog
          item={selectedApplianceFurniture}
          onClose={() => setSelectedApplianceFurniture(null)}
        />
      )}
    </>
  );
}

const Dialog = ({
  item,
  onClose,
}: { item: BuildingApplianceFurnitureEntity; onClose: () => void }) => {
  const [open, setOpen] = useState(true);
  const queryClient = useQueryClient();

  return (
    <FurnitureDialog
      mode="edit"
      buildingId={item.buildingId?.toString() ?? ''}
      unitId={item.unitId?.toString() ?? undefined}
      applianceFurniture={item}
      onSuccess={() => {
        onClose();
        queryClient.invalidateQueries({
          queryKey: [Namespace.Building],
          exact: false,
        });
      }}
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    />
  );
};
