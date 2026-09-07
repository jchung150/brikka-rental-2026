'use client';

import type { LeaseDetail } from '@/@actions/lease/getLeaseDetail';
import type { BillingScheduleListItem } from '@/@actions/lease/listBillingSchedules';
import { useBillingSchedules } from '@/@hooks/use-billing-schedules';
import { PagingTable } from '@/components/data-table/paging-table';
import type { RecurrenceType } from '@repo/database/generated/client';
import { Button } from '@repo/design-system/components/ui/button';
import type { SortingState } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { AddBillingScheduleDialog } from './add-building-schedule-dialog';
import { createBillingItemsColumns } from './billing-items-columns';
import { DeleteBillingItemDialog } from './delete-billing-item-dialog';
import { EditBillingItemDialog } from './edit-billing-item-dialog';

interface BillingItemsTabProps {
  lease: LeaseDetail;
}

export function BillingItemsTab({ lease: _lease }: BillingItemsTabProps) {
  const { data } = useBillingSchedules({ leaseId: Number(_lease.id) });
  const items = data?.ok ? data.data.items : [];
  const lastPage = data?.ok ? data.data.lastPage : 1;
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'id', desc: true },
  ]);

  const [addBillingScheduleDialogOpen, setAddBillingScheduleDialogOpen] =
    useState<RecurrenceType | null>(null);
  const [editingItem, setEditingItem] =
    useState<BillingScheduleListItem | null>(null);
  const [deletingItem, setDeletingItem] =
    useState<BillingScheduleListItem | null>(null);

  const handleEdit = (item: BillingScheduleListItem) => {
    setEditingItem(item);
  };

  const handleDelete = (item: BillingScheduleListItem) => {
    setDeletingItem(item);
  };

  const handleConfirmDelete = () => {};

  const columns = createBillingItemsColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">청구항목 관리</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setAddBillingScheduleDialogOpen('ONE_TIME')}
          >
            <Plus className="mr-2 h-4 w-4" />
            일회성 청구 등록
          </Button>
          <Button
            onClick={() => setAddBillingScheduleDialogOpen('RECURRING')}
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            정기 청구 등록
          </Button>
        </div>
      </div>

      <PagingTable
        columns={columns}
        data={items}
        sorting={sorting}
        setSorting={setSorting}
        page={page}
        setPage={setPage}
        lastPage={lastPage}
      />

      {addBillingScheduleDialogOpen && (
        <AddBillingScheduleDialog
          open={true}
          type={addBillingScheduleDialogOpen}
          onOpenChange={(open) =>
            !open && setAddBillingScheduleDialogOpen(null)
          }
        />
      )}

      <EditBillingItemDialog
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        item={editingItem || null}
      />

      <DeleteBillingItemDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        item={deletingItem}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
