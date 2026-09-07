import { Button } from '@repo/design-system/components/ui/button';
import { Calendar } from '@repo/design-system/components/ui/calendar';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/design-system/components/ui/popover';
import { cn } from '@repo/design-system/lib/utils';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import {
  type FieldPath,
  type FieldValues,
  useFormContext,
} from 'react-hook-form';

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  className?: string;
};

export const DateFormField = <T extends FieldValues>({
  name,
  label,
  placeholder = '날짜를 선택해주세요',
  disabled = false,
  readonly = false,
  className,
}: Props<T>) => {
  const { control } = useFormContext<T>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('flex flex-col', className)}>
          <FormLabel>{label}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full pl-3 text-left font-normal',
                    !field.value && 'text-muted-foreground',
                    disabled && 'cursor-not-allowed opacity-50',
                    readonly && 'cursor-default'
                  )}
                  disabled={disabled || readonly}
                >
                  {field.value ? (
                    format(field.value, 'PPP', { locale: ko })
                  ) : (
                    <span>{placeholder}</span>
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
                disabled={(date) => disabled || readonly}
                initialFocus
                locale={ko}
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
