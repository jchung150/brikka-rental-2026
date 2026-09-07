'use client';

import { Button } from '@repo/design-system/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import { Search } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import type { AdditionalInfoData } from '../../schemas/lease-form-schema';

export function BrokerSection() {
  const { control } = useFormContext<{
    additionalInfo: AdditionalInfoData;
  }>();

  const handleAddressSearch = () => {
    // 주소 검색 로직 구현
    console.log('주소 검색');
  };

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="additionalInfo.brokerOfficeName"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>사무소명</FormLabel>
            <FormControl>
              <Input placeholder="사무소명을 입력해 주세요" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="additionalInfo.brokerRepresentativeName"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>대표자명</FormLabel>
            <FormControl>
              <Input placeholder="대표자명을 입력해 주세요" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="additionalInfo.brokerRegistrationNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>등록번호</FormLabel>
            <FormControl>
              <Input placeholder="등록번호를 입력해 주세요" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="additionalInfo.brokerPhone"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>연락처</FormLabel>
            <FormControl>
              <Input placeholder="연락처를 입력해 주세요" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="additionalInfo.brokerOfficeAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>사무소소재지</FormLabel>
            <FormControl>
              <div className="flex gap-2">
                <Input placeholder="사무소소재지를 입력해 주세요" {...field} />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddressSearch}
                >
                  <Search className="mr-2 h-4 w-4" />
                  주소 검색
                </Button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="additionalInfo.brokerOfficeAddressDetail"
        render={({ field }) => (
          <FormItem>
            <FormLabel>상세 주소</FormLabel>
            <FormControl>
              <Input placeholder="상세 주소를 입력해 주세요" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
