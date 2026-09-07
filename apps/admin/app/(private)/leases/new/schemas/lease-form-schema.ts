import {
  RecurrencePeriod,
  RecurrenceType,
} from '@repo/database/generated/client';
import { z } from 'zod';

// 기본 정보 섹션
export const basicInfoSchema = z.object({
  buildingId: z.string().min(1, '건물을 선택해주세요'),
  unitId: z.string().min(1, '유닛을 선택해주세요'),
  status: z
    .enum(['PREPARING', 'ACTIVE', 'COMPLETED', 'TERMINATED'])
    .default('PREPARING'),
  numberOfOccupants: z.number().min(1, '입주 인원 수를 선택해주세요'),
  startDate: z.string().min(1, '계약 시작일을 선택해주세요'),
  endDate: z.string().min(1, '계약 종료일을 선택해주세요'),
});

// 대표 입주자 정보
export const tenantInfoSchema = z.object({
  name: z.string().min(1, '입주자 이름을 입력해주세요'),
  ssn: z.string().min(1, '주민등록번호를 입력해주세요'),
  phoneNumber: z.string().min(1, '연락처를 입력해주세요'),
  email: z.string().email('올바른 이메일을 입력해주세요'),
  address: z.string().min(1, '주소를 입력해주세요'),
  addressDetail: z.string().optional(),
  accountBank: z.string().min(1, '은행을 선택해주세요'),
  accountNumber: z.string().min(1, '계좌번호를 입력해주세요'),
});

// 계약자 정보 (입주자와 다를 경우)
export const contractorInfoSchema = z
  .object({
    isDifferent: z.boolean().default(false),
    name: z.string().optional(),
    ssn: z.string().optional(),
    phoneNumber: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    address: z.string().optional(),
    addressDetail: z.string().optional(),
    accountBank: z.string().optional(),
    accountNumber: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.isDifferent) {
        return (
          data.name &&
          data.ssn &&
          data.phoneNumber &&
          data.email &&
          data.address &&
          data.accountBank &&
          data.accountNumber
        );
      }
      return true;
    },
    {
      message: '계약자 정보를 모두 입력해주세요',
      path: ['name'],
    }
  );

// 부가 정보 섹션
export const additionalInfoSchema = z
  .object({
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
  })
  .refine(
    (data) => {
      if (data.isCorporate) {
        return (
          data.corporateName && data.businessNumber && data.representativeName
          // data.corporateEmail &&
          // data.corporatePhone &&
          // data.corporateAddress
        );
      }
      return true;
    },
    {
      message: '법인 정보를 모두 입력해주세요',
      path: ['corporateName'],
    }
  )
  .refine(
    (data) => {
      if (data.isForeigner) {
        return data.foreignerName;
        // data.foreignerRegistrationNumber &&
        // data.foreignerPhone &&
        // data.foreignerEmail &&
        // data.foreignerAddress
      }
      return true;
    },
    {
      message: '외국인 정보를 모두 입력해주세요',
      path: ['foreignerName'],
    }
  )
  .refine(
    (data) => {
      if (data.isBrokerLinked) {
        return (
          data.brokerOfficeName &&
          data.brokerRepresentativeName &&
          data.brokerRegistrationNumber &&
          data.brokerPhone &&
          data.brokerEmail &&
          data.brokerOfficeAddress
        );
      }
      return true;
    },
    {
      message: '중개사 정보를 모두 입력해주세요',
      path: ['brokerOfficeName'],
    }
  )
  .refine(
    (data) => {
      if (data.hasVehicle) {
        return data.vehicleRegistrationNumber;
      }
      return true;
    },
    {
      message: '차량 번호를 입력해주세요',
      path: ['vehicleRegistrationNumber'],
    }
  );

// 반려동물 정보
export const petInfoSchema = z
  .object({
    name: z.string().optional(),
    type: z.string().optional(),
    weight: z.string().optional(),
    age: z.string().optional(),
    registrationNumber: z.string().optional(),
  })
  .refine(
    (data) => {
      // hasPet이 true일 때만 검증
      return true; // 실제로는 부모 컴포넌트에서 hasPet 상태를 확인
    },
    {
      message: '반려동물 정보를 입력해주세요',
    }
  );

// 가상 계좌번호 발급
export const virtualAccountSchema = z.object({
  bank: z.string().default('농협'),
  accountNumber: z.string().optional(),
  accountHolder: z.string().optional(),
});

// 보증금 정보
export const depositInfoSchema = z.object({
  amount: z.string().min(1, '보증금 약정액을 입력해주세요'),
  returnDate: z.string().min(1, '보증금 반환 예정일을 선택해주세요'),
});

// 청구 정보 (정기/비정기)
export const billingInfoSchema = z.object({
  regularBilling: z
    .array(
      z
        .object({
          itemName: z.string().min(1, '청구 항목을 선택해주세요'),
          amount: z.string().min(1, '약정액을 입력해주세요'),
          dueDate: z.string().min(1, '다음 납부일을 입력해주세요'),
          recurrenceType: z.nativeEnum(RecurrenceType).default('RECURRING'),
          recurrencePeriod: z.nativeEnum(RecurrencePeriod).default('MONTHLY'),
          periodSetting: z.enum(['UNTIL_END', 'CUSTOM']).default('UNTIL_END'),
          periodCount: z.number().optional(),
          isTaxable: z.boolean().default(true),
          memo: z.string().optional(),
          notificationDays: z.number().default(5),
        })
        .refine(
          (data) => {
            if (data.periodSetting === 'CUSTOM') {
              return data.periodCount && data.periodCount > 0;
            }
            return true;
          },
          {
            message: '반복 횟수를 입력해주세요',
            path: ['periodCount'],
          }
        )
    )
    .default([]),
  irregularBilling: z
    .array(
      z.object({
        itemName: z.string().min(1, '청구 항목을 선택해주세요'),
        amount: z.string().min(1, '약정액을 입력해주세요'),
        dueDate: z.string().min(1, '다음 납부일을 선택해주세요'),
        isTaxable: z.boolean().default(true),
        memo: z.string().optional(),
        notificationDays: z.number().default(5),
      })
    )
    .default([]),
});

// 문서 보관
export const documentStorageSchema = z.object({
  title: z.string().optional(),
  file: z.any().optional(), // File 객체
  category: z.string().optional(),
  memo: z.string().optional(),
});

// 전체 폼 스키마
export const leaseFormSchema = z.object({
  basicInfo: basicInfoSchema,
  tenantInfo: tenantInfoSchema,
  contractorInfo: contractorInfoSchema,
  additionalInfo: additionalInfoSchema,
  petInfo: petInfoSchema,
  virtualAccount: virtualAccountSchema,
  depositInfo: depositInfoSchema,
  billingInfo: billingInfoSchema,
  documentStorage: documentStorageSchema,
  sendWelcomeEmail: z.boolean().default(true),
});

export type LeaseFormData = z.input<typeof leaseFormSchema>;
export type BasicInfoData = z.input<typeof basicInfoSchema>;
export type TenantInfoData = z.input<typeof tenantInfoSchema>;
export type ContractorInfoData = z.input<typeof contractorInfoSchema>;
export type AdditionalInfoData = z.input<typeof additionalInfoSchema>;
export type PetInfoData = z.input<typeof petInfoSchema>;
export type VirtualAccountData = z.input<typeof virtualAccountSchema>;
export type DepositInfoData = z.input<typeof depositInfoSchema>;
export type BillingInfoData = z.input<typeof billingInfoSchema>;
export type DocumentStorageData = z.input<typeof documentStorageSchema>;
