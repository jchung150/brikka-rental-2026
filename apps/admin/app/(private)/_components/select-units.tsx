import { useUnitsByBuildingId } from '@/@hooks/use-units';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';

export function SelectUnit({
  buildingId,
  value,
  onValueChange,
}: {
  buildingId: number;
  value: string;
  onValueChange: (value: string) => void;
}) {
  const units = useUnitsByBuildingId(buildingId);
  console.log(units);
  return (
    <Select onValueChange={onValueChange} value={value}>
      <SelectTrigger>
        <SelectValue placeholder="유닛명을 선택해 주세요" />
      </SelectTrigger>
      <SelectContent>
        {units.map((unit) => (
          <SelectItem key={unit.id} value={unit.id.toString()}>
            {unit.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
