'use client';

import { updateDocument } from '@/@actions/documents/updateDocument';
import { documentCategoryLabels, documentTypeLabels } from '@/@data/document';
import { SelectUnit } from '@/app/(private)/_components/select-units';
import { FileUploadField } from '@/components/form/fields/file-upload-field';
import { AwsKeys } from '@/lib/aws-keys';
import { uploadFile } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import {
  RadioGroup,
  RadioGroupItem,
} from '@repo/design-system/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const documentEditFormSchema = z.object({
  category: z.string().min(1, '카테고리는 필수입니다'),
  unitId: z.string().optional(),
  type: z.string().min(1, '구분은 필수입니다'),
  title: z.string().optional(),
  memo: z.string().optional(),
  file: z.instanceof(File).optional(),
});

type DocumentEditFormData = z.infer<typeof documentEditFormSchema>;

interface DocumentEditFormProps {
  documentId: number;
  buildingId: number;
  initialData: {
    category: string;
    type: string;
    title?: string;
    unitId?: number;
    memo?: string;
    fileName?: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export function DocumentEditForm({
  documentId,
  buildingId,
  initialData,
  onSuccess,
  onCancel,
}: DocumentEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<DocumentEditFormData>({
    resolver: zodResolver(documentEditFormSchema),
    defaultValues: {
      category: initialData.category,
      unitId: initialData.unitId?.toString() || '',
      type: initialData.type,
      title: initialData.title || '',
      memo: initialData.memo || '',
    },
  });

  const onSubmit = async (data: DocumentEditFormData) => {
    setIsSubmitting(true);
    try {
      let fileId: number | undefined;

      // 새 파일이 업로드된 경우 파일 업로드 처리
      if (data.file) {
        const fileResult = await uploadFile(
          data.file,
          AwsKeys.documents(data.file),
          true
        );
        if (!fileResult) {
          toast.error('파일 업로드 중 오류가 발생했습니다.');
          return;
        }
        fileId = fileResult.id;
      }

      const result = await updateDocument({
        id: documentId,
        category: data.category,
        type: data.type,
        title: data.title || undefined,
        unitId: data.unitId ? Number.parseInt(data.unitId) : undefined,
        memo: data.memo || undefined,
        fileId,
      });

      if (result.ok) {
        toast.success('문서가 성공적으로 수정되었습니다.');
        onSuccess();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Document update failed:', error);
      toast.error('문서 수정 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const category = form.watch('category');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>구분</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex gap-2"
                >
                  {Object.entries(documentCategoryLabels).map(
                    ([value, label]) => (
                      <div key={value} className="flex items-center space-x-2">
                        <RadioGroupItem value={value} id={value} />
                        <label
                          htmlFor={value}
                          className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {label}
                        </label>
                      </div>
                    )
                  )}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {category === '유닛' && (
          <FormField
            control={form.control}
            name="unitId"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>유닛 선택</FormLabel>
                <FormControl>
                  <SelectUnit
                    buildingId={buildingId}
                    value={field.value || ''}
                    onValueChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>파일 종류</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="파일 종류 선택" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {documentTypeLabels[
                    category as keyof typeof documentTypeLabels
                  ].map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
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

        {initialData.fileName && (
          <div className="space-y-2">
            <FormLabel>현재 파일</FormLabel>
            <div className="rounded-md border bg-gray-50 p-3">
              <div className="text-gray-600 text-sm">
                <span className="font-medium">파일명:</span>{' '}
                {initialData.fileName}
              </div>
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FileUploadField
                  name="file"
                  control={form.control}
                  label="파일 변경"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="memo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>메모</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="문서에 대한 메모를 입력하세요..."
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '수정 중...' : '수정'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
