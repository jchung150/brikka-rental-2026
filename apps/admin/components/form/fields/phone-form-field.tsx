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
import type React from 'react';
import { useEffect, useState } from 'react';
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

export const PhoneFormField = <T extends FieldValues>({
  name,
  label = '연락처',
  disabled = false,
  readonly = false,
  className,
  required = false,
}: Props<T>) => {
  const { control, setValue, watch } = useFormContext<T>();
  const [firstPart, setFirstPart] = useState('');
  const [secondPart, setSecondPart] = useState('');
  const [thirdPart, setThirdPart] = useState('');

  const watchedValue = watch(name);

  // 폼 값이 변경될 때 로컬 상태 동기화
  useEffect(() => {
    if (watchedValue && typeof watchedValue === 'string') {
      const parts = watchedValue.split('-');
      if (parts.length === 3) {
        setFirstPart(parts[0]);
        setSecondPart(parts[1]);
        setThirdPart(parts[2]);
      }
    }
  }, [watchedValue]);

  // 전체 전화번호 업데이트 함수
  const updatePhoneNumber = (first: string, second: string, third: string) => {
    if (first && second && third) {
      const fullPhone = `${first}-${second}-${third}`;
      setValue(name, fullPhone as never, { shouldValidate: true });
    } else if (first && second) {
      const partialPhone = `${first}-${second}`;
      setValue(name, partialPhone as never, { shouldValidate: true });
    } else if (first) {
      setValue(name, first as never, { shouldValidate: true });
    } else {
      setValue(name, '' as never, { shouldValidate: true });
    }
  };

  // 첫 번째 부분 입력 처리 (010, 011 등)
  const handleFirstPartChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, 3);
    setFirstPart(numericValue);
    updatePhoneNumber(numericValue, secondPart, thirdPart);
  };

  // 두 번째 부분 입력 처리 (1234 등)
  const handleSecondPartChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, 4);
    setSecondPart(numericValue);
    updatePhoneNumber(firstPart, numericValue, thirdPart);
  };

  // 세 번째 부분 입력 처리 (5678 등)
  const handleThirdPartChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, 4);
    setThirdPart(numericValue);
    updatePhoneNumber(firstPart, secondPart, numericValue);
  };

  // 포커스 이동 처리
  const handleKeyDown = (
    _e: React.KeyboardEvent<HTMLInputElement>,
    _currentLength: number,
    _maxLength: number,
    _nextInputSelector: string
  ) => {
    // 포커스 이동 로직은 필요시 구현
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('space-y-2', className)}>
          <FormLabel required={required}>{label}</FormLabel>
          <FormControl>
            <div className="flex items-center gap-1">
              {/* 첫 번째 부분 (010, 011 등) */}
              <Input
                data-part="1"
                value={firstPart}
                onChange={(e) => handleFirstPartChange(e.target.value)}
                onKeyDown={(e) =>
                  handleKeyDown(e, firstPart.length, 3, 'input[data-part="2"]')
                }
                placeholder="010"
                disabled={disabled || readonly}
                className={cn(
                  'w-12 text-center font-mono',
                  disabled && 'cursor-not-allowed opacity-50',
                  readonly && 'cursor-default'
                )}
                maxLength={3}
                inputMode="numeric"
              />

              {/* 첫 번째 구분자 */}
              <span className="font-mono text-muted-foreground">-</span>

              {/* 두 번째 부분 (1234 등) */}
              <Input
                data-part="2"
                value={secondPart}
                onChange={(e) => handleSecondPartChange(e.target.value)}
                onKeyDown={(e) =>
                  handleKeyDown(e, secondPart.length, 4, 'input[data-part="3"]')
                }
                placeholder="1234"
                disabled={disabled || readonly}
                className={cn(
                  'w-16 text-center font-mono',
                  disabled && 'cursor-not-allowed opacity-50',
                  readonly && 'cursor-default'
                )}
                maxLength={4}
                inputMode="numeric"
              />

              {/* 두 번째 구분자 */}
              <span className="font-mono text-muted-foreground">-</span>

              {/* 세 번째 부분 (5678 등) */}
              <Input
                data-part="3"
                value={thirdPart}
                onChange={(e) => handleThirdPartChange(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, thirdPart.length, 4, '')}
                placeholder="5678"
                disabled={disabled || readonly}
                className={cn(
                  'w-16 text-center font-mono',
                  disabled && 'cursor-not-allowed opacity-50',
                  readonly && 'cursor-default'
                )}
                maxLength={4}
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
