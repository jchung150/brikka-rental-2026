'use client';

import { useLeases } from '@/@hooks/use-leases';
import { AddBillingScheduleDialog } from '@/app/(private)/leases/[id]/_components/tabs/add-building-schedule-dialog';
import type { RecurrenceType } from '@repo/database/generated/client';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@repo/design-system/components/ui/dialog';
import { Input } from '@repo/design-system/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

interface SelectLeaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scheduleType: RecurrenceType;
  buildingId?: string;
}

export function SelectLeaseDialog({
  open,
  onOpenChange,
  scheduleType,
  buildingId,
}: SelectLeaseDialogProps) {
  const [selectedLeaseId, setSelectedLeaseId] = useState<string | null>(null);
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'PREPARING' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED' | 'all'
  >('ACTIVE');

  const params = useMemo(() => {
    return {
      buildingId,
      status:
        statusFilter === 'all'
          ? undefined
          : (statusFilter as 'PREPARING' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED'),
      search: search || undefined,
    };
  }, [buildingId, statusFilter, search]);

  const { data } = useLeases(1, params);

  const handleSelectLease = (leaseId: string) => {
    setSelectedLeaseId(leaseId);
    setShowAddSchedule(true);
    onOpenChange(false);
  };

  const handleAddScheduleClose = (open: boolean) => {
    setShowAddSchedule(open);
    if (!open) {
      setSelectedLeaseId(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>계약 선택</DialogTitle>
            <DialogDescription>
              청구를 추가할 계약을 선택해주세요.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* 필터 */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="건물명, 호실, 입주자명 검색..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(
                    value as
                      | 'PREPARING'
                      | 'ACTIVE'
                      | 'COMPLETED'
                      | 'TERMINATED'
                      | 'all'
                  )
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="ACTIVE">계약완료</SelectItem>
                  <SelectItem value="PREPARING">계약중</SelectItem>
                  <SelectItem value="COMPLETED">계약종료</SelectItem>
                  <SelectItem value="TERMINATED">계약해지</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 계약 목록 */}
            <div className="max-h-[400px] space-y-2 overflow-y-auto">
              {data?.items?.length === 0 ? (
                <div className="py-8 text-center text-gray-500 text-sm">
                  조건에 맞는 계약이 없습니다.
                </div>
              ) : (
                data?.items?.map((lease) => (
                  <Button
                    key={lease.id}
                    variant="outline"
                    className="h-auto w-full justify-start p-4"
                    onClick={() => handleSelectLease(lease.id)}
                  >
                    <div className="flex w-full flex-col items-start gap-1">
                      <div className="font-semibold">
                        {lease.buildingName} {lease.unitNumber}호
                      </div>
                      <div className="text-gray-600 text-sm">
                        입주자: {lease.tenantName || '미지정'}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {new Date(lease.startDate).toLocaleDateString('ko-KR')}{' '}
                        ~ {new Date(lease.endDate).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                  </Button>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 청구 등록 다이얼로그 */}
      {selectedLeaseId && (
        <AddBillingScheduleDialog
          open={showAddSchedule}
          type={scheduleType}
          onOpenChange={handleAddScheduleClose}
          leaseId={selectedLeaseId}
        />
      )}
    </>
  );
}
