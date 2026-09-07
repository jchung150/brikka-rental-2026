'use client';
import { UserForm } from '@/app/(private)/users/components/create-user-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@repo/design-system/components/ui/dialog';
import { useBuildingDetailContext } from '../context';

export function BuildingDetailDialogs() {
  const { dialog, setDialog } = useBuildingDetailContext();
  if (dialog?.type === 'create-landlord') {
    return (
      <Dialog
        open={true}
        onOpenChange={(open) => {
          if (!open) {
            setDialog(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>임대인 등록</DialogTitle>
          </DialogHeader>
          <UserForm
            type="LANDLORD"
            onSuccess={() => {
              setDialog(null);
            }}
            onCancel={() => {
              setDialog(null);
            }}
          />
        </DialogContent>
      </Dialog>
    );
  }
  return null;
}
