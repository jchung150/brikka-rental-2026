'use client';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import { cn } from '@repo/design-system/lib/utils';
import { useEffect, useState } from 'react';
import type React from 'react';
import {
  type FieldPath,
  type FieldValues,
  useFormContext,
} from 'react-hook-form';

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
  label?: string;
  disabled?: boolean;
  readonly?: boolean;
  className?: string;
  required?: boolean;
};

export const SSNFormField = <T extends FieldValues>({
  name,
  label = '주민등록번호',
  disabled = false,
  readonly = false,
  className,
  required = false,
}: Props<T>) => {
  const { control, setValue, watch } = useFormContext<T>();
  const [frontPart, setFrontPart] = useState('');
  const [backPart, setBackPart] = useState('');

  const watchedValue = watch(name);

  // 폼 값이 변경될 때 로컬 상태 동기화
  useEffect(() => {
    if (watchedValue && typeof watchedValue === 'string') {
      const parts = watchedValue.split('-');
      if (parts.length === 2) {
        setFrontPart(parts[0]);
        setBackPart(parts[1]);
      }
    }
  }, [watchedValue]);

  // 앞자리 입력 처리
  const handleFrontPartChange = (value: string) => {
    // 숫자만 허용하고 6자리로 제한
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, 6);
    setFrontPart(numericValue);

    // 전체 주민등록번호 업데이트
    const fullSSN = backPart ? `${numericValue}-${backPart}` : numericValue;
    setValue(name, fullSSN as never, { shouldValidate: true });
  };

  // 뒷자리 입력 처리
  const handleBackPartChange = (value: string) => {
    // 숫자만 허용하고 7자리로 제한
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, 7);
    setBackPart(numericValue);

    // 전체 주민등록번호 업데이트
    const fullSSN = frontPart ? `${frontPart}-${numericValue}` : numericValue;
    setValue(name, fullSSN as never, { shouldValidate: true });
  };

  // 앞자리 포커스 이동 (6자리 입력 시)
  const handleFrontPartKeyDown = (
    _e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // 포커스 이동 로직은 필요시 구현
  };

  // 뒷자리 포커스 이동 (7자리 입력 시)
  const handleBackPartKeyDown = (_e: React.KeyboardEvent<HTMLInputElement>) => {
    // 포커스 이동 로직은 필요시 구현
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('space-y-2', className)}>
          <FormLabel>
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </FormLabel>
          <FormControl>
            <div className="flex items-center gap-2">
              {/* 앞자리 (6자리) */}
              <Input
                data-front-part="true"
                value={frontPart}
                onChange={(e) => handleFrontPartChange(e.target.value)}
                onKeyDown={handleFrontPartKeyDown}
                placeholder="123456"
                disabled={disabled || readonly}
                className={cn(
                  'text-center font-mono',
                  disabled && 'cursor-not-allowed opacity-50',
                  readonly && 'cursor-default'
                )}
                maxLength={6}
                inputMode="numeric"
              />

              {/* 구분자 */}
              <span className="font-mono text-muted-foreground">-</span>

              {/* 뒷자리 (7자리) */}
              <Input
                data-back-part="true"
                value={backPart}
                onChange={(e) => handleBackPartChange(e.target.value)}
                onKeyDown={handleBackPartKeyDown}
                placeholder="789012"
                disabled={disabled || readonly}
                className={cn(
                  'text-center font-mono',
                  disabled && 'cursor-not-allowed opacity-50',
                  readonly && 'cursor-default'
                )}
                maxLength={7}
                inputMode="numeric"
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
