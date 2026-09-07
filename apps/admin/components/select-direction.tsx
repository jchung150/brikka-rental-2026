import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
const DIRECTION = [
  '남향',
  '남동향',
  '남서향',
  '동향',
  '서향',
  '북향',
  '북동향',
  '북서향',
  '모름',
];

export default function SelectDirection({
  value,
  onValueChange,
  placeholder = '방향을 선택해 주세요',
  disabled = false,
}: {
  value: string | undefined;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {DIRECTION.map((direction) => (
          <SelectItem key={direction} value={direction}>
            {direction}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
