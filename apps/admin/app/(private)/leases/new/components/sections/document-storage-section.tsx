'use client';

import { FileUploadField } from '@/components/form/fields/file-upload-field';
import { C } from '@repo/common/constant';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { Switch } from '@repo/design-system/components/ui/switch';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { useFormContext } from 'react-hook-form';
import type { DocumentStorageData } from '../../schemas/lease-form-schema';
import { SectionContainer } from './container';

export function DocumentStorageSection() {
  const { control } = useFormContext<{
    documentStorage: DocumentStorageData;
    sendWelcomeEmail: boolean;
  }>();

  return (
    <SectionContainer title="문서 보관">
      <div className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={control}
            name="documentStorage.title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>제목</FormLabel>
                <FormControl>
                  <Input placeholder="제목을 입력해 주세요" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="documentStorage.file"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FileUploadField
                    name="documentStorage.file"
                    control={control}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    maxSize={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="documentStorage.category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>카테고리</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="카테고리를 선택해 주세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {C.DOC_TYPE_UNIT.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="documentStorage.memo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>메모</FormLabel>
                <FormControl>
                  <Textarea placeholder="메모를 입력해 주세요" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 입주민 포털 웰컴 이메일 발송 */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-700 text-md">
            입주민 포털 웰컴 이메일 발송
          </h3>

          <FormField
            control={control}
            name="sendWelcomeEmail"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <FormLabel>웰컴 이메일 발송</FormLabel>
                  <div className="space-y-1 text-gray-500 text-sm">
                    <p>
                      입주민 포털 이용 안내 이메일과 인증 링크를 발송합니다.
                    </p>
                    <p>
                      입주민은 해당 이메일을 통해 포털에 접속하여 임대료 납부,
                      수선 요청 등을 이용할 수 있습니다.
                    </p>
                    <p>
                      계약서가 미완이거나 재계약인 경우에는 발송하지 않는 것이
                      일반적입니다.
                    </p>
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>
    </SectionContainer>
  );
}
