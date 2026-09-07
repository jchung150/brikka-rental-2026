'use client';

import type { BillingScheduleListItem } from '@/@actions/lease/listBillingSchedules';
import { updateBillingSchedule } from '@/@actions/lease/updateBillingSchedule';
import { BillingScheduleForm } from '@/components/form/billing-schedule-form';
import type { BillingScheduleFormData } from '@/components/form/schemas/billing-schedule-schema';
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

interface EditBillingItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: BillingScheduleListItem | null;
}

export function EditBillingItemDialog({
  open,
  onOpenChange,
  item,
}: EditBillingItemDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (data: BillingScheduleFormData) => {
    if (!item) return;

    setIsLoading(true);

    try {
      const result = await updateBillingSchedule({
        id: item.id.toString(),
        itemName: data.itemName,
        recurrenceType: item.recurrenceType,
        amount: data.amount,
        dueDate: new Date(data.dueDate).toISOString(),
        notificationDays: data.notificationDays,
        isTaxable: data.isTaxable,
        memo: data.memo,
      });

      if (result.ok) {
        queryClient.invalidateQueries();
        toast.success('청구 항목이 성공적으로 수정되었습니다.');
        onOpenChange(false);
      } else {
        toast.error(result.message || '청구 항목 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('청구 항목 수정 실패:', error);
      toast.error('청구 항목 수정 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!item) return null;

  // 기본값 설정
  const defaultValues: Partial<BillingScheduleFormData> = {
    itemName: item.itemName,
    recurrencePeriod: item.recurrencePeriod || undefined,
    amount: item.amount,
    dueDate: new Date(item.dueDate).toISOString().split('T')[0],
    notificationDays: item.Lease.NotificationSettings[0]?.daysBeforeDue || 5,
    isTaxable: item.isTaxable || false,
    memo: item.memo || '',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>청구항목 수정</DialogTitle>
          <DialogDescription>청구항목 정보를 수정하세요.</DialogDescription>
        </DialogHeader>

        <BillingScheduleForm
          mode="edit"
          defaultValues={defaultValues}
          defaultType={item.recurrenceType}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
