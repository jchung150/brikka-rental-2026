'use client';

import type { LeaseDetail } from '@/@actions/lease/getLeaseDetail';
import { updateLease } from '@/@actions/lease/updateLease';
import { zodResolver } from '@hookform/resolvers/zod';
import { LeaseStatus } from '@repo/database/generated/client';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Calendar } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const editLeaseSchema = z.object({
  status: z.nativeEnum(LeaseStatus),
  numberOfOccupants: z.number().min(1, '입주 인원은 1명 이상이어야 합니다'),
  startDate: z.string().min(1, '계약 시작일을 선택해주세요'),
  endDate: z.string().min(1, '계약 종료일을 선택해주세요'),
});

type EditLeaseFormData = z.infer<typeof editLeaseSchema>;

interface EditLeaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lease: LeaseDetail;
}

export function EditLeaseDialog({
  open,
  onOpenChange,
  lease,
}: EditLeaseDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EditLeaseFormData>({
    resolver: zodResolver(editLeaseSchema),
    defaultValues: {
      status: lease.status,
      numberOfOccupants: lease.numberOfOccupants || 1,
      startDate: lease.startDate
        ? new Date(lease.startDate).toISOString().split('T')[0]
        : '',
      endDate: lease.endDate
        ? new Date(lease.endDate).toISOString().split('T')[0]
        : '',
    },
  });

  const onSubmit = async (data: EditLeaseFormData) => {
    setIsLoading(true);

    try {
      const result = await updateLease(BigInt(lease.id), {
        status: data.status,
        numberOfOccupants: data.numberOfOccupants,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      });

      if (result.ok) {
        toast.success('계약 정보가 성공적으로 수정되었습니다.');
        onOpenChange(false);
        // 페이지 새로고침으로 최신 데이터 반영
        window.location.reload();
      } else {
        toast.error(result.message || '계약 정보 수정 중 오류가 발생했습니다.');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('계약 정보 수정 실패:', error);
      toast.error('계약 정보 수정 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // 다이얼로그가 닫힐 때 폼 초기화
      form.reset({
        status: lease.status,
        numberOfOccupants: lease.numberOfOccupants || 1,
        startDate: lease.startDate
          ? new Date(lease.startDate).toISOString().split('T')[0]
          : '',
        endDate: lease.endDate
          ? new Date(lease.endDate).toISOString().split('T')[0]
          : '',
      });
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>계약 정보 수정</DialogTitle>
          <DialogDescription>
            계약의 기본 정보를 수정할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* 건물/유닛 정보 (읽기 전용) */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <div className="font-medium text-gray-500 text-sm">건물명</div>
                <div className="mt-1 text-gray-900 text-sm">
                  {lease.Unit.Building.name}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-500 text-sm">유닛명</div>
                <div className="mt-1 text-gray-900 text-sm">
                  {lease.Unit.name}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* 계약 상태 */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>계약 상태</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="계약 상태를 선택해 주세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PREPARING">준비중</SelectItem>
                          <SelectItem value="ACTIVE">진행중</SelectItem>
                          <SelectItem value="TERMINATED">종료됨</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 입주 인원 수 */}
              <FormField
                control={form.control}
                name="numberOfOccupants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>입주 인원 수</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(Number.parseInt(value))
                        }
                        value={field.value?.toString()}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="입주 인원 수를 선택해 주세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1명</SelectItem>
                          <SelectItem value="2">2명</SelectItem>
                          <SelectItem value="3">3명</SelectItem>
                          <SelectItem value="4">4명</SelectItem>
                          <SelectItem value="5">5명 이상</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 계약 시작일 */}
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>계약 시작일</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
                        <Input
                          type="date"
                          className="pl-10"
                          placeholder="계약 시작일을 선택해 주세요"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 계약 종료일 */}
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>계약 종료일</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
                        <Input
                          type="date"
                          className="pl-10"
                          placeholder="계약 종료일을 선택해 주세요"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                취소
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? '수정 중...' : '수정'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
