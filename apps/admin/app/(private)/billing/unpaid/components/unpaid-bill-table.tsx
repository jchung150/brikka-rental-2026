'use client';

import { useBills } from '@/@hooks/use-bills';
import { PagingTable } from '@/components/data-table/paging-table';
import type { SortingState } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { createUnpaidBillColumns } from './unpaid-bill-columns';
import {
  type UnpaidBillFilterBillStatus,
  type UnpaidBillFilterLeaseStatus,
  UnpaidBillToolbar,
} from './unpaid-bill-toolbar';

interface UnpaidBillTableProps {
  initialFilters?: {
    buildingId?: string;
    leaseStatus?: 'PREPARING' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED';
    billStatus?: 'UNPAID' | 'OVERDUE';
  };
}

export function UnpaidBillTable({ initialFilters = {} }: UnpaidBillTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'dueDate', desc: false },
  ]);
  const [page, setPage] = useState(1);

  // 필터 상태 관리
  const [buildingId, setBuildingId] = useState<string | undefined>(
    initialFilters.buildingId
  );
  const [leaseStatus, setLeaseStatus] = useState<UnpaidBillFilterLeaseStatus>(
    initialFilters.leaseStatus ?? 'all'
  );
  const [billStatus, setBillStatus] = useState<UnpaidBillFilterBillStatus>(
    initialFilters.billStatus ?? 'all'
  );

  const params = useMemo(() => {
    return {
      buildingId: buildingId ? Number(buildingId) : undefined,
      leaseStatus: leaseStatus === 'all' ? undefined : leaseStatus,
      status: billStatus === 'all' ? undefined : billStatus,
      page,
      limit: 20,
    };
  }, [buildingId, leaseStatus, billStatus, page]);

  const { data, error } = useBills(params);

  const handleSendNotifications = () => {
    // TODO: 일괄 알림 발송 구현
    toast.info('알림톡 일괄 발송 기능은 준비 중입니다.');
  };

  const columns = createUnpaidBillColumns();

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
    <PagingTable
      columns={columns}
      data={items}
      Toolbar={UnpaidBillToolbar}
      toolbarProps={{
        buildingId,
        setBuildingId,
        leaseStatus,
        setLeaseStatus,
        billStatus,
        setBillStatus,
        onSendNotifications: handleSendNotifications,
      }}
      sorting={sorting}
      setSorting={setSorting}
      page={currentPage}
      setPage={setPage}
      lastPage={lastPage}
    />
  );
}
