'use client';

import { FormField, FormItem } from '@repo/design-system/components/ui/form';
import { Switch } from '@repo/design-system/components/ui/switch';
import { useFormContext } from 'react-hook-form';
import type {
  AdditionalInfoData,
  BasicInfoData,
} from '../../schemas/lease-form-schema';
import { BrokerSection } from './broker-section';
import { CompanySection } from './company-section';
import { SectionContainer } from './container';
import { ForeignerSection } from './foreigner-section';
import { PetInfoSection } from './pet-info-section';
import { VehicleSection } from './vehicle-section';

export function AdditionalInfoSection() {
  const { control, watch } = useFormContext<{
    additionalInfo: AdditionalInfoData;
    basicInfo: BasicInfoData;
  }>();

  const buildingId = watch('basicInfo.buildingId');

  return (
    <SectionContainer title="부가 정보">
      <div className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={control}
            name="additionalInfo.isCorporate"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-col gap-4 rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-md">법인 여부</p>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                  {field.value && <CompanySection />}
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="additionalInfo.isForeigner"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-col gap-4 rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-md">외국인 여부</p>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                  {field.value && <ForeignerSection />}
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="additionalInfo.isBrokerLinked"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-col gap-4 rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-md">중계사 연계 여부</p>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                  {field.value && <BrokerSection />}
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="additionalInfo.hasVehicle"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-col gap-4 rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-md">차량 소유 여부</p>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                  {field.value && <VehicleSection buildingId={buildingId} />}
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="additionalInfo.hasPet"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-col gap-4 rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-md">반려동물 존재 여부</p>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                  {field.value && <PetInfoSection />}
                </div>
              </FormItem>
            )}
          />
        </div>
      </div>
    </SectionContainer>
  );
}
