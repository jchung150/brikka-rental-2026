'use client';

import { createRequest } from '@/@actions/requests/createRequest';
import { requestTypeLabels } from '@/@data/request';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const requestFormSchema = z.object({
  requestType: z.enum(['REPAIR', 'COMPLAINT', 'INQUIRY']),
  details: z.string().min(1, '요청 내용은 필수입니다'),
  unitId: z.number().optional(),
});

type RequestFormData = z.infer<typeof requestFormSchema>;

interface RequestFormProps {
  buildingId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function RequestForm({
  buildingId,
  onSuccess,
  onCancel,
}: RequestFormProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RequestFormData>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      requestType: 'INQUIRY',
    },
  });

  const onSubmit = async (data: RequestFormData) => {
    setIsSubmitting(true);
    try {
      const result = await createRequest({
        ...data,
        buildingId,
      });

      if (result.ok) {
        toast.success('요청이 성공적으로 등록되었습니다.');
        onSuccess();
        queryClient.invalidateQueries();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('요청 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="requestType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>요청 유형 *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="요청 유형 선택" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(requestTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
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
          name="details"
          render={({ field }) => (
            <FormItem>
              <FormLabel>요청 내용 *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="요청 내용을 상세히 입력해주세요..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="unitId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>관련 유닛 (선택사항)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="예: 205"
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
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
            {isSubmitting ? '등록 중...' : '등록'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
