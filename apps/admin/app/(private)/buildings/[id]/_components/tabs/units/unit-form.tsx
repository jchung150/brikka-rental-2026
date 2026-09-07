'use client';

import { createUnit } from '@/@actions/units/createUnit';
import { updateUnit } from '@/@actions/units/updateUnit';
import { unitTypeLabels } from '@/@data/unit';
import type { UnitListItem } from '@/@data/unit';
import { QueryKeys } from '@/@hooks/query-keys';
import SelectDirection from '@/components/select-direction';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Result } from '@repo/common/types';
import { UnitStatus } from '@repo/database/generated/client';
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
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const unitFormSchema = z.object({
  name: z.string().optional(),
  unitType: z.string().optional(),
  floor: z.number().optional(),
  unitNumber: z.string().min(1, '호수는 필수입니다'),
  supplyAreaSqm: z.number().optional(),
  exclusiveAreaSqm: z.number().optional(),
  serviceAreaSqm: z.number().optional(),
  roomCount: z.number().optional(),
  bathroomCount: z.number().optional(),
  bedroomDirection: z.string().optional(),
  status: z.nativeEnum(UnitStatus),
  // depositAmount: z.number().optional(),
  // rentAmount: z.number().optional(),
});

type UnitFormData = z.infer<typeof unitFormSchema>;

interface UnitFormProps {
  buildingId: number;
  onSuccess: () => void;
  onCancel: () => void;
  unit?: UnitListItem | null;
  mode?: 'create' | 'edit';
}

export function UnitForm({
  buildingId,
  onSuccess,
  onCancel,
  unit,
  mode = 'create',
}: UnitFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UnitFormData>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: {
      status: unit?.status || 'VACANT',
      floor: unit?.floor || undefined,
      supplyAreaSqm: unit?.supplyAreaSqm || undefined,
      exclusiveAreaSqm: unit?.exclusiveAreaSqm || undefined,
      serviceAreaSqm: unit?.serviceAreaSqm || undefined,
      roomCount: unit?.roomCount || undefined,
      bathroomCount: unit?.bathroomCount || undefined,
      bedroomDirection: unit?.bedroomDirection || '',
      name: unit?.name || '',
      unitType: unit?.unitType || '',
    },
  });

  const queryClient = useQueryClient();

  // 수정 모드일 때 기존 데이터로 폼 초기화
  useEffect(() => {
    if (mode === 'edit' && unit) {
      form.reset({
        name: unit.name || '',
        unitType: unit.unitType || '',
        floor: unit.floor || undefined,
        unitNumber: unit.unitNumber || '',
        supplyAreaSqm: unit.supplyAreaSqm || undefined,
        exclusiveAreaSqm: unit.exclusiveAreaSqm || undefined,
        serviceAreaSqm: unit.serviceAreaSqm || undefined,
        roomCount: unit.roomCount || undefined,
        bathroomCount: unit.bathroomCount || undefined,
        bedroomDirection: unit.bedroomDirection || '',
        status: unit.status || 'VACANT',
      });
    }
  }, [mode, unit, form]);

  const onSubmit = async (data: UnitFormData) => {
    setIsSubmitting(true);
    try {
      let result: Result<{ id: string }>;

      if (mode === 'edit' && unit) {
        result = await updateUnit(BigInt(unit.id), data);
        if (result.ok) {
          toast.success('유닛이 성공적으로 수정되었습니다.');
        }
      } else {
        result = await createUnit({
          ...data,
          buildingId,
        });
        if (result.ok) {
          toast.success('유닛이 성공적으로 등록되었습니다.');
        }
      }

      if (result.ok) {
        onSuccess();
        queryClient.invalidateQueries({
          queryKey: QueryKeys.Unit.List(buildingId),
        });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      const action = mode === 'edit' ? '수정' : '등록';
      toast.error(`유닛 ${action} 중 오류가 발생했습니다.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="unitNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>호수</FormLabel>
                <FormControl>
                  <Input placeholder="예: 205호" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="unitType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>유닛 유형</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="유닛 유형 선택" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(unitTypeLabels).map(([value, label]) => (
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>유닛 이름</FormLabel>
                <FormControl>
                  <Input placeholder="예: 정원뷰 로얄층" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="floor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>층 수</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="예: 5"
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
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="supplyAreaSqm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>공급 면적 (m²)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="예: 50.5"
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
          <FormField
            control={form.control}
            name="exclusiveAreaSqm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>전용 면적 (m²)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="예: 43.0"
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
          <FormField
            control={form.control}
            name="serviceAreaSqm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>서비스 면적 (m²)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="예: 7.5"
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
        </div>

        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="roomCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>방 갯수</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="예: 2"
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
          <FormField
            control={form.control}
            name="bathroomCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>욕실 갯수</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="예: 1"
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
          <FormField
            control={form.control}
            name="bedroomDirection"
            render={({ field }) => (
              <FormItem>
                <FormLabel>침실 방향</FormLabel>
                <FormControl>
                  <SelectDirection
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="침실 방향을 선택해 주세요"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="depositAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>기본 보증금 (원)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="예: 10000000"
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
          <FormField
            control={form.control}
            name="rentAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>기본 월세 (원)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="예: 500000"
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
        </div> */}

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>유닛 상태</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="상태 선택" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="VACANT">공실</SelectItem>
                  <SelectItem value="OCCUPIED">사용중</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? mode === 'edit'
                ? '수정 중...'
                : '등록 중...'
              : mode === 'edit'
                ? '수정'
                : '등록'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
