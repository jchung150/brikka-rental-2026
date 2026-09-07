'use client';

import type { LeaseDetail } from '@/@actions/lease/getLeaseDetail';
import { updateUser } from '@/@actions/users/updateUser';
import { TenantForm } from '@/components/form';
import type { TenantFormData } from '@/components/form';
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

type LeaseTenant = LeaseDetail['LeaseTenants'][number];

interface EditTenantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leaseTenant: LeaseTenant;
}

export function EditTenantDialog({
  open,
  onOpenChange,
  leaseTenant,
}: EditTenantDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const tenant = leaseTenant.Tenant;
  const queryClient = useQueryClient();

  // 기존 데이터를 TenantFormData 형태로 변환
  const getInitialData = (): Partial<TenantFormData> => {
    if (!tenant) return {};

    return {
      name: tenant.name,
      ssn: tenant.ssn ?? '',
      phoneNumber: tenant.phoneNumber ?? '',
      email: tenant.email,
      address: tenant.address ?? '',
      addressDetail: tenant.addressDetail ?? '',
      accountBank: tenant.accountBank ?? '농협',
      accountNumber: tenant.accountNumber ?? '',
    };
  };

  const handleSubmit = async (data: TenantFormData) => {
    setIsLoading(true);

    try {
      const result = await updateUser(tenant.id, {
        name: data.name,
        ssn: data.ssn,
        phoneNumber: data.phoneNumber,
        email: data.email,
        address: data.address,
        addressDetail: data.addressDetail,
        accountBank: data.accountBank,
        accountNumber: data.accountNumber,
        zipcode: data.zipcode,
      });

      if (result.ok) {
        toast.success('입주자 정보가 성공적으로 수정되었습니다.');
        onOpenChange(false);
        queryClient.invalidateQueries();
      } else {
        toast.error(
          result.message || '입주자 정보 수정 중 오류가 발생했습니다.'
        );
      }
    } catch (error) {
      console.error('입주자 수정 실패:', error);
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
          <DialogTitle>입주자 정보 수정</DialogTitle>
          <DialogDescription>입주자 정보를 수정하세요.</DialogDescription>
        </DialogHeader>

        <TenantForm
          initialData={getInitialData()}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
          showAccountInfo={true}
          submitButtonText="수정"
        />
      </DialogContent>
    </Dialog>
  );
}
