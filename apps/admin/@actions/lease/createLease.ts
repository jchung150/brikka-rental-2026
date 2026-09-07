'use server';

import { ERROR_CODES, ERROR_MESSAGES, type Result } from '@repo/common/types';
import {
  type LeaseStatus,
  type RecurrencePeriod,
  type RecurrenceType,
  database,
} from '@repo/database';
import { sendTenantWelcomeEmail } from '@repo/email';
import { requireRole } from '../lib/auth';
import { trackCreate } from '../lib/change-history';
import { generateTemporaryPassword, hashPassword } from '../lib/enc';

type Input = {
  unitId: string;
  tenantId: string;
  contractorId?: string;
  startDate: string;
  endDate: string;
  status: LeaseStatus;
  numberOfOccupants?: number;
  isSublease: boolean;
  isBrokerLinked: boolean;
  isCorporate: boolean;
  isForeigner: boolean;
  issueTaxInvoice: boolean;
  depositReturnDate?: string;
  memo?: string;
  // 법인 정보
  corporateInfo?: {
    companyName: string;
    businessNumber: string;
    representativeName?: string;
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
    addressDetail?: string;
  };
  // 중개사 정보
  brokerInfo?: {
    officeName: string;
    representativeName: string;
    registrationNumber: string;
    phone?: string;
    email?: string;
    officeAddress?: string;
    officeAddressDetail?: string;
  };
  // 외국인 정보
  foreignerInfo?: {
    name: string;
    registrationNumber: string;
    phone?: string;
    email?: string;
    address?: string;
    addressDetail?: string;
  };
  // 차량 정보
  vehicles?: Array<{
    licensePlateNumber: string;
    model?: string;
  }>;
  // 반려동물 정보
  petInfo?: {
    name: string;
    type?: string;
    weight?: string;
    age?: string;
    registrationNumber?: string;
  };
  // 청구 스케줄 정보
  billingSchedules?: Array<{
    itemName: string;
    amount: number;
    dueDate: string;
    recurrenceType: RecurrenceType;
    recurrencePeriod?: RecurrencePeriod;
    recurrenceEndDate?: string;
    isTaxable: boolean;
    memo?: string;
    notificationDays?: number;
  }>;
  sendWelcomeEmail?: boolean;
};

