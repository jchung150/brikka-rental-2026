'use client';

import type { LeaseDetail } from '@/@actions/lease/getLeaseDetail';
import type { RequestListItem } from '@/@actions/requests/listRequests';
import { useRequests } from '@/@hooks/use-requests';
import { DataTable } from '@/components/data-table/data-table';
import { Strings } from '@repo/common/strings';
import { RequestStatus } from '@repo/database/generated/client';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { DeleteRequestDialog } from './delete-request-dialog';
import { EditRequestDialog } from './edit-request-dialog';
import { NewRequestDialog } from './new-request-dialog';
import { RequestDetailDialog } from './request-detail-dialog';
import { createRequestsColumns } from './requests-columns';

interface RequestsTabProps {
  lease: LeaseDetail;
}

export function RequestsTab({ lease: _lease }: RequestsTabProps) {
  const [statusFilter, setStatusFilter] = useState<RequestStatus | undefined>(
    undefined
  );
  const { data, isLoading, error } = useRequests({
    leaseId: Number(_lease.id),
    status: statusFilter,
  });
  // const [requests, setRequests] = useState<LeaseRequest[]>(mockRequests);
  const requests = data ?? [];
  const [isNewRequestDialogOpen, setIsNewRequestDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<RequestListItem | null>(null);
  const [editingRequest, setEditingRequest] = useState<RequestListItem | null>(
    null
  );
  const [deletingRequest, setDeletingRequest] =
    useState<RequestListItem | null>(null);

  const handleStatusFilterChange = (value: string) => {
    if (value === 'ALL') {
      setStatusFilter(undefined);
    } else {
      setStatusFilter(value as RequestStatus);
    }
  };

  const handleViewDetails = (request: RequestListItem) => {
    setSelectedRequest(request);
  };

  const handleEdit = (request: RequestListItem) => {
    setEditingRequest(request);
  };

  const handleDelete = (request: RequestListItem) => {
    setDeletingRequest(request);
  };

  const handleUpdateRequest = (updatedRequest: RequestListItem) => {
    setEditingRequest(null);
  };

  const handleConfirmDelete = () => {
    if (deletingRequest) {
      setDeletingRequest(null);
    }
  };

  const columns = createRequestsColumns({
    onViewDetails: handleViewDetails,
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">요청 내역</h2>
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="처리 상태" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(RequestStatus).map((option) => (
                <SelectItem key={option} value={option}>
                  {Strings.requestStatus[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => setIsNewRequestDialogOpen(true)}
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            신규 요청 등록
          </Button>
        </div>
      </div>

      <DataTable columns={columns} data={requests} pageSize={10} />

      <NewRequestDialog
        leaseId={Number(_lease.id)}
        unitId={Number(_lease.unitId)}
        open={isNewRequestDialogOpen}
        onOpenChange={setIsNewRequestDialogOpen}
      />

      <RequestDetailDialog
        open={!!selectedRequest}
        onOpenChange={(open) => !open && setSelectedRequest(null)}
        request={selectedRequest}
      />

      <EditRequestDialog
        open={!!editingRequest}
        onOpenChange={(open) => !open && setEditingRequest(null)}
        request={editingRequest}
        onUpdate={handleUpdateRequest}
      />

      <DeleteRequestDialog
        open={!!deletingRequest}
        onOpenChange={(open) => !open && setDeletingRequest(null)}
        request={deletingRequest}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
