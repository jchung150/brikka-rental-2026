'use client';

import type { LeaseDetail } from '@/@actions/lease/getLeaseDetail';
import { deleteUser } from '@/@actions/users/deleteUser';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/design-system/components/ui/dialog';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type LeaseTenant = LeaseDetail['LeaseTenants'][number];
interface DeleteTenantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: LeaseTenant;
}

export function DeleteTenantDialog({
  open,
  onOpenChange,
  tenant,
}: DeleteTenantDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const handleConfirm = async () => {
    onOpenChange(false);
    setIsLoading(true);

    const result = await deleteUser({ id: tenant.Tenant.id.toString() });

    if (result.ok) {
      toast.success('입주자가 성공적으로 삭제되었습니다.');
    } else {
      toast.error(result.message || '입주자 삭제 중 오류가 발생했습니다.');
    }

    setIsLoading(false);
    queryClient.invalidateQueries();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>입주자 삭제</DialogTitle>
          <DialogDescription>
            <strong>{tenant.Tenant.name}</strong> 입주자를 삭제하시겠습니까?
            <br />이 작업은 되돌릴 수 없습니다.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            삭제
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
