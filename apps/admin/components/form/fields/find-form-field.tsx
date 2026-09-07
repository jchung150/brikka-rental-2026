import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import type { Address } from 'react-daum-postcode';
import {
  type FieldPath,
  type FieldValues,
  useFormContext,
} from 'react-hook-form';
import FindAddress from '../../find-address';

type Props<T extends FieldValues> = {
  title: string;
  zipcodeName?: FieldPath<T>;
  addressName?: FieldPath<T>;
  detailAddressName?: FieldPath<T>;
  disabled?: boolean;
  readonly?: boolean;
};

export const AddressFormField = <T extends FieldValues>({
  title,
  zipcodeName = 'zipcode' as FieldPath<T>,
  addressName = 'address' as FieldPath<T>,
  detailAddressName = 'detailAddress' as FieldPath<T>,
  disabled = false,
  readonly = false,
}: Props<T>) => {
  const { setValue, control } = useFormContext<T>();
  return (
    <div className="space-y-2">
      <FormLabel>{title}</FormLabel>

      {/* 우편번호와 주소 검색 */}
      <div className="flex gap-2">
        <FormField
          control={control}
          name={zipcodeName}
          render={({ field }) => (
            <FormItem className="w-24">
              <FormControl>
                <Input
                  {...field}
                  placeholder="우편번호"
                  disabled={true}
                  className="text-center disabled:bg-gray-50 disabled:text-gray-900"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={addressName}
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input
                  {...field}
                  placeholder="주소"
                  disabled={true}
                  className="disabled:bg-gray-50 disabled:text-gray-900"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FindAddress
          onCompleted={(address: Address) => {
            setValue(zipcodeName, address.zonecode as any);
            setValue(addressName, address.address as any);
          }}
          readonly={readonly}
        />
      </div>

      {/* 상세주소 입력 */}
      <FormField
        control={control}
        name={detailAddressName}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input
                {...field}
                placeholder="상세주소를 입력해 주세요"
                disabled={disabled || readonly}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
