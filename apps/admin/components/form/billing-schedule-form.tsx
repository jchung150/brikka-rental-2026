import { zodResolver } from '@hookform/resolvers/zod';
import { Strings } from '@repo/common/strings';
import {
  RecurrencePeriod,
  type RecurrenceType,
} from '@repo/database/generated/client';
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
import { useForm } from 'react-hook-form';
import {
  type BillingScheduleFormData,
  billingScheduleFormSchema,
} from './schemas/billing-schedule-schema';

interface BillingScheduleFormProps {
  mode: 'create-onetime' | 'create-regular' | 'edit';
  defaultType: RecurrenceType;
  defaultValues?: Partial<BillingScheduleFormData>;
  onSubmit: (data: BillingScheduleFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const notificationOptions = [
  { value: 1, label: '1일 전에 발송' },
  { value: 3, label: '3일 전에 발송' },
  { value: 5, label: '5일 전에 발송' },
  { value: 7, label: '7일 전에 발송' },
  { value: 14, label: '14일 전에 발송' },
];

export function BillingScheduleForm({
  mode,
  defaultValues,
  defaultType,
  onSubmit,
  onCancel,
  isLoading = false,
}: BillingScheduleFormProps) {
  const form = useForm({
    resolver: zodResolver(billingScheduleFormSchema),
    defaultValues: {
      itemName: '',
      recurrencePeriod: mode === 'create-onetime' ? 'ONE_TIME' : undefined,
      amount: 0,
      dueDate: '',
      notificationDays: 5,
      isTaxable: false,
      memo: '',
      ...defaultValues,
    },
  });

  const handleSubmit = async (data: BillingScheduleFormData) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* 청구항목 */}
        <FormField
          control={form.control}
          name="itemName"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>청구항목</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={
                    mode === 'create-onetime'
                      ? '예: 수선비, 보수비, 특별관리비'
                      : '예: 임대료, 주차비, 관리비'
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {defaultType !== 'ONE_TIME' && (
          <FormField
            control={form.control}
            name="recurrencePeriod"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>반복주기</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="반복주기를 선택하세요" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(RecurrencePeriod).map((option) => (
                      <SelectItem key={option} value={option}>
                        {Strings.recurrencePeriod[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* 청구액 */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>청구액 (부가세 제외)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  placeholder="0"
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 청구일/다음 청구일 */}
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>
                {mode === 'create-onetime' ? '청구일' : '다음 청구일'}
              </FormLabel>
              <FormControl>
                <Input {...field} type="date" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 알림 설정 */}
        <FormField
          control={form.control}
          name="notificationDays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>알림 설정</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="알림 설정을 선택하세요" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {notificationOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value.toString()}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 메모 (선택사항) */}
        <FormField
          control={form.control}
          name="memo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>메모</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="추가 정보나 메모를 입력하세요 (선택사항)"
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 버튼 */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
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
