'use client';
import type { BillingScheduleListItem } from '@/@actions/lease/listBillingSchedules';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/design-system/components/ui/dialog';

interface DeleteBillingItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: BillingScheduleListItem | null;
  onConfirm: () => void;
}

export function DeleteBillingItemDialog({
  open,
  onOpenChange,
  item,
  onConfirm,
}: DeleteBillingItemDialogProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>청구항목 삭제</DialogTitle>
          <DialogDescription>
            <strong>{item.itemName}</strong> 청구항목을 삭제하시겠습니까?
            <br />이 작업은 되돌릴 수 없습니다.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            삭제
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
