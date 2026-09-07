'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@repo/design-system/components/ui/dialog';
import { RequestForm } from './request-form';

interface RequestDialogsProps {
  isCreateDialogOpen: boolean;
  onCloseCreateDialog: () => void;
  buildingId: number;
}

export function RequestDialogs({
  isCreateDialogOpen,
  onCloseCreateDialog,
  buildingId,
}: RequestDialogsProps) {
  return (
    <>
      <Dialog open={isCreateDialogOpen} onOpenChange={onCloseCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>신규 요청 등록</DialogTitle>
            <DialogDescription>
              새로운 요청을 등록합니다. 필수 항목을 모두 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <RequestForm
            buildingId={buildingId}
            onSuccess={onCloseCreateDialog}
            onCancel={onCloseCreateDialog}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
