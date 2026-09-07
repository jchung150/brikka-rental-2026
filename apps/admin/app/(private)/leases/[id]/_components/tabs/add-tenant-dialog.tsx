'use client';
import { type AddTenantInput, addTenant } from '@/@actions/lease/addTenant';
import type { TenantFormData } from '@/components/form';
import { TenantForm } from '@/components/form';
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
import { useLeaseDetail } from '../context';

interface AddTenantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTenantDialog({ open, onOpenChange }: AddTenantDialogProps) {
  const { detail } = useLeaseDetail();
  const leaseId = detail.id;
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (data: TenantFormData) => {
    setIsLoading(true);

    try {
      const payload: AddTenantInput = {
        leaseId: leaseId.toString(),
        name: data.name,
        ssn: data.ssn ?? '',
        phoneNumber: data.phoneNumber,
        email: data.email,
        address: data.address,
        addressDetail: data.addressDetail ?? '',
        accountBank: data.accountBank ?? '',
        accountNumber: data.accountNumber ?? '',
        zipcode: data.zipcode ?? '',
      };

      const result = await addTenant(payload);

      if (result.ok) {
        toast.success('입주자가 성공적으로 추가되었습니다.');
        queryClient.invalidateQueries();
      } else {
        toast.error(result.message || '입주자 추가 중 오류가 발생했습니다.');
      }

      onOpenChange(false);
    } catch (error) {
      console.error('입주자 추가 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>신규 입주자 추가</DialogTitle>
          <DialogDescription>
            새로운 입주자 정보를 입력하세요.
          </DialogDescription>
        </DialogHeader>

        <TenantForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
          showAccountInfo={false}
          submitButtonText="추가"
        />
      </DialogContent>
    </Dialog>
  );
}
