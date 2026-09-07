import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';

// 연립주택 / 다세대주택 / 다가구주택 / 단독주택 / 전원주택 / 상가주택 / 한옥주택;
const Types = [
  '연립주택',
  '다세대주택',
  '다가구주택',
  '단독주택',
  '전원주택',
  '상가주택',
  '한옥주택',
];

type Props = {
  value?: string;
  onChange?: (value: string) => void;
};

export default function SelectBuildingType({ value, onChange }: Props) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="건물 유형을 선택해주세요" />
      </SelectTrigger>
      <SelectContent>
        {Types.map((type) => (
          <SelectItem key={type} value={type}>
            {type}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
