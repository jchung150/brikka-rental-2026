import SelectBank from '@/components/select-bank';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import { cn } from '@repo/design-system/lib/utils';
import {
  type FieldPath,
  type FieldValues,
  useFormContext,
} from 'react-hook-form';

type BankAccountFields = {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
};

type Props<T extends FieldValues> = {
  title: string;
  bankNameField?: FieldPath<T>;
  accountHolderField?: FieldPath<T>;
  accountNumberField?: FieldPath<T>;
  disabled?: boolean;
  readonly?: boolean;
  className?: string;
};

export const BankAccountField = <T extends FieldValues>({
  title,
  bankNameField = 'accountBank' as FieldPath<T>,
  accountHolderField = 'accountHolder' as FieldPath<T>,
  accountNumberField = 'accountNumber' as FieldPath<T>,
  disabled = false,
  readonly = false,
  className,
}: Props<T>) => {
  const { control } = useFormContext<T>();

  return (
    <div className={cn('space-y-2', className)}>
      <FormLabel className="font-medium text-base">{title}</FormLabel>

      <div className="grid grid-cols-2 gap-2">
        {/* 은행명 입력 */}
        <FormField
          control={control}
          name={bankNameField}
          render={({ field }) => (
            <FormItem>
              <FormLabel>은행</FormLabel>
              <FormControl>
                <SelectBank
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="은행을 선택해 주세요"
                  disabled={disabled || readonly}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 예금주 */}
        <FormField
          control={control}
          name={accountHolderField}
          render={({ field }) => (
            <FormItem>
              <FormLabel>예금주</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="예금주명을 입력해주세요"
                  disabled={disabled || readonly}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* 계좌번호 */}
      <FormField
        control={control}
        name={accountNumberField}
        render={({ field }) => (
          <FormItem>
            <FormLabel>계좌번호</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="계좌번호를 입력해주세요"
                disabled={disabled || readonly}
                type="text"
                inputMode="numeric"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
