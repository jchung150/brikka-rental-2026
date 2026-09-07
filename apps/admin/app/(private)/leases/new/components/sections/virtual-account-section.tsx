'use client';

import SelectBank from '@/components/select-bank';
import { Button } from '@repo/design-system/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import {} from '@repo/design-system/components/ui/select';
import { Plus } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import type { VirtualAccountData } from '../../schemas/lease-form-schema';
import { SectionContainer } from './container';

export function VirtualAccountSection() {
  const { control, setValue } = useFormContext<{
    virtualAccount: VirtualAccountData;
  }>();

  const handleGenerateAccount = () => {
    // 가상 계좌번호 생성 로직
    const generatedAccountNumber = '000-000-0000';
    const accountHolder = '홍대전';

    setValue('virtualAccount.accountNumber', generatedAccountNumber);
    setValue('virtualAccount.accountHolder', accountHolder);
  };

  return (
    <SectionContainer title="가상 계좌번호 발급">
      <div className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={control}
            name="virtualAccount.bank"
            render={({ field }) => (
              <FormItem>
                <FormLabel>계좌 번호</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <SelectBank
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                      placeholder="은행을 선택해 주세요"
                    />

                    <Input value="000-000-0000" readOnly className="flex-1" />

                    <span className="self-center text-gray-500 text-sm">
                      (예금주: 홍대전)
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerateAccount}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              가상 계좌번호 생성
            </Button>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
