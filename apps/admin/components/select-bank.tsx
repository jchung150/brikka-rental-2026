import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';

const BANKS = [
  '농협',
  '신한은행',
  '국민은행',
  '우리은행',
  '새마을금고',
  '하나은행',
  '케이뱅크',
  '카카오뱅크',
  '토스뱅크',
];

export default function SelectBank({
  value,
  onValueChange,
  placeholder = '은행을 선택해 주세요',
  disabled = false,
}: {
  value: string | undefined;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {BANKS.map((bank) => (
          <SelectItem key={bank} value={bank}>
            {bank}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
