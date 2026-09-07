'use client';

import { listRequests } from '@/@actions/requests/listRequests';
import { QueryKeys } from '@/@hooks/query-keys';
import { CardSkeleton } from '@repo/design-system/components/skeleton';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useBuildingDetailContext } from '../../../context';
import { RequestDialogs } from './request-dialogs';
import { RequestTable } from './request-table';

interface RequestsTabProps {
  buildingId: number;
}

export function RequestsTab({ buildingId }: RequestsTabProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { building } = useBuildingDetailContext();

  const { data, isLoading, error } = useQuery({
    queryKey: QueryKeys.Request.List({ buildingId }),
    queryFn: () => listRequests({ buildingId }),
  });

  if (isLoading) {
    return <CardSkeleton variant="detailed" />;
  }

  if (error || !data?.ok) {
    return (
      <div className="py-8 text-center text-red-600">
        요청 목록을 불러오는 중 오류가 발생했습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <RequestTable
        items={data.data.items}
        onAddRequest={() => setIsCreateDialogOpen(true)}
      />
      <RequestDialogs
        isCreateDialogOpen={isCreateDialogOpen}
        onCloseCreateDialog={() => setIsCreateDialogOpen(false)}
        buildingId={buildingId}
      />
    </div>
  );
}
