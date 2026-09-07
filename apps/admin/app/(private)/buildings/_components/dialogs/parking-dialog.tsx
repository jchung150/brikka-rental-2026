'use client';

import { createParkingSpace } from '@/@actions/parking-spaces/createParkingSpace';
import { updateParkingSpace } from '@/@actions/parking-spaces/updateParkingSpace';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/components/ui/dialog';
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
import { EditIcon, PlusIcon } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
  spaceName: z.string().min(1, '주차면 이름은 필수입니다'),
  spaceType: z.enum(['NORMAL', 'COMPACT', 'HANDICAPPED'], {
    required_error: '주차면 유형을 선택해주세요',
  }),
  memo: z.string().optional(),
});

type FormType = z.infer<typeof formSchema>;

interface ParkingSpace {
  id: string;
  spaceName: string;
  spaceType: 'NORMAL' | 'COMPACT' | 'HANDICAPPED';
  memo?: string;
}

interface ParkingDialogProps {
  mode: 'create' | 'edit';
  buildingId: string;
  parkingSpace?: ParkingSpace;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const spaceTypeOptions = [
  { value: 'NORMAL', label: '일반' },
  { value: 'COMPACT', label: '소형' },
  { value: 'HANDICAPPED', label: '장애인' },
];

export default function ParkingDialog({
  mode,
  buildingId,
  parkingSpace,
  onSuccess,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: ParkingDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = mode === 'edit';
  const title = isEdit ? '주차면 수정' : '주차면 등록';
  const subtitle = isEdit
    ? '주차면 정보를 수정해 주세요'
    : '주차면 정보를 등록해 주세요';

  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      spaceName: parkingSpace?.spaceName ?? '',
      spaceType: parkingSpace?.spaceType ?? 'NORMAL',
      memo: parkingSpace?.memo ?? '',
    },
  });

  // 수정 모드일 때 폼 값 업데이트
  React.useEffect(() => {
    if (isEdit && parkingSpace) {
      form.reset({
        spaceName: parkingSpace.spaceName,
        spaceType: parkingSpace.spaceType,
        memo: parkingSpace.memo || '',
      });
    }
  }, [isEdit, parkingSpace, form]);

  const { handleSubmit, reset } = form;

  const defaultTrigger =
    trigger ||
    (isEdit ? (
      <Button variant="outline" size="sm">
        <EditIcon className="h-4 w-4" />
        수정
      </Button>
    ) : (
      <Button variant="outline">
        <PlusIcon className="h-4 w-4" />
        주차면 등록
      </Button>
    ));

  const onSubmit = async (formData: FormType) => {
    setIsSubmitting(true);

    try {
      const result = isEdit
        ? await updateParkingSpace({ id: parkingSpace?.id ?? '', ...formData })
        : await createParkingSpace({ buildingId, ...formData });

      if (result.ok) {
        toast.success(
          isEdit ? '주차면이 수정되었습니다.' : '주차면이 등록되었습니다.'
        );
        setOpen(false);
        reset();
        onSuccess?.();
      } else {
        toast.error(result.message || '처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Parking space operation failed:', error);
      toast.error('처리 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    reset();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <p className="text-muted-foreground text-sm">{subtitle}</p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="spaceName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>주차면 이름</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="주차면 이름을 입력해 주세요"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="spaceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>주차면 유형</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="주차면 유형을 선택해 주세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {spaceTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
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
              name="memo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>메모</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="메모를 입력해 주세요"
                      disabled={isSubmitting}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isEdit ? '수정' : '등록'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
