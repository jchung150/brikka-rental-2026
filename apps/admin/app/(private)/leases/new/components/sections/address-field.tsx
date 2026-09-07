import FindAddress from '@/components/find-address';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import type { Address } from 'react-daum-postcode';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';

type AddressFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
};

const AddressField = <TFieldValues extends FieldValues>({
  control,
  name,
  label = '주소',
  required = false,
  placeholder = '주소를 입력해 주세요',
  disabled = false,
}: AddressFieldProps<TFieldValues>) => {
  const handleAddressSelect = (
    address: Address,
    onChange: (value: string) => void
  ) => {
    onChange(address.roadAddress);
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel required={required}>{label}</FormLabel>
          <FormControl>
            <div className="flex gap-2">
              <Input
                placeholder={placeholder}
                {...field}
                readOnly
                disabled={disabled}
                className="bg-gray-50"
              />
              <FindAddress
                onCompleted={(address) =>
                  handleAddressSelect(address, field.onChange)
                }
                readonly={disabled}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default AddressField;
