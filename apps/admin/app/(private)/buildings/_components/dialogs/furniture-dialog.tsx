'use client';

import {
  type BuildingApplianceFurnitureEntity,
  updateBuildingApplianceFurniture,
} from '@/@actions/appliances-furniture';
import { createBuildingApplianceFurniture } from '@/@actions/appliances-furniture/create';
import { SelectFurnitureLocation } from '@/app/(private)/_components/select-al-location';
import { SelectFurnitureManufacturer } from '@/app/(private)/_components/select-al-manufactor';
import { SelectFurniture } from '@/app/(private)/_components/select-furniture';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Prisma } from '@repo/database';
import {
  Alert,
  AlertDescription,
} from '@repo/design-system/components/ui/alert';
import { Button } from '@repo/design-system/components/ui/button';
import { Calendar } from '@repo/design-system/components/ui/calendar';
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
import { Label } from '@repo/design-system/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/design-system/components/ui/popover';
import {
  RadioGroup,
  RadioGroupItem,
} from '@repo/design-system/components/ui/radio-group';
import {} from '@repo/design-system/components/ui/select';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { cn } from '@repo/design-system/lib/utils';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CalendarIcon, EditIcon, PlusIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
  category: z.enum(['APPLIANCE', 'FURNITURE'], {
    required_error: '제품 구분을 선택해주세요',
  }),
  usageScope: z.enum(['BUILDING_COMMON', 'UNIT_COMMON', 'UNIT_EXCLUSIVE'], {
    required_error: '사용 범위를 선택해주세요',
  }),
  quantity: z.number().min(1, '수량은 1개 이상이어야 합니다'),
  name: z.string().min(1, '제품명을 입력해주세요'),
  manufacturer: z.string().optional(),
  modelName: z.string().optional(),
  location: z.string().optional(),
  installationDate: z.date().optional(),
  warrantyExpiryDate: z.date().optional(),
  memo: z.string().optional(),
});

type FormType = z.infer<typeof formSchema>;

