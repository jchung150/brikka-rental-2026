'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { Checkbox } from '@repo/design-system/components/ui/checkbox';
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

export function CompanySection() {
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
        name="additionalInfo.corporateName"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>법인명</FormLabel>
            <FormControl>
              <Input placeholder="법인명을 입력해 주세요" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="additionalInfo.businessNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>사업자 번호</FormLabel>
            <FormControl>
              <Input placeholder="사업자 번호를 입력해 주세요" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="additionalInfo.representativeName"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>대표 이름</FormLabel>
            <FormControl>
              <Input placeholder="대표 이름을 입력해 주세요" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="additionalInfo.corporateEmail"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>이메일</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="이메일을 입력해 주세요"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="additionalInfo.corporatePhone"
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
        name="additionalInfo.corporateAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>주소</FormLabel>
            <FormControl>
              <div className="flex gap-2">
                <Input placeholder="주소를 입력해 주세요" {...field} />
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
        name="additionalInfo.corporateAddressDetail"
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

      <FormField
        control={control}
        name="additionalInfo.issueTaxInvoice"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>세금계산서 발행 여부</FormLabel>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}
