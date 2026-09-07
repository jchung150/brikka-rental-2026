'use client';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import { useFormContext } from 'react-hook-form';
import type { PetInfoData } from '../../schemas/lease-form-schema';
import { SectionContainer } from './container';

export function PetInfoSection() {
  const { control, watch } = useFormContext<{
    additionalInfo: { hasPet: boolean };
    petInfo: PetInfoData;
  }>();

  const hasPet = watch('additionalInfo.hasPet');

  if (!hasPet) {
    return null;
  }

  return (
    <SectionContainer title="반려동물 정보">
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={control}
            name="petInfo.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>반려동물 이름</FormLabel>
                <FormControl>
                  <Input
                    placeholder="반려동물 이름을 입력해 주세요"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="petInfo.type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>타입</FormLabel>
                <FormControl>
                  <Input
                    placeholder="반려동물 타입을 입력해 주세요"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="petInfo.weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>몸무게</FormLabel>
                <FormControl>
                  <Input placeholder="몸무게를 입력해 주세요" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="petInfo.age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>나이</FormLabel>
                <FormControl>
                  <Input placeholder="나이를 입력해 주세요" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="petInfo.registrationNumber"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>반려견 등록번호</FormLabel>
                <FormControl>
                  <Input
                    placeholder="반려견 등록번호를 입력해 주세요"
                    {...field}
                  />
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