export async function createLease(
  input: Input
): Promise<Result<{ id: string }>> {
  if (!requireRole('ADMIN')) {
    return {
      ok: false,
      code: ERROR_CODES.FORBIDDEN,
      message: ERROR_MESSAGES.FORBIDDEN,
    };
  }

  const {
    unitId,
    tenantId,
    contractorId,
    startDate,
    endDate,
    status,
    numberOfOccupants,
    isSublease,
    isBrokerLinked,
    isCorporate,
    isForeigner,
    issueTaxInvoice,
    depositReturnDate,
    memo,
    corporateInfo,
    brokerInfo,
    foreignerInfo,
    vehicles,
    petInfo,
    billingSchedules,
    sendWelcomeEmail,
  } = input;

  try {
    // 2) 유닛 존재 확인 및 상태 확인
    const unit = await database.unit.findUnique({
      where: { id: BigInt(unitId) },
      select: {
        id: true,
        status: true,
        buildingId: true,
        unitNumber: true,
        floor: true,
        Building: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!unit) {
      return {
        ok: false,
        code: ERROR_CODES.NOT_FOUND,
        message: '지정된 유닛을 찾을 수 없습니다.',
      };
    }

    if (unit.status === 'OCCUPIED') {
      return {
        ok: false,
        code: ERROR_CODES.CONFLICT,
        message: '이미 입주 중인 유닛입니다.',
      };
    }

    // 3) 임차인 존재 확인
    const tenant = await database.user.findUnique({
      where: { id: BigInt(tenantId) },
      select: {
        id: true,
        userRole: true,
        email: true,
        name: true,
      },
    });

    if (!tenant) {
      return {
        ok: false,
        code: ERROR_CODES.NOT_FOUND,
        message: '지정된 입주자를 찾을 수 없습니다.',
      };
    }

    // 4) 계약자 ID가 제공된 경우 계약자 존재 확인
    if (contractorId) {
      const contractor = await database.leaseContractor.findUnique({
        where: { id: BigInt(contractorId) },
        select: { id: true },
      });

      if (!contractor) {
        return {
          ok: false,
          code: ERROR_CODES.NOT_FOUND,
          message: '지정된 계약자를 찾을 수 없습니다.',
        };
      }
    }

    // 5) 계약 기간 유효성 확인
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return {
        ok: false,
        code: ERROR_CODES.VALIDATION_ERROR,
        message: '계약 종료일은 시작일보다 늦어야 합니다.',
      };
    }

    // 6) 해당 기간에 다른 계약이 있는지 확인
    const conflictingLease = await database.lease.findFirst({
      where: {
        unitId: BigInt(unitId),
        status: { notIn: ['COMPLETED', 'TERMINATED'] },
        OR: [
          {
            startDate: { lte: end },
            endDate: { gte: start },
          },
        ],
      },
      select: { id: true },
    });

    if (conflictingLease) {
      return {
        ok: false,
        code: ERROR_CODES.CONFLICT,
        message: '해당 기간에 이미 다른 계약이 존재합니다.',
      };
    }

    // 7) 임시 비밀번호 생성
    const tempPassword = generateTemporaryPassword();

    // 8) 임대차 계약 생성
    const lease = await database.$transaction(async (tx) => {
      // 7-1) 법인 정보 생성 (필요한 경우)
      let companyId: bigint | undefined;
      if (isCorporate && corporateInfo) {
        const company = await tx.company.create({
          data: {
            companyName: corporateInfo.companyName,
            businessNumber: corporateInfo.businessNumber,
            representativeName: corporateInfo.representativeName,
            contactEmail: corporateInfo.contactEmail,
            contactPhone: corporateInfo.contactPhone,
            address: corporateInfo.address,
            addressDetail: corporateInfo.addressDetail,
          },
        });
        companyId = company.id;
      }

      // 7-2) 중개사 정보 생성 (필요한 경우)
      let brokerId: bigint | undefined;
      if (isBrokerLinked && brokerInfo) {
        const broker = await tx.leaseBroker.create({
          data: {
            officeName: brokerInfo.officeName,
            representativeName: brokerInfo.representativeName,
            registrationNumber: brokerInfo.registrationNumber,
            phone: brokerInfo.phone,
            email: brokerInfo.email,
            officeAddress: brokerInfo.officeAddress,
            officeAddressDetail: brokerInfo.officeAddressDetail,
          },
        });
        brokerId = broker.id;
      }

      // 7-3) 외국인 정보 생성 (필요한 경우)
      let foreignerId: bigint | undefined;
      if (isForeigner && foreignerInfo) {
        const foreigner = await tx.leaseForeigner.create({
          data: {
            name: foreignerInfo.name,
            registrationNumber: foreignerInfo.registrationNumber,
            phone: foreignerInfo.phone,
            email: foreignerInfo.email,
            address: foreignerInfo.address,
            addressDetail: foreignerInfo.addressDetail,
          },
        });
        foreignerId = foreigner.id;
      }

      // 7-4) 반려동물 정보 생성 (필요한 경우)
      let petId: bigint | undefined;
      if (petInfo) {
        const pet = await tx.leasePet.create({
          data: {
            name: petInfo.name,
            type: petInfo.type,
            weight: petInfo.weight,
            age: petInfo.age,
            registrationNumber: petInfo.registrationNumber,
          },
        });
        petId = pet.id;
      }

      // 7-5) 임대차 계약 생성
      const newLease = await tx.lease.create({
        data: {
          unitId: BigInt(unitId),
          LeaseTenants: {
            create: {
              tenantId: BigInt(tenantId),
              isRepresentative: true,
            },
          },
          contractorId: contractorId ? BigInt(contractorId) : null,
          startDate: start,
          endDate: end,
          status,
          numberOfOccupants,
          isSublease,
          isBrokerLinked,
          isCorporate,
          isForeigner,
          issueTaxInvoice,
          depositReturnDate: depositReturnDate
            ? new Date(depositReturnDate)
            : null,
          memo,
          companyId,
          brokerId,
          foreignerId,
          petId,
        },
        select: { id: true },
      });

      // 7-6) 차량 정보 생성 (필요한 경우)
      if (vehicles && vehicles.length > 0) {
        await tx.leaseVehicle.createMany({
          data: vehicles.map((vehicle) => ({
            leaseId: newLease.id,
            licensePlateNumber: vehicle.licensePlateNumber,
            model: vehicle.model,
          })),
        });
      }

      // 7-7) 청구 스케줄 생성 (필요한 경우)
      if (billingSchedules && billingSchedules.length > 0) {
        await tx.leaseBillingSchedule.createMany({
          data: billingSchedules.map((schedule) => ({
            leaseId: newLease.id,
            itemName: schedule.itemName,
            amount: schedule.amount,
            dueDate: new Date(schedule.dueDate),
            recurrenceType: schedule.recurrenceType,
            recurrencePeriod: schedule.recurrencePeriod,
            recurrenceEndDate: schedule.recurrenceEndDate
              ? new Date(schedule.recurrenceEndDate)
              : null,
            isTaxable: schedule.isTaxable,
            memo: schedule.memo,
            notificationDays: schedule.notificationDays,
          })),
        });
      }

      // 7-8) 유닛 상태를 OCCUPIED로 변경
      await tx.unit.update({
        where: { id: BigInt(unitId) },
        data: { status: 'OCCUPIED' },
      });

      // 7-9) 입주자 계정에 임시 비밀번호 설정
      await tx.user.update({
        where: { id: BigInt(tenantId) },
        data: { passwordHash: await hashPassword(tempPassword) },
      });

      return newLease;
    });

    // 9) 변경 이력 기록 (트랜잭션 외부에서 처리)
    await trackCreate('LEASE', lease.id, {
      unitId,
      tenantId,
      contractorId,
      startDate,
      endDate,
      status,
      numberOfOccupants,
      isSublease,
      isBrokerLinked,
      isCorporate,
      isForeigner,
      issueTaxInvoice,
      depositReturnDate,
      memo,
    });

    // 10) 입주자에게 웰컴 이메일 전송 (트랜잭션 외부에서 처리)
    try {
      if (sendWelcomeEmail && tenant.email) {
        await sendTenantWelcomeEmail({
          tenantEmail: tenant.email,
          tenantName: tenant.name,
          buildingName: unit.Building.name,
          unitNumber: unit.unitNumber,
          floor: unit.floor,
          startDate: start,
          endDate: end,
          temporaryPassword: tempPassword,
        });
        // biome-ignore lint/suspicious/noConsole: Server-side logging
        // biome-ignore lint/suspicious/noConsoleLog: Server-side logging
        console.log('[createLease] 웰컴 이메일 전송 완료');
      }
    } catch (emailError) {
      // biome-ignore lint/suspicious/noConsole: Server-side logging
      console.error('[createLease] 웰컴 이메일 전송 실패:', emailError);
      // 이메일 전송 실패는 계약 생성에 영향을 주지 않음
    }

    return { ok: true, data: { id: lease.id.toString() } };
  } catch (e) {
    // biome-ignore lint/suspicious/noConsole: Server-side logging
    console.error('[createLease] error', e);
    return {
      ok: false,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: '임대차 계약 생성 중 오류가 발생했습니다.',
    };
  }
}
