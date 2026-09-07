'use client';

import { useBillingSchedules } from '@/@hooks/use-billing-schedules';
import { PagingTable } from '@/components/data-table/paging-table';
import type { RecurrenceType } from '@repo/database/generated/client';
import type { SortingState } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { createBillingScheduleColumns } from './billing-schedule-columns';
import {
  type BillingScheduleFilterStatus,
  BillingScheduleToolbar,
} from './billing-schedule-toolbar';
import { SelectLeaseDialog } from './select-lease-dialog';

interface BillingScheduleTableProps {
  initialFilters?: {
    buildingId?: string;
    status?: 'PREPARING' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED';
    itemName?: string;
    dueDateStart?: string;
    dueDateEnd?: string;
  };
}

export function BillingScheduleTable({
  initialFilters = {},
}: BillingScheduleTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'dueDate', desc: false },
  ]);
  const [page, setPage] = useState(1);

  // 필터 상태 관리
  const [buildingId, setBuildingId] = useState<string | undefined>(
    initialFilters.buildingId
  );
  const [status, setStatus] = useState<BillingScheduleFilterStatus>(
    initialFilters.status ?? 'all'
  );
  const [itemName, setItemName] = useState<string | undefined>(
    initialFilters.itemName
  );

  // 다이얼로그 상태
  const [isSelectLeaseOpen, setIsSelectLeaseOpen] = useState(false);
  const [scheduleType, setScheduleType] = useState<RecurrenceType>('ONE_TIME');

  const params = useMemo(() => {
    return {
      buildingId: buildingId ? Number(buildingId) : undefined,
      status: status === 'all' ? undefined : status,
      itemName,
      page,
      limit: 20,
    };
  }, [buildingId, status, itemName, page]);

  const { data, error } = useBillingSchedules(params);

  const handleAddSchedule = (type: RecurrenceType) => {
    setScheduleType(type);
    setIsSelectLeaseOpen(true);
  };

  const columns = createBillingScheduleColumns();

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-red-600">
          오류가 발생했습니다: {error.message}
        </div>
      </div>
    );
  }

  const items = data?.ok ? data.data.items : [];
  const currentPage = data?.ok ? data.data.page : 1;
  const lastPage = data?.ok ? data.data.lastPage : 1;

  return (
    <>
      <PagingTable
        columns={columns}
        data={items}
        Toolbar={BillingScheduleToolbar}
        toolbarProps={{
          buildingId,
          setBuildingId,
          status,
          setStatus,
          itemName,
          setItemName,
          onAddSchedule: handleAddSchedule,
        }}
        sorting={sorting}
        setSorting={setSorting}
        page={currentPage}
        setPage={setPage}
        lastPage={lastPage}
      />
      <SelectLeaseDialog
        open={isSelectLeaseOpen}
        onOpenChange={setIsSelectLeaseOpen}
        scheduleType={scheduleType}
        buildingId={buildingId}
      />
    </>
  );
}
