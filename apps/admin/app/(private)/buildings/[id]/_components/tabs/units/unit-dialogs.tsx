'use client';
import type { UnitListItem } from '@/@data/unit';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@repo/design-system/components/ui/dialog';
import { UnitForm } from './unit-form';

interface UnitDialogsProps {
  isCreateDialogOpen: boolean;
  onCloseCreateDialog: () => void;
  isEditDialogOpen: boolean;
  onCloseEditDialog: () => void;
  selectedUnit: UnitListItem | null;
  buildingId: number;
}

export function UnitDialogs({
  isCreateDialogOpen,
  onCloseCreateDialog,
  isEditDialogOpen,
  onCloseEditDialog,
  selectedUnit,
  buildingId,
}: UnitDialogsProps) {
  return (
    <>
      {/* 생성 다이얼로그 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={onCloseCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>신규 유닛 등록</DialogTitle>
            <DialogDescription>
              새로운 유닛을 등록합니다. 필수 항목을 모두 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <UnitForm
            buildingId={buildingId}
            onSuccess={onCloseCreateDialog}
            onCancel={onCloseCreateDialog}
            mode="create"
          />
        </DialogContent>
      </Dialog>

      {/* 수정 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={onCloseEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>유닛 수정</DialogTitle>
            <DialogDescription>
              유닛 정보를 수정합니다. 필요한 항목을 변경해주세요.
            </DialogDescription>
          </DialogHeader>
          <UnitForm
            buildingId={buildingId}
            onSuccess={onCloseEditDialog}
            onCancel={onCloseEditDialog}
            unit={selectedUnit}
            mode="edit"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
