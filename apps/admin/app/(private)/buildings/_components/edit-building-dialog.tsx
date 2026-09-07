'use client';

import type { BuildingDto } from '@/@data/building';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@repo/design-system/components/ui/dialog';
import { useBuildingsContext } from '../context';
import { BuildingForm } from './building-form';

export function BuildingDialogs() {
  const { dialog } = useBuildingsContext();

  return (
    <div>
      {dialog?.type === 'edit' && (
        <BuildingEditDialog building={dialog.building} />
      )}
    </div>
  );
}

export const BuildingEditDialog = ({ building }: { building: BuildingDto }) => {
  const { setDialog } = useBuildingsContext();
  const close = () => {
    setDialog(null);
  };
  const handleSuccess = () => {
    close();
  };
  const handleCancel = () => {
    close();
  };
  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) {
          close();
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>건물 수정</DialogTitle>
        </DialogHeader>
        <BuildingForm
          building={building}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};