interface FurnitureDialogProps {
  mode: 'create' | 'edit';
  buildingId: string;
  unitId?: string;
  applianceFurniture?: BuildingApplianceFurnitureEntity;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const categoryOptions = [
  { value: 'APPLIANCE', label: '가전제품' },
  { value: 'FURNITURE', label: '가구' },
];

const getUsageScopeOptions = (unitId?: string) => {
  if (unitId) {
    return [{ value: 'UNIT_EXCLUSIVE', label: '유닛 전용' }];
  }
  return [
    { value: 'BUILDING_COMMON', label: '건물 공용' },
    { value: 'UNIT_COMMON', label: '유닛 공통' },
  ];
};

export default function FurnitureDialog({
  mode,
  buildingId,
  unitId,
  applianceFurniture,
  onSuccess,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: FurnitureDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const usageScopeOptions = getUsageScopeOptions(unitId);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const isEdit = mode === 'edit';
  const title = isEdit ? '가전제품 및 가구 수정' : '가전제품 및 가구 등록';
  const subtitle = isEdit
    ? '가전제품 및 가구 정보를 수정해 주세요'
    : '가전제품 및 가구 정보를 등록해 주세요';

  return (
    <FurnitureDialogContent
      mode={mode}
      buildingId={buildingId}
      applianceFurniture={applianceFurniture}
      onSuccess={onSuccess}
      trigger={trigger}
      open={open}
      onOpenChange={setOpen}
      title={title}
      subtitle={subtitle}
      isSubmitting={isSubmitting}
      setIsSubmitting={setIsSubmitting}
      usageScopeOptions={usageScopeOptions}
    />
  );
}

// 다이얼로그 내용을 별도 컴포넌트로 분리
interface FurnitureDialogContentProps extends FurnitureDialogProps {
  title: string;
  subtitle: string;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  usageScopeOptions: { value: string; label: string }[];
}

function FurnitureDialogContent({
  mode,
  buildingId,
  applianceFurniture,
  onSuccess,
  trigger,
  open,
  onOpenChange,
  title,
  subtitle,
  isSubmitting,
  setIsSubmitting,
  usageScopeOptions,
}: FurnitureDialogContentProps) {
  const isEdit = mode === 'edit';
  const session = useSession();
  const isAdmin = session.data?.user.role === 'ADMIN';

  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: applianceFurniture?.ApplianceFurniture.category ?? 'APPLIANCE',
      usageScope: applianceFurniture?.usageScope ?? 'BUILDING_COMMON',
      quantity: applianceFurniture?.quantity ?? 1,
      name: applianceFurniture?.ApplianceFurniture.id.toString() ?? '',
      manufacturer: applianceFurniture?.Manufacturer.id.toString() ?? '',
      modelName: applianceFurniture?.modelName ?? '',
      location: applianceFurniture?.Location?.id.toString() ?? '',
      installationDate: applianceFurniture?.installationDate ?? undefined,
      warrantyExpiryDate: applianceFurniture?.warrantyExpiryDate ?? undefined,
      memo: applianceFurniture?.memo ?? '',
    },
  });

  // 수정 모드일 때 폼 값 업데이트
  React.useEffect(() => {
    if (isEdit && applianceFurniture) {
      updateFormForEdit();
    }
  }, [isEdit, applianceFurniture]);

  const updateFormForEdit = () => {
    if (!applianceFurniture) {
      return;
    }

    form.reset({
      category: applianceFurniture.ApplianceFurniture.category,
      usageScope: applianceFurniture.usageScope ?? 'BUILDING_COMMON',
      quantity: applianceFurniture.quantity,
      name: applianceFurniture.ApplianceFurniture.id.toString(),
      manufacturer: applianceFurniture.Manufacturer.id.toString() || '',
      modelName: applianceFurniture.modelName || '',
      location: applianceFurniture.Location?.id.toString() || '',
      installationDate: applianceFurniture.installationDate ?? undefined,
      warrantyExpiryDate: applianceFurniture.warrantyExpiryDate ?? undefined,
      memo: applianceFurniture.memo || '',
    });
  };

  const { handleSubmit, reset, watch, setValue } = form;
  const watchedCategory = watch('category');
  const watchedUsageScope = watch('usageScope');

  // 조건부 필드 표시 로직
  const shouldShowWarrantyField = watchedCategory === 'APPLIANCE' && isAdmin;
  const shouldShowLocationField = watchedUsageScope !== 'UNIT_EXCLUSIVE';
  const isUnitExclusive = watchedUsageScope === 'UNIT_EXCLUSIVE';

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
        가전제품 및 가구 등록
      </Button>
    ));

  const prepareInputData = (formData: FormType) => ({
    category: formData.category,
    quantity: formData.quantity,
    name: formData.name,
    manufacturer: formData.manufacturer || null,
    modelName: formData.modelName || null,
    location: isUnitExclusive ? '자동' : formData.location || null,
    installationDate: formData.installationDate || null,
    warrantyExpiryDate: shouldShowWarrantyField
      ? formData.warrantyExpiryDate || null
      : null,
    memo: formData.memo || null,
    usageScope: formData.usageScope,
  });

  const onSubmit = async (formData: FormType) => {
    setIsSubmitting(true);

    try {
      const inputData = prepareInputData(formData);
      const input = {
        quantity: inputData.quantity,
        modelName: inputData.modelName || null,
        serialNumber: inputData.modelName || null,
        installationDate: inputData.installationDate || null,
        warrantyExpiryDate: inputData.warrantyExpiryDate || null,
        memo: inputData.memo || null,
        buildingId: BigInt(buildingId),
        applianceFurnitureId: BigInt(inputData.name),
        manufacturerId: BigInt(inputData.manufacturer || ''),
        usageScope: inputData.usageScope,
        locationId: BigInt(inputData.location || ''),
      } satisfies Prisma.BuildingApplianceFurnitureUncheckedCreateInput;

      const result = isEdit
        ? await updateBuildingApplianceFurniture({
            id: applianceFurniture?.id.toString() ?? '',
            ...input,
          })
        : await createBuildingApplianceFurniture(input);

      if (result.ok) {
        toast.success(
          isEdit
            ? '가전제품 및 가구가 수정되었습니다.'
            : '가전제품 및 가구가 등록되었습니다.'
        );
        onOpenChange?.(false);
        reset();
        onSuccess?.();
      } else {
        toast.error(result.message || '처리 중 오류가 발생했습니다.');
      }
    } catch {
      toast.error('처리 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange?.(false);
    reset();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
    }
    onOpenChange?.(newOpen);
  };

  const handleQuantityChange = (delta: number) => {
    const currentQuantity = form.getValues('quantity');
    const newQuantity = Math.max(1, currentQuantity + delta);
    setValue('quantity', newQuantity);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{defaultTrigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <p className="text-muted-foreground text-sm">{subtitle}</p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FurnitureFormFields
              form={form}
              isSubmitting={isSubmitting}
              isUnitExclusive={isUnitExclusive}
              shouldShowLocationField={shouldShowLocationField}
              shouldShowWarrantyField={shouldShowWarrantyField}
              onQuantityChange={handleQuantityChange}
              usageScopeOptions={usageScopeOptions}
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
              <Button type="submit" disabled={isSubmitting || isUnitExclusive}>
                {isEdit ? '수정' : '등록'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// 폼 필드들을 별도 컴포넌트로 분리
interface FurnitureFormFieldsProps {
  form: ReturnType<typeof useForm<FormType>>;
  isSubmitting: boolean;
  isUnitExclusive: boolean;
  shouldShowLocationField: boolean;
  shouldShowWarrantyField: boolean;
  onQuantityChange: (delta: number) => void;
  usageScopeOptions: { value: string; label: string }[];
}

function FurnitureFormFields({
  form,
  isSubmitting,
  isUnitExclusive,
  shouldShowLocationField,
  shouldShowWarrantyField,
  onQuantityChange,
  usageScopeOptions,
}: FurnitureFormFieldsProps) {
  return (
    <>
      <CategoryAndUsageFields
        form={form}
        isUnitExclusive={isUnitExclusive}
        scopeOptions={usageScopeOptions}
      />
      <QuantityField
        form={form}
        isSubmitting={isSubmitting}
        onQuantityChange={onQuantityChange}
      />
      <ProductFields form={form} isSubmitting={isSubmitting} />
      <LocationField form={form} shouldShow={shouldShowLocationField} />
      <DateFields form={form} shouldShowWarranty={shouldShowWarrantyField} />
      <MemoField form={form} isSubmitting={isSubmitting} />
    </>
  );
}

// 제품 구분 및 사용 범위 필드
function CategoryAndUsageFields({
  form,
  isUnitExclusive,
  scopeOptions,
}: {
  form: ReturnType<typeof useForm<FormType>>;
  isUnitExclusive: boolean;
  scopeOptions: { value: string; label: string }[];
}) {
  return (
    <>
      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>제품 구분</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={(value) => {
                  field.onChange(value);
                  form.resetField('name');
                }}
                defaultValue={field.value}
                className="flex space-x-6"
              >
                {categoryOptions.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value}>{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="usageScope"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>사용 범위</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex space-x-6"
              >
                {scopeOptions.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value}>{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {isUnitExclusive && (
        <Alert>
          <AlertDescription>
            유닛전용 제품/가구는 유닛 관리 화면에서 직접 등록해 주세요. 이
            화면에서는 등록이 불가능합니다.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}

// 수량 필드
function QuantityField({
  form,
  isSubmitting,
  onQuantityChange,
}: {
  form: ReturnType<typeof useForm<FormType>>;
  isSubmitting: boolean;
  onQuantityChange: (delta: number) => void;
}) {
  return (
    <FormField
      control={form.control}
      name="quantity"
      render={({ field }) => (
        <FormItem>
          <FormLabel required>수량</FormLabel>
          <FormControl>
            <div className="flex w-fit items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onQuantityChange(-1)}
                disabled={field.value <= 1}
              >
                -
              </Button>
              <Input
                {...field}
                type="number"
                min="1"
                className="w-fit text-center"
                disabled={isSubmitting}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => onQuantityChange(1)}
              >
                +
              </Button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// 제품 관련 필드들
function ProductFields({
  form,
  isSubmitting,
}: {
  form: ReturnType<typeof useForm<FormType>>;
  isSubmitting: boolean;
}) {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>제품명</FormLabel>
            <FormControl>
              <SelectFurniture
                type={form.getValues('category')}
                value={field.value}
                onValueChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="manufacturer"
        render={({ field }) => (
          <FormItem>
            <FormLabel>제조사</FormLabel>
            <FormControl>
              <SelectFurnitureManufacturer
                value={field.value || ''}
                onValueChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="modelName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>모델명</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="모델명을 입력해 주세요"
                disabled={isSubmitting}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

// 설치 위치 필드
function LocationField({
  form,
  shouldShow,
}: {
  form: ReturnType<typeof useForm<FormType>>;
  shouldShow: boolean;
}) {
  if (!shouldShow) {
    return null;
  }

  return (
    <FormField
      control={form.control}
      name="location"
      render={({ field }) => (
        <FormItem>
          <FormLabel>설치 위치</FormLabel>
          <FormControl>
            <SelectFurnitureLocation
              value={field.value || ''}
              onValueChange={field.onChange}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// 날짜 필드들
function DateFields({
  form,
  shouldShowWarranty,
}: {
  form: ReturnType<typeof useForm<FormType>>;
  shouldShowWarranty: boolean;
}) {
  return (
    <>
      <FormField
        control={form.control}
        name="installationDate"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>설치 일자</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full pl-3 text-left font-normal',
                      !field.value && 'text-muted-foreground'
                    )}
                  >
                    {field.value ? (
                      format(field.value, 'PPP', { locale: ko })
                    ) : (
                      <span>설치 일자를 선택해 주세요</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  // disabled={(date) =>
                  //   date > new Date() || date < new Date('1900-01-01')
                  // }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      {shouldShowWarranty && (
        <FormField
          control={form.control}
          name="warrantyExpiryDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>보증 만료 일자</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP', { locale: ko })
                      ) : (
                        <span>보증 만료 일자를 선택해 주세요</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
}

// 메모 필드
function MemoField({
  form,
  isSubmitting,
}: {
  form: ReturnType<typeof useForm<FormType>>;
  isSubmitting: boolean;
}) {
  return (
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
  );
}
