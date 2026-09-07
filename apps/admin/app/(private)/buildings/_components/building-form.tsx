'use client';

import { createBuilding } from '@/@actions/buildings/createBuilding';
import { updateBuilding } from '@/@actions/buildings/updateBuilding';
import type { BuildingDto } from '@/@data/building';
import { BankAccountField } from '@/components/form/fields/bank-account-field';
import { DateFormField } from '@/components/form/fields/date-form-field';
import { AddressFormField } from '@/components/form/fields/find-form-field';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/design-system/components/ui/button';
import { Checkbox } from '@repo/design-system/components/ui/checkbox';
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
} from '@repo/design-system/components/ui/select';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import InputLandlord from '../../_components/input-landlord';
import SelectBuildingType from '../../_components/select-building-type';
import SelectUser from '../../_components/select-user';

interface BuildingFormProps {
  building?: BuildingDto;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, '건물명은 필수입니다'),
  zipcode: z.string().min(1, '우편번호는 필수입니다'),
  address: z.string().min(1, '주소는 필수입니다'),
  detailAddress: z.string().optional(),
  buildingType: z.string().min(1, '건물 유형은 필수입니다'),
  managerId: z.string().optional(),
  accountBank: z.string().optional(),
  accountNumber: z.string().optional(),
  accountHolder: z.string().optional(),
  isParkingAvailable: z.boolean().default(false),
  heatingType: z.string().optional(),
  description: z.string().optional(),
  constructionDate: z.date().optional(),
  approvalDate: z.date().optional(),
  landlords: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      ownershipPercentage: z.number(),
    })
  ),
  hasElevator: z.boolean().default(false),
});

type FormType = z.infer<typeof formSchema>;

export function BuildingForm({
  building,
  onSuccess,
  onCancel,
}: BuildingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!building;
  const action = isEdit ? '수정' : '등록';

  console.log('building', building);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: building?.name ?? '',
      zipcode: building?.zipcode ?? '',
      address: building?.address ?? '',
      detailAddress: building?.addressDetail ?? '',
      buildingType: building?.buildingType ?? '',
      managerId: building?.manager?.id.toString() ?? '',
      accountBank: building?.accountBank ?? '',
      accountNumber: building?.accountNumber ?? '',
      accountHolder: building?.accountHolder ?? '',
      isParkingAvailable: building?.isParkingAvailable ?? false,
      heatingType: building?.heatingType ?? '',
      description: building?.description ?? '',
      constructionDate: building?.constructionDate ?? undefined,
      approvalDate: building?.approvalDate ?? undefined,
      landlords:
        building?.ownerships?.map((ownership) => ({
          id: ownership.landlordId,
          name: ownership.landlordName,
          ownershipPercentage: ownership.ownershipPercentage,
        })) ?? [],
      hasElevator: building?.hasElevator ?? false,
    },
  });

  const { handleSubmit } = form;

  // 폼 제출 처리
  const onSubmit = async (formData: FormType) => {
    const {
      name,
      zipcode,
      address,
      detailAddress,
      buildingType,
      managerId,
      accountBank,
      accountNumber,
      accountHolder,
      isParkingAvailable,
      heatingType,
      description,
      landlords,
      constructionDate,
      approvalDate,
      hasElevator,
    } = formData;

    if (!name || !zipcode || !address) {
      toast.error('필수 항목을 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name,
      zipcode,
      address,
      buildingType: buildingType || undefined,
      managerId: managerId ? BigInt(managerId) : undefined,
      addressDetail: detailAddress || undefined,
      accountBank: accountBank || undefined,
      accountNumber: accountNumber || undefined,
      accountHolder: accountHolder || undefined,
      isParkingAvailable,
      description: description || undefined,
      heatingType: heatingType || undefined,
      Ownerships: {
        createMany: {
          data: landlords.map((landlord) => ({
            landlordId: BigInt(landlord.id),
            ownershipPercentage: landlord.ownershipPercentage,
          })),
        },
      },
      hasElevator,
      constructionDate: constructionDate || undefined,
      approvalDate: approvalDate || undefined,
    };

    try {
      if (isEdit && building) {
        // 수정 모드
        const result = await updateBuilding(BigInt(building.id), payload);

        if (result.ok) {
          toast.success('건물 정보가 성공적으로 수정되었습니다.');
          onSuccess?.();
        } else {
          toast.error(result.message || '건물 수정 중 오류가 발생했습니다.');
        }
      } else {
        // 생성 모드
        const result = await createBuilding(payload);

        if (result.ok) {
          toast.success('건물이 성공적으로 등록되었습니다.');
          onSuccess?.();
        } else {
          toast.error(result.message || '건물 등록 중 오류가 발생했습니다.');
        }
      }
    } catch (error) {
      toast.error(`건물 ${action} 중 오류가 발생했습니다.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit, (errors) => {
          console.log('errors', errors);
          toast.error('건물 등록 중 오류가 발생했습니다.');
        })}
        className="space-y-2"
      >
        <FormField
          control={form.control}
          name="buildingType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>건물 유형</FormLabel>
              <FormControl>
                <SelectBuildingType
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>건물 이름</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="건물의 이름을 입력해 주세요"
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <AddressFormField title="건물 주소" disabled={isSubmitting} />

        <FormField
          control={form.control}
          name="landlords"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <InputLandlord
                  value={field.value ?? []}
                  onChange={(landlords) => {
                    form.setValue('landlords', landlords);
                  }}
                  readonly={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DateFormField
          label="건축일"
          name="constructionDate"
          disabled={isSubmitting}
          placeholder="건축일을 선택해 주세요"
        />

        <DateFormField
          label="사용승인일"
          name="approvalDate"
          disabled={isSubmitting}
          placeholder="사용승인일을 선택해 주세요"
        />

        <FormField
          control={form.control}
          name="managerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>건물 관리자</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectUser
                    filter={['ADMIN', 'MANAGER']}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    placeholder="건물 관리자를 선택해 주세요"
                  />
                </FormControl>
                <SelectContent />
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <BankAccountField title="계좌 정보" disabled={isSubmitting} />

        <FormField
          control={form.control}
          name="heatingType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>난방 유형</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="난방 유형을 입력해 주세요 (예: 개별 난방)"
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-wrap gap-3">
          <FormField
            control={form.control}
            name="isParkingAvailable"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>주차 가능</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hasElevator"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>엘리베이터 여부</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>건물 설명</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="건물에 대한 상세 설명을 입력해 주세요"
                  disabled={isSubmitting}
                  rows={4}
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
            onClick={onCancel}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {action}
          </Button>
        </div>
      </form>
    </Form>
  );
}
