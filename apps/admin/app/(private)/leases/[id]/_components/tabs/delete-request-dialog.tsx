'use client';

import type { RequestListItem } from '@/@actions/requests/listRequests';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/design-system/components/ui/dialog';

interface DeleteRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: RequestListItem | null;
  onConfirm: () => void;
}

export function DeleteRequestDialog({
  open,
  onOpenChange,
  request,
  onConfirm,
}: DeleteRequestDialogProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>요청 삭제</DialogTitle>
          <DialogDescription>
            <strong>{request.title}</strong> 요청을 삭제하시겠습니까?
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
