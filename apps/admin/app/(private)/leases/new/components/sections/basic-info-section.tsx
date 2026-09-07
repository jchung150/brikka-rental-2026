'use client';

import { useBuildings } from '@/@hooks/use-buildings';
import { useUnitsByBuildingId } from '@/@hooks/use-units';
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
import { Calendar } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import type { BasicInfoData } from '../../schemas/lease-form-schema';
import { SectionContainer } from './container';
import { UnitField } from './unit-field';

export function BasicInfoSection() {
  const { control, watch } = useFormContext<{ basicInfo: BasicInfoData }>();
  const buildingId = watch('basicInfo.buildingId');

  const { data: buildings } = useBuildings();
  const units = useUnitsByBuildingId(Number(buildingId));

  return (
    <SectionContainer title="기본 정보">
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* 건물명 */}
          <FormField
            control={control}
            name="basicInfo.buildingId"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>건물명</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="건물명을 선택해 주세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {buildings?.map((building) => (
                        <SelectItem
                          key={building.id}
                          value={building.id.toString()}
                        >
                          {building.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 유닛명 */}
          <UnitField />

          {/* 계약 상태 */}
          <FormField
            control={control}
            name="basicInfo.status"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>계약 상태</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="계약 상태를 선택해 주세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PREPARING">준비중</SelectItem>
                      <SelectItem value="ACTIVE">진행중</SelectItem>
                      <SelectItem value="TERMINATED">종료됨</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 입주 인원 수 */}
          <FormField
            control={control}
            name="basicInfo.numberOfOccupants"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>입주 인원 수</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(Number.parseInt(value))
                    }
                    value={field.value?.toString()}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="입주 인원 수를 선택해 주세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1명</SelectItem>
                      <SelectItem value="2">2명</SelectItem>
                      <SelectItem value="3">3명</SelectItem>
                      <SelectItem value="4">4명</SelectItem>
                      <SelectItem value="5">5명 이상</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 계약 시작일 */}
          <FormField
            control={control}
            name="basicInfo.startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>계약 시작일</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Calendar className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
                    <Input
                      type="date"
                      className="pl-10"
                      placeholder="계약 시작일을 선택해 주세요"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 계약 종료일 */}
          <FormField
            control={control}
            name="basicInfo.endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>계약 종료일</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Calendar className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
                    <Input
                      type="date"
                      className="pl-10"
                      placeholder="계약 종료일을 선택해 주세요"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </SectionContainer>
  );
}
