import { SelectUnit } from '@/app/(private)/_components/select-units';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { useFormContext } from 'react-hook-form';
import type { BasicInfoData } from '../../schemas/lease-form-schema';

export function UnitField() {
  const { control, watch } = useFormContext<{ basicInfo: BasicInfoData }>();
  const buildingId = watch('basicInfo.buildingId');

  return (
    <FormField
      control={control}
      name="basicInfo.unitId"
      render={({ field }) => (
        <FormItem>
          <FormLabel required>유닛명</FormLabel>
          <FormControl>
            {buildingId ? (
              <SelectUnit
                buildingId={Number(buildingId)}
                value={field.value}
                onValueChange={field.onChange}
              />
            ) : (
              <div>건물을 선택해주세요</div>
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
