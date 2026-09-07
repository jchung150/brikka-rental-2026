'use client';
import type { LeaseListItem } from '@/@actions/lease/listLeases';
import { updateLeaseStatus } from '@/@actions/lease/updateLeaseStatus';
import { useLeases } from '@/@hooks/use-leases';
import { PagingTable } from '@/components/data-table/paging-table';
import type { SortingState } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ChangeStatusDialog } from './change-status-dialog';
import { createLeaseColumns } from './lease-columns';
import {
  type LeaseFilterRemainingDays,
  type LeaseFilterRenewalNotice,
  type LeaseFilterStatus,
  LeaseToolbar,
} from './lease-toolbar';

interface LeaseTableProps {
  initialFilters?: {
    buildingId?: string;
    status?: 'PREPARING' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED';
    remainingDaysFilter?: 'expired' | 'urgent' | 'upcoming' | 'normal';
    renewalNoticeFilter?: 'overdue' | 'urgent' | 'normal';
  };
}

export function LeaseTable({ initialFilters = {} }: LeaseTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);
  const [page, setPage] = useState(1);
  const [selectedLease, setSelectedLease] = useState<LeaseListItem | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 필터 상태 관리
  const [buildingId, setBuildingId] = useState<string | undefined>(
    initialFilters.buildingId
  );
  const [status, setStatus] = useState<LeaseFilterStatus>(
    initialFilters.status ?? 'all'
  );
  const [remainingDaysFilter, setRemainingDaysFilter] =
    useState<LeaseFilterRemainingDays>(
      initialFilters.remainingDaysFilter ?? 'all'
    );
  const [renewalNoticeFilter, setRenewalNoticeFilter] =
    useState<LeaseFilterRenewalNotice>(
      initialFilters.renewalNoticeFilter ?? 'all'
    );

  const params = useMemo(() => {
    return {
      sortBy: sorting[0].id as
        | 'createdAt'
        | 'startDate'
        | 'endDate'
        | 'status'
        | 'remainingDays',
      sortOrder: sorting[0].desc ? ('desc' as const) : ('asc' as const),
      buildingId,
      status: status === 'all' ? undefined : status,
      remainingDaysFilter:
        remainingDaysFilter === 'all' ? undefined : remainingDaysFilter,
      renewalNoticeFilter:
        renewalNoticeFilter === 'all' ? undefined : renewalNoticeFilter,
    };
  }, [sorting, buildingId, status, remainingDaysFilter, renewalNoticeFilter]);

  const { data, error } = useLeases(page, params);

  const handleStatusChange = (lease: LeaseListItem) => {
    setSelectedLease(lease);
    setIsDialogOpen(true);
  };

  const handleStatusUpdate = async (leaseId: string, newStatus: string) => {
    const result = await updateLeaseStatus({
      leaseId,
      status: newStatus as 'PREPARING' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED',
    });

    if (result.ok) {
      toast.success('계약 상태가 성공적으로 변경되었습니다');
    } else {
      toast.error(result.message || '상태 변경에 실패했습니다');
    }

    return result;
  };

  const columns = createLeaseColumns({
    onStatusChange: handleStatusChange,
  });

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-red-600">
          오류가 발생했습니다: {error.message}
        </div>
      </div>
    );
  }

  return (
    <>
      <PagingTable
        columns={columns}
        data={data?.items ?? []}
        Toolbar={LeaseToolbar}
        toolbarProps={{
          buildingId,
          setBuildingId,
          status,
          setStatus,
          remainingDaysFilter,
          setRemainingDaysFilter,
          renewalNoticeFilter,
          setRenewalNoticeFilter,
        }}
        sorting={sorting}
        setSorting={setSorting}
        page={data?.page ?? 1}
        setPage={setPage}
        lastPage={data?.lastPage ?? 1}
      />
      <ChangeStatusDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        lease={selectedLease}
        onStatusChange={handleStatusUpdate}
      />
    </>
  );
}
