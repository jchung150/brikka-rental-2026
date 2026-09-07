'use client';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import { useRef } from 'react';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  accept?: string;
  maxSize?: number; // MB 단위
  disabled?: boolean;
  className?: string;
};

export const FileUploadField = <T extends FieldValues>({
  name,
  control,
  label = '파일',
  accept = '*/*',
  maxSize = 20, // 20MB
  disabled = false,
  className,
}: Props<T>) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileTypeDescription = () => {
    if (accept === '*/*') {
      return '모든 파일 형식을 허용합니다.';
    }
    if (accept.includes('.jpg') && accept.includes('.pdf')) {
      return 'JPG 및 PDF 파일만 허용됩니다.';
    }
    if (accept.includes('.jpg')) {
      return 'JPG 파일만 허용됩니다.';
    }
    if (accept.includes('.pdf')) {
      return 'PDF 파일만 허용됩니다.';
    }
    return '지정된 형식의 파일만 허용됩니다.';
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field: { onChange } }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={(e) => {
                const file = e.target.files?.[0];
                onChange(file);
              }}
              disabled={disabled}
            />
          </FormControl>

          <FormDescription>
            {`최대 ${maxSize}MB까지 업로드 가능합니다.`}
          </FormDescription>

          <FormMessage />
        </FormItem>
      )}
    />
  );
};
