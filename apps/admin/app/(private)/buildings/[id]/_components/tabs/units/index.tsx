'use client';

import { listUnits } from '@/@actions/units/listUnits';
import type { UnitListItem } from '@/@data/unit';
import { QueryKeys } from '@/@hooks/query-keys';
import { CardSkeleton } from '@repo/design-system/components/skeleton';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useBuildingDetailContext } from '../../../context';
import { UnitDialogs } from './unit-dialogs';
import { UnitTable } from './unit-table';

interface UnitsTabProps {
  buildingId: number;
}

export function UnitsTab({ buildingId }: UnitsTabProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<UnitListItem | null>(null);
  const { building } = useBuildingDetailContext();

  const { data, isLoading, error } = useQuery({
    queryKey: QueryKeys.Unit.List(buildingId),
    queryFn: () => listUnits({ buildingId }),
  });

  const handleEditUnit = (unit: UnitListItem) => {
    setSelectedUnit(unit);
    setIsEditDialogOpen(true);
  };

  const handleDeleteUnit = (unit: UnitListItem) => {
    // TODO: 삭제 확인 다이얼로그 및 삭제 로직 구현
    console.log('Delete unit:', unit);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedUnit(null);
  };

  if (isLoading) {
    return <CardSkeleton variant="detailed" />;
  }

  if (error || !data?.ok) {
    return (
      <div className="py-8 text-center text-red-600">
        유닛 목록을 불러오는 중 오류가 발생했습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <UnitTable
        items={data.data.items}
        onAddUnit={() => setIsCreateDialogOpen(true)}
        onEditUnit={handleEditUnit}
        onDeleteUnit={handleDeleteUnit}
      />
      <UnitDialogs
        isCreateDialogOpen={isCreateDialogOpen}
        onCloseCreateDialog={() => setIsCreateDialogOpen(false)}
        isEditDialogOpen={isEditDialogOpen}
        onCloseEditDialog={handleCloseEditDialog}
        selectedUnit={selectedUnit}
        buildingId={buildingId}
      />
    </div>
  );
}
