'use client';

import type { LeaseDetail } from '@/@actions/lease/getLeaseDetail';
import { updateLeaseAdditionalInfo } from '@/@actions/lease/updateLeaseAdditionalInfo';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/design-system/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
} from '@repo/design-system/components/ui/form';
import { Switch } from '@repo/design-system/components/ui/switch';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { BrokerSection } from '../../../new/components/sections/broker-section';
import { CompanySection } from '../../../new/components/sections/company-section';
import { ForeignerSection } from '../../../new/components/sections/foreigner-section';
import { PetInfoSection } from '../../../new/components/sections/pet-info-section';
import { VehicleSection } from '../../../new/components/sections/vehicle-section';

const editAdditionalInfoSchema = z.object({
  additionalInfo: z.object({
    isCorporate: z.boolean().default(false),
    isForeigner: z.boolean().default(false),
    isBrokerLinked: z.boolean().default(false),
    hasVehicle: z.boolean().default(false),
    hasPet: z.boolean().default(false),
    issueTaxInvoice: z.boolean().default(false),
    // 법인 정보
    corporateName: z.string().optional(),
    businessNumber: z.string().optional(),
    representativeName: z.string().optional(),
    corporateEmail: z.string().email().optional().or(z.literal('')),
    corporatePhone: z.string().optional(),
    corporateAddress: z.string().optional(),
    corporateAddressDetail: z.string().optional(),
    // 외국인 정보
    foreignerName: z.string().optional(),
    foreignerRegistrationNumber: z.string().optional(),
    foreignerPhone: z.string().optional(),
    foreignerEmail: z.string().email().optional().or(z.literal('')),
    foreignerAddress: z.string().optional(),
    foreignerAddressDetail: z.string().optional(),
    // 중개사 정보
    brokerOfficeName: z.string().optional(),
    brokerRepresentativeName: z.string().optional(),
    brokerRegistrationNumber: z.string().optional(),
    brokerPhone: z.string().optional(),
    brokerEmail: z.string().email().optional().or(z.literal('')),
    brokerOfficeAddress: z.string().optional(),
    brokerOfficeAddressDetail: z.string().optional(),
    // 차량 정보
    vehicleMaker: z.string().optional(),
    vehicleModel: z.string().optional(),
    vehicleRegistrationNumber: z.string().optional(),
    parkingSpaceId: z.string().optional(),
  }),
  petInfo: z.object({
    name: z.string().optional(),
    type: z.string().optional(),
    weight: z.string().optional(),
    age: z.string().optional(),
    registrationNumber: z.string().optional(),
  }),
});

type EditAdditionalInfoFormData = z.infer<typeof editAdditionalInfoSchema>;

interface EditAdditionalInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lease: LeaseDetail;
}

