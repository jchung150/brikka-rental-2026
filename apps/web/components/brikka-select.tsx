import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { cn } from '@repo/design-system/lib/utils';

export default function BrikkaSelect({
  value,
  values,
  triggerClassName,
  centered = false,
  onValueChange,
}: {
  value: string;
  values: { label: string; value: string }[];
  triggerClassName?: string;
  centered?: boolean;
  onValueChange: (value: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className={cn(
          "!h-[54px] relative w-full max-w-[500px] rounded-none border-apc-black-900 shadow-none duration-0 data-[state=open]:bg-apc-black-900 data-[state=open]:text-white data-[state=open]:[&_svg:not([class*='text-'])]:text-white",
          {
            'justify-end': centered,
          },
          triggerClassName
        )}
      >
        <SelectValue placeholder="카테고리 선택" className="justify-start" />
      </SelectTrigger>
      <SelectContent className="rounded-none border-apc-black-900 shadow-none">
        {values.map((tab) => (
          <SelectItem
            key={tab.value}
            value={tab.value}
            className="h-[54px] rounded-none border-b border-b-apc-black-900 last:border-b-0 focus:border-b-apc-black-900 focus:bg-[#F0F0F0] focus:text-apc-black-900 [&_svg]:hidden"
          >
            <div
              className={cn('body-lg-medium', {
                'absolute inset-0 flex items-center justify-center': centered,
              })}
            >
              {tab.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
