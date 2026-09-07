'use client';

import type { BuildingDetailDto } from '@/@data/building';
import { Namespace } from '@/@hooks/query-keys';
import FurnitureDialog from '@/app/(private)/buildings/_components/dialogs/furniture-dialog';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ApplianceFurnitureTable } from './furniture-table';

interface AppliancesFurnitureSectionProps {
  building: BuildingDetailDto;
}

export function AppliancesFurnitureSection({
  building,
}: AppliancesFurnitureSectionProps) {
  const [selectedScope, setSelectedScope] = useState<string>('all');
  const queryClient = useQueryClient();

  const handleFilterChange = (value: string) => {
    setSelectedScope(value);
  };

  const getScopeFilter = ():
    | 'BUILDING_COMMON'
    | 'UNIT_COMMON'
    | 'UNIT_EXCLUSIVE'
    | undefined => {
    switch (selectedScope) {
      case 'building':
        return 'BUILDING_COMMON';
      case 'unit-common':
        return 'UNIT_COMMON';
      case 'unit-exclusive':
        return 'UNIT_EXCLUSIVE';
      default:
        return undefined;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="font-semibold text-lg">
          가전제품 및 가구
        </CardTitle>
        <FurnitureDialog
          mode="create"
          buildingId={building.id.toString()}
          onSuccess={() => {
            queryClient.invalidateQueries({
              queryKey: [Namespace.Building],
              exact: false,
            });
          }}
        />
      </CardHeader>
      <CardContent>
        {/* 필터 */}
        <div className="mb-4">
          <Select defaultValue="all" onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="사용 범위 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="building">건물 공용</SelectItem>
              <SelectItem value="unit-common">유닛 공통</SelectItem>
              <SelectItem value="unit-exclusive">유닛 전용</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 데이터 테이블 */}
        <ApplianceFurnitureTable
          buildingId={Number(building.id)}
          scope={getScopeFilter()}
        />
      </CardContent>
    </Card>
  );
}
