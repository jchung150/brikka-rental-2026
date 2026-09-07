'use client';

import { addBillingSchedule } from '@/@actions/lease/addBillingSchedule';
import { BillingScheduleForm } from '@/components/form/billing-schedule-form';
import type { BillingScheduleFormData } from '@/components/form/schemas/billing-schedule-schema';
import type {
  RecurrencePeriod,
  RecurrenceType,
} from '@repo/database/generated/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@repo/design-system/components/ui/dialog';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { useLeaseDetailSafe } from '../context';

interface OneTimeBillingDialogProps {
  open: boolean;
  type: RecurrenceType;
  onOpenChange: (open: boolean) => void;
  leaseId?: string;
}

export function AddBillingScheduleDialog({
  open,
  type,
  onOpenChange,
  leaseId,
}: OneTimeBillingDialogProps) {
  // leaseId가 없으면 context에서 가져오기 (계약 상세 페이지에서 사용하는 경우)
  const contextLeaseId = useLeaseDetailSafe()?.detail?.id;
  const finalLeaseId = leaseId || contextLeaseId;
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (data: BillingScheduleFormData) => {
    if (!finalLeaseId) {
      toast.error('계약 정보를 찾을 수 없습니다.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await addBillingSchedule({
        leaseId: finalLeaseId.toString(),
        itemName: data.itemName,
        amount: data.amount,
        dueDate: new Date(data.dueDate).toISOString(),
        recurrenceType: type,
        recurrencePeriod: data.recurrencePeriod as RecurrencePeriod,
        isTaxable: data.isTaxable,
        notificationDays: data.notificationDays,
        memo: data.memo,
      });

      if (result.ok) {
        queryClient.invalidateQueries();
        toast.success('일회성 청구가 성공적으로 등록되었습니다.');
        onOpenChange(false);
      } else {
        toast.error(result.message || '일회성 청구 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('일회성 청구 등록 실패:', error);
      toast.error('일회성 청구 등록 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const title = type === 'ONE_TIME' ? '일회성 청구 등록' : '정기 청구 등록';
  const description =
    type === 'ONE_TIME'
      ? '일회성으로 청구할 항목을 등록하세요.'
      : '정기적으로 청구할 항목을 등록하세요.';
  const mode = type === 'ONE_TIME' ? 'create-onetime' : 'create-regular';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <BillingScheduleForm
          mode={mode}
          defaultType={type}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