export function EditAdditionalInfoDialog({
  open,
  onOpenChange,
  lease,
}: EditAdditionalInfoDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  // 기존 데이터를 폼 데이터로 변환
  const getInitialData = (): EditAdditionalInfoFormData => {
    return {
      additionalInfo: {
        isCorporate: lease.isCorporate || false,
        isForeigner: lease.isForeigner || false,
        isBrokerLinked: lease.isBrokerLinked || false,
        hasVehicle: lease.Vehicles.length > 0,
        hasPet: !!lease.Pet,
        issueTaxInvoice: lease.issueTaxInvoice || false,
        // 법인 정보
        corporateName: lease.Company?.companyName || '',
        businessNumber: lease.Company?.businessNumber || '',
        representativeName: lease.Company?.representativeName || '',
        corporateEmail: lease.Company?.contactEmail || '',
        corporatePhone: lease.Company?.contactPhone || '',
        corporateAddress: lease.Company?.address || '',
        corporateAddressDetail: lease.Company?.addressDetail || '',
        // 외국인 정보
        foreignerName: lease.Foreigner?.name || '',
        foreignerRegistrationNumber: lease.Foreigner?.registrationNumber || '',
        foreignerPhone: lease.Foreigner?.phone || '',
        foreignerEmail: lease.Foreigner?.email || '',
        foreignerAddress: lease.Foreigner?.address || '',
        foreignerAddressDetail: lease.Foreigner?.addressDetail || '',
        // 중개사 정보
        brokerOfficeName: lease.Broker?.officeName || '',
        brokerRepresentativeName: lease.Broker?.representativeName || '',
        brokerRegistrationNumber: lease.Broker?.registrationNumber || '',
        brokerPhone: lease.Broker?.phone || '',
        brokerEmail: lease.Broker?.email || '',
        brokerOfficeAddress: lease.Broker?.officeAddress || '',
        brokerOfficeAddressDetail: lease.Broker?.officeAddressDetail || '',
        // 차량 정보
        vehicleMaker: lease.Vehicles[0]?.model || '',
        vehicleModel: lease.Vehicles[0]?.model || '',
        vehicleRegistrationNumber: lease.Vehicles[0]?.licensePlateNumber || '',
        parkingSpaceId: lease.Vehicles[0]?.ParkingSpace?.id?.toString() || '',
      },
      petInfo: {
        name: lease.Pet?.name || '',
        type: lease.Pet?.type || '',
        weight: lease.Pet?.weight?.toString() || '',
        age: lease.Pet?.age?.toString() || '',
        registrationNumber: lease.Pet?.registrationNumber || '',
      },
    };
  };

  const form = useForm({
    resolver: zodResolver(editAdditionalInfoSchema),
    defaultValues: getInitialData(),
  });

  const onSubmit = async (data: EditAdditionalInfoFormData) => {
    setIsLoading(true);

    try {
      // 폼 데이터를 Server Action 형식으로 변환
      const submitData = {
        id: lease.id.toString(),
        isCorporate: data.additionalInfo.isCorporate,
        isForeigner: data.additionalInfo.isForeigner,
        isBrokerLinked: data.additionalInfo.isBrokerLinked,
        issueTaxInvoice: data.additionalInfo.issueTaxInvoice,
        // 법인 정보
        corporateInfo:
          data.additionalInfo.isCorporate && data.additionalInfo.corporateName
            ? {
                companyName: data.additionalInfo.corporateName,
                businessNumber: data.additionalInfo.businessNumber || '',
                representativeName:
                  data.additionalInfo.representativeName || '',
                contactEmail: data.additionalInfo.corporateEmail || '',
                contactPhone: data.additionalInfo.corporatePhone || '',
                address: data.additionalInfo.corporateAddress || '',
                addressDetail: data.additionalInfo.corporateAddressDetail || '',
              }
            : undefined,
        // 중개사 정보
        brokerInfo:
          data.additionalInfo.isBrokerLinked &&
          data.additionalInfo.brokerOfficeName
            ? {
                officeName: data.additionalInfo.brokerOfficeName,
                representativeName:
                  data.additionalInfo.brokerRepresentativeName || '',
                registrationNumber:
                  data.additionalInfo.brokerRegistrationNumber || '',
                phone: data.additionalInfo.brokerPhone || '',
                email: data.additionalInfo.brokerEmail || '',
                officeAddress: data.additionalInfo.brokerOfficeAddress || '',
                officeAddressDetail:
                  data.additionalInfo.brokerOfficeAddressDetail || '',
              }
            : undefined,
        // 외국인 정보
        foreignerInfo:
          data.additionalInfo.isForeigner && data.additionalInfo.foreignerName
            ? {
                name: data.additionalInfo.foreignerName,
                registrationNumber:
                  data.additionalInfo.foreignerRegistrationNumber || '',
                phone: data.additionalInfo.foreignerPhone || '',
                email: data.additionalInfo.foreignerEmail || '',
                address: data.additionalInfo.foreignerAddress || '',
                addressDetail: data.additionalInfo.foreignerAddressDetail || '',
              }
            : undefined,
        // 차량 정보
        vehicles:
          data.additionalInfo.hasVehicle &&
          data.additionalInfo.vehicleRegistrationNumber
            ? [
                {
                  licensePlateNumber:
                    data.additionalInfo.vehicleRegistrationNumber,
                  model:
                    data.additionalInfo.vehicleModel ||
                    data.additionalInfo.vehicleMaker ||
                    '',
                  parkingSpaceId: data.additionalInfo.parkingSpaceId || '',
                },
              ]
            : [],
        // 반려동물 정보
        petInfo:
          data.additionalInfo.hasPet && data.petInfo.name
            ? {
                name: data.petInfo.name,
                type: data.petInfo.type || '',
                weight: data.petInfo.weight || '',
                age: data.petInfo.age || '',
                registrationNumber: data.petInfo.registrationNumber || '',
              }
            : undefined,
      };

      const result = await updateLeaseAdditionalInfo(submitData);

      if (result.ok) {
        toast.success('부가 정보가 성공적으로 수정되었습니다.');
        onOpenChange(false);
        // 페이지 새로고침으로 최신 데이터 반영
        window.location.reload();
      } else {
        toast.error(result.message || '부가 정보 수정 중 오류가 발생했습니다.');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('부가 정보 수정 실패:', error);
      toast.error('부가 정보 수정 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // 다이얼로그가 닫힐 때 폼 초기화
      form.reset(getInitialData());
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>부가 정보 수정</DialogTitle>
          <DialogDescription>
            계약의 부가 정보를 수정할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* 기존 부가정보 섹션 컴포넌트들을 재사용 */}
            <div className="space-y-4">
              {/* 법인 여부 */}
              <FormField
                control={form.control}
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
                      {field.value && (
                        <div className="pl-4">
                          <CompanySection />
                        </div>
                      )}
                    </div>
                  </FormItem>
                )}
              />

              {/* 외국인 여부 */}
              <FormField
                control={form.control}
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
                      {field.value && (
                        <div className="pl-4">
                          <ForeignerSection />
                        </div>
                      )}
                    </div>
                  </FormItem>
                )}
              />

              {/* 중개사 연계 여부 */}
              <FormField
                control={form.control}
                name="additionalInfo.isBrokerLinked"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-col gap-4 rounded-md border p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-md">
                          중개사 연계 여부
                        </p>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </div>
                      {field.value && (
                        <div className="pl-4">
                          <BrokerSection />
                        </div>
                      )}
                    </div>
                  </FormItem>
                )}
              />

              {/* 차량 소유 여부 */}
              <FormField
                control={form.control}
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
                      {field.value && (
                        <div className="pl-4">
                          <VehicleSection
                            buildingId={lease.Unit.Building.id.toString()}
                          />
                        </div>
                      )}
                    </div>
                  </FormItem>
                )}
              />

              {/* 반려동물 존재 여부 */}
              <FormField
                control={form.control}
                name="additionalInfo.hasPet"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-col gap-4 rounded-md border p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-md">
                          반려동물 존재 여부
                        </p>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </div>
                      {field.value && (
                        <div className="pl-4">
                          <PetInfoSection />
                        </div>
                      )}
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                취소
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? '수정 중...' : '수정'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
