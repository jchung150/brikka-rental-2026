'use client';
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
import { useForm } from 'react-hook-form';
import SelectBank from '../select-bank';
import { AddressFormField } from './fields/find-form-field';
import { PhoneFormField } from './fields/phone-form-field';
import { SSNFormField } from './fields/ssn-form-field';
import {
  type TenantFormData,
  tenantFormSchema,
} from './schemas/tenant-form-schema';

interface TenantFormProps {
  initialData?: Partial<TenantFormData>;
  onSubmit: (data: TenantFormData) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  showAccountInfo?: boolean;
  submitButtonText?: string;
}

export function TenantForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitButtonText = '저장',
}: TenantFormProps) {
  const schema = tenantFormSchema;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name || '',
      ssn: initialData?.ssn || '',
      phoneNumber: initialData?.phoneNumber || '',
      email: initialData?.email || '',
      address: initialData?.address || '',
      addressDetail: initialData?.addressDetail || '',
      accountBank: initialData?.accountBank || '농협',
      accountNumber: initialData?.accountNumber || '',
      zipcode: initialData?.zipcode || '',
    },
  });

  const handleSubmit = async (data: TenantFormData) => {
    try {
      console.log('data', data);
      await onSubmit(data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Form submission error:', error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        onError={(e) => {
          console.error('Form submission error:', e);
        }}
        onErrorCapture={(e) => {
          console.error('Form submission error:', e);
        }}
        className="space-y-4"
      >
        {/* 기본 정보 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>이름</FormLabel>
                <FormControl>
                  <Input placeholder="이름을 입력하세요" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <SSNFormField name="ssn" label="주민등록번호" />
          <PhoneFormField name="phoneNumber" label="연락처" required />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>이메일</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="example@email.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 주소 정보 */}
        <div className="space-y-4">
          <AddressFormField title="주소" />
        </div>

        {/* 계좌 정보 (선택적) */}
        {false && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="accountBank"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>은행</FormLabel>
                  <FormControl>
                    <SelectBank
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
              name="accountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>계좌번호 *</FormLabel>
                  <FormControl>
                    <Input placeholder="계좌번호를 입력하세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* 버튼 영역 */}
        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              취소
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? '처리 중...' : submitButtonText}
          </Button>
        </div>
      </form>
    </Form>
  );
}
