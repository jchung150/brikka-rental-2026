'use client';

import { createContractor } from '@/@actions/lease/createContractor';
import { createLease } from '@/@actions/lease/createLease';
import { createUser } from '@/@actions/users/createUser';
import { zodResolver } from '@hookform/resolvers/zod';
import type { RecurrencePeriod } from '@repo/database/generated/client';
import { Button } from '@repo/design-system/components/ui/button';
import {} from '@repo/design-system/components/ui/card';
import { Form } from '@repo/design-system/components/ui/form';
import { Separator } from '@repo/design-system/components/ui/separator';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  type LeaseFormData,
  leaseFormSchema,
} from '../schemas/lease-form-schema';
import { AdditionalInfoSection } from './sections/additional-info-section';
import { BasicInfoSection } from './sections/basic-info-section';
import { BillingInfoSection } from './sections/billing-info-section';
import { ContractorInfoSection } from './sections/contractor-info-section';
import { DepositInfoSection } from './sections/deposit-info-section';
import { DocumentStorageSection } from './sections/document-storage-section';
import { VirtualAccountSection } from './sections/virtual-account-section';

interface NewLeaseFormProps {
  initialData?: Partial<LeaseFormData>;
  isRenewal?: boolean;
}

export function NewLeaseForm({
  initialData,
  isRenewal = false,
}: NewLeaseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const form = useForm<LeaseFormData>({
    resolver: zodResolver(leaseFormSchema),
    defaultValues: initialData || {
      basicInfo: {
        buildingId: '',
        unitId: '',
        status: 'PREPARING',
        numberOfOccupants: 1,
        startDate: '',
        endDate: '',
      },
      tenantInfo: {
        name: '',
        ssn: '',
        phoneNumber: '',
        email: '',
        address: '',
        addressDetail: '',
        accountBank: '농협',
        accountNumber: '',
      },
      contractorInfo: {
        isDifferent: false,
        name: '',
        ssn: '',
        phoneNumber: '',
        email: '',
        address: '',
        addressDetail: '',
        accountBank: '농협',
        accountNumber: '',
      },
      additionalInfo: {
        isCorporate: false,
        isForeigner: false,
        isBrokerLinked: false,
        hasVehicle: false,
        hasPet: false,
        issueTaxInvoice: false,
        corporateName: '',
        businessNumber: '',
        representativeName: '',
        corporateEmail: '',
        corporatePhone: '',
        corporateAddress: '',
        corporateAddressDetail: '',
        foreignerName: '',
        foreignerRegistrationNumber: '',
        foreignerPhone: '',
        foreignerEmail: '',
        foreignerAddress: '',
        foreignerAddressDetail: '',
        brokerOfficeName: '',
        brokerRepresentativeName: '',
        brokerRegistrationNumber: '',
        brokerPhone: '',
        brokerEmail: '',
        brokerOfficeAddress: '',
        brokerOfficeAddressDetail: '',
        vehicleMaker: '',
        vehicleModel: '',
        vehicleRegistrationNumber: '',
        parkingSpaceId: '',
      },
      petInfo: {
        name: '',
        type: '',
        weight: '',
        age: '',
        registrationNumber: '',
      },
      virtualAccount: {
        bank: '농협',
        accountNumber: '',
        accountHolder: '',
      },
      depositInfo: {
        amount: '',
        returnDate: '',
      },
      billingInfo: {
        regularBilling: [],
        irregularBilling: [],
      },
      documentStorage: {
        title: '',
        file: undefined,
        category: '',
        memo: '',
      },
      sendWelcomeEmail: true,
    },
  });

  const onSubmit = async (data: LeaseFormData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const {
        basicInfo,
        tenantInfo,
        contractorInfo,
        additionalInfo,
        depositInfo,
      } = data;

      // 1) 임차인 사용자 생성
      const tenantResult = await createUser({
        email: tenantInfo.email,
        password: 'temp123!', // 임시 비밀번호 - 실제로는 사용자에게 전달
        name: tenantInfo.name,
        phoneNumber: tenantInfo.phoneNumber,
        address: tenantInfo.address,
        addressDetail: tenantInfo.addressDetail,
        accountBank: tenantInfo.accountBank,
        accountNumber: tenantInfo.accountNumber,
        userRole: 'TENANT',
      });

      if (!tenantResult.ok) {
        toast.error(
          tenantResult.message || '입주자 생성 중 오류가 발생했습니다.'
        );
        return;
      }

      // 2) 계약자가 다른 경우 계약자 생성
      let contractorId: string | undefined;
      if (contractorInfo.isDifferent) {
        const contractorResult = await createContractor({
          name: contractorInfo.name ?? '',
          ssn: contractorInfo.ssn,
          phoneNumber: contractorInfo.phoneNumber,
          email: contractorInfo.email,
          address: contractorInfo.address,
          addressDetail: contractorInfo.addressDetail,
          accountBank: contractorInfo.accountBank,
          accountNumber: contractorInfo.accountNumber,
        });

        if (!contractorResult.ok) {
          toast.error(
            contractorResult.message || '계약자 생성 중 오류가 발생했습니다.'
          );
          return;
        }

        contractorId = contractorResult.data.id;
      }

      const regularBilling = data.billingInfo.regularBilling ?? [];
      const irregularBilling = data.billingInfo.irregularBilling ?? [];

      // 3) 임대차 계약 생성
      const leaseResult = await createLease({
        unitId: basicInfo.unitId,
        tenantId: tenantResult.data.id,
        contractorId,
        startDate: dayjs(basicInfo.startDate).toISOString(),
        endDate: dayjs(basicInfo.endDate).toISOString(),
        status: basicInfo.status ?? 'PREPARING',
        numberOfOccupants: basicInfo.numberOfOccupants,
        isSublease: additionalInfo.isBrokerLinked ?? false,
        isBrokerLinked: additionalInfo.isBrokerLinked ?? false,
        isCorporate: additionalInfo.isCorporate ?? false,
        isForeigner: additionalInfo.isForeigner ?? false,
        issueTaxInvoice: additionalInfo.issueTaxInvoice ?? false,
        depositReturnDate: depositInfo.returnDate
          ? dayjs(depositInfo.returnDate).toISOString()
          : undefined,
        memo: data.documentStorage.memo,
        // 법인 정보
        corporateInfo:
          additionalInfo.isCorporate && additionalInfo.corporateName
            ? {
                companyName: additionalInfo.corporateName,
                businessNumber: additionalInfo.businessNumber ?? '',
                representativeName: additionalInfo.representativeName,
                contactEmail: additionalInfo.corporateEmail,
                contactPhone: additionalInfo.corporatePhone,
                address: additionalInfo.corporateAddress,
                addressDetail: additionalInfo.corporateAddressDetail,
              }
            : undefined,
        // 중개사 정보
        brokerInfo:
          additionalInfo.isBrokerLinked && additionalInfo.brokerOfficeName
            ? {
                officeName: additionalInfo.brokerOfficeName,
                representativeName:
                  additionalInfo.brokerRepresentativeName ?? '',
                registrationNumber:
                  additionalInfo.brokerRegistrationNumber ?? '',
                phone: additionalInfo.brokerPhone,
                email: additionalInfo.brokerEmail,
                officeAddress: additionalInfo.brokerOfficeAddress,
                officeAddressDetail: additionalInfo.brokerOfficeAddressDetail,
              }
            : undefined,
        // 외국인 정보
        foreignerInfo:
          additionalInfo.isForeigner && additionalInfo.foreignerName
            ? {
                name: additionalInfo.foreignerName,
                registrationNumber:
                  additionalInfo.foreignerRegistrationNumber ?? '',
                phone: additionalInfo.foreignerPhone,
                email: additionalInfo.foreignerEmail,
                address: additionalInfo.foreignerAddress,
                addressDetail: additionalInfo.foreignerAddressDetail,
              }
            : undefined,
        // 차량 정보
        vehicles:
          additionalInfo.hasVehicle && additionalInfo.vehicleRegistrationNumber
            ? [
                {
                  licensePlateNumber: additionalInfo.vehicleRegistrationNumber,
                  model:
                    additionalInfo.vehicleModel || additionalInfo.vehicleMaker,
                },
              ]
            : undefined,
        // 반려동물 정보
        petInfo:
          additionalInfo.hasPet && data.petInfo.name
            ? {
                name: data.petInfo.name,
                type: data.petInfo.type,
                weight: data.petInfo.weight,
                age: data.petInfo.age,
                registrationNumber: data.petInfo.registrationNumber,
              }
            : undefined,
        // 청구 스케줄 정보
        billingSchedules:
          regularBilling.length > 0 || irregularBilling.length > 0
            ? [
                // 정기 청구
                ...regularBilling.map((billing) => ({
                  itemName: billing.itemName,
                  amount: Number(billing.amount),
                  dueDate: dayjs(billing.dueDate).toISOString(),
                  recurrenceType: 'RECURRING' as const,
                  recurrencePeriod:
                    billing.recurrencePeriod as RecurrencePeriod,
                  recurrenceEndDate:
                    billing.periodSetting === 'CUSTOM' && billing.periodCount
                      ? getRecurrenceEndDate(
                          billing.dueDate,
                          billing.periodCount,
                          billing.recurrencePeriod
                        ).toISOString()
                      : undefined,
                  isTaxable: billing.isTaxable ?? false,
                  memo: billing.memo,
                  notificationDays: billing.notificationDays,
                })),
                // 비정기 청구
                ...irregularBilling.map((billing) => ({
                  itemName: billing.itemName,
                  amount: Number.parseFloat(billing.amount),
                  dueDate: dayjs(billing.dueDate).toISOString(),
                  recurrenceType: 'ONE_TIME' as const,
                  recurrencePeriod: undefined,
                  recurrenceEndDate: undefined,
                  isTaxable: billing.isTaxable ?? false,
                  memo: billing.memo,
                  notificationDays: billing.notificationDays,
                })),
              ]
            : undefined,
        sendWelcomeEmail: data.sendWelcomeEmail,
      });

      if (leaseResult.ok) {
        toast.success('계약이 성공적으로 등록되었습니다.');
        router.push('/leases');
      } else {
        toast.error(leaseResult.message || '계약 등록 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('계약 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto space-y-8 py-6">
      <div className="space-y-2">
        <h1 className="font-bold text-2xl text-gray-900">
          {isRenewal ? '재계약 등록' : '신규 계약 등록'}
        </h1>
        <p className="text-gray-600">
          {isRenewal
            ? '기존 계약을 기반으로 재계약을 등록합니다.'
            : '새로운 임대 계약을 등록합니다.'}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* 기본 정보 */}
          <BasicInfoSection />

          {/* 계약자 정보 */}
          <ContractorInfoSection />

          {/* 부가 정보 */}
          <AdditionalInfoSection />

          {/* 가상 계좌번호 발급 */}
          <VirtualAccountSection />

          {/* 보증금 정보 */}
          <DepositInfoSection />

          {/* 임대/청구정보 */}
          <BillingInfoSection />

          {/* 문서 보관 */}
          <DocumentStorageSection />

          <Separator />

          {/* 액션 버튼 */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '등록 중...' : '등록'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

const periodMonth: Record<RecurrencePeriod, number> = {
  MONTHLY: 1,
  QUARTERLY: 3,
  YEARLY: 12,
};
const getRecurrenceEndDate = (
  dueDate: string,
  periodCount: number,
  period: RecurrencePeriod | undefined
) => {
  return dayjs(dueDate)
    .add(periodCount * periodMonth[period ?? 'MONTHLY'], 'm')
    .toDate();
};
