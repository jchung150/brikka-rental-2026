'use client';

import type { DocumentListItem } from '@/@actions/documents/listDocuments';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/design-system/components/ui/dialog';

interface DeleteDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: DocumentListItem | null;
  onConfirm: () => void;
}

export function DeleteDocumentDialog({
  open,
  onOpenChange,
  document,
  onConfirm,
}: DeleteDocumentDialogProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>문서 삭제</DialogTitle>
          <DialogDescription>
            <strong>{document.title}</strong> 문서를 삭제하시겠습니까?
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
