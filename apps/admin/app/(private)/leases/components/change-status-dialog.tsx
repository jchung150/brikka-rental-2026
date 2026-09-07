'use client';

import type { LeaseListItem } from '@/@actions/lease/listLeases';
import { Strings } from '@repo/common/strings';
import { LeaseStatus } from '@repo/database/generated/client';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/design-system/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { useState } from 'react';

interface ChangeStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lease: LeaseListItem | null;
  onStatusChange: (leaseId: string, newStatus: string) => Promise<unknown>;
}

export function ChangeStatusDialog({
  open,
  onOpenChange,
  lease,
  onStatusChange,
}: ChangeStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async () => {
    if (!lease || !selectedStatus) {
      return;
    }

    setIsLoading(true);
    try {
      await onStatusChange(lease.id, selectedStatus);
      onOpenChange(false);
      setSelectedStatus('');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('상태 변경 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedStatus('');
    }
    onOpenChange(open);
  };

  if (!lease) {
    return null;
  }

  const contractName = `${lease.buildingName} - ${lease.unitNumber} - ${lease.tenantName}`;
  const startDate = new Date(lease.startDate).toLocaleDateString('ko-KR');
  const endDate = new Date(lease.endDate).toLocaleDateString('ko-KR');

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>계약 상태 변경</DialogTitle>
          <DialogDescription>
            계약의 상태를 변경합니다. 변경 후에는 즉시 반영됩니다.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-right font-medium">계약명</span>
            <div className="col-span-3 text-gray-600 text-sm">
              {contractName}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-right font-medium">계약 기간</span>
            <div className="col-span-3 text-gray-600 text-sm">
              {startDate} - {endDate}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-right font-medium">임대료</span>
            <div className="col-span-3 text-gray-600 text-sm">88만원</div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="status-select" className="text-right font-medium">
              계약 상태
            </label>
            <div className="col-span-3">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger id="status-select">
                  <SelectValue placeholder="상태를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(LeaseStatus).map((option) => (
                    <SelectItem key={option} value={option}>
                      {Strings.leaseStatus[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            닫기
          </Button>
          <Button
            onClick={handleStatusChange}
            disabled={!selectedStatus || isLoading}
          >
            {isLoading ? '변경 중...' : '변경'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
