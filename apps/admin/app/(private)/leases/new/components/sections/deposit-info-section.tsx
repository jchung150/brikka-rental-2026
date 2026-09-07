'use client';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import { Calendar } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import type { DepositInfoData } from '../../schemas/lease-form-schema';
import { SectionContainer } from './container';

export function DepositInfoSection() {
  const { control } = useFormContext<{ depositInfo: DepositInfoData }>();

  return (
    <SectionContainer title="보증금 정보">
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={control}
            name="depositInfo.amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>약정액</FormLabel>
                <FormControl>
                  <Input
                    placeholder="보증금 약정액을 입력해 주세요. 예시 100,000,000원"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="depositInfo.returnDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>반환 예정일</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Calendar className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
                    <Input
                      type="date"
                      className="pl-10"
                      placeholder="보증금 반환 예정일을 선택해 주세요"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </SectionContainer>
  );
}
