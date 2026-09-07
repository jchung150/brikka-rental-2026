'use client';

import { useParkingSpaces } from '@/@hooks/use-parking-spaces';
import { C } from '@repo/common/constant';
import { Alert, AlertTitle } from '@repo/design-system/components/ui/alert';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import type { AdditionalInfoData } from '../../schemas/lease-form-schema';

export function VehicleSection({ buildingId }: { buildingId: string }) {
  const { control } = useFormContext<{
    additionalInfo: AdditionalInfoData;
  }>();

  const { data: parkingSpaces = [] } = useParkingSpaces({
    buildingId: Number(buildingId),
  });
  // 사용 가능한 주차장만 필터링
  const availableParkingSpaces = useMemo(
    () => parkingSpaces?.filter((space) => space.LeaseVehicle) ?? [],
    [parkingSpaces]
  );

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="additionalInfo.vehicleMaker"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>메이커</FormLabel>
            <FormControl>
              <Input placeholder="차량 메이커를 입력해 주세요" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="additionalInfo.vehicleModel"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>모델</FormLabel>
            <FormControl>
              <Input placeholder="차량 모델을 입력해 주세요" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="additionalInfo.vehicleRegistrationNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>차량등록번호</FormLabel>
            <FormControl>
              <Input placeholder="차량등록번호를 입력해 주세요" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="additionalInfo.parkingSpaceId"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>주차장</FormLabel>
            <FormControl>
              {availableParkingSpaces.length > 0 ? (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="주차장을 선택해 주세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableParkingSpaces.map((space) => (
                      <SelectItem key={space.id} value={space.id.toString()}>
                        {space.spaceName} (
                        {C.PARKING_SPACE_TYPE[space.spaceType]})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Alert>
                  <AlertTitle>사용 가능한 주차장이 없습니다</AlertTitle>
                </Alert>
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
