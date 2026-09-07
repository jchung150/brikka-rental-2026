'use server';

import { auth } from '@/auth';
import { ERROR_CODES, type Result } from '@repo/common/types';
import { database } from '@repo/database';
import { z } from 'zod';

const updateLeaseAdditionalInfoSchema = z.object({
  id: z.string().min(1, '계약 ID가 필요합니다'),
  isCorporate: z.boolean().optional(),
  isForeigner: z.boolean().optional(),
  isBrokerLinked: z.boolean().optional(),
  issueTaxInvoice: z.boolean().optional(),
  // 법인 정보
  corporateInfo: z
    .object({
      companyName: z.string(),
      businessNumber: z.string(),
      representativeName: z.string(),
      contactEmail: z.string().optional(),
      contactPhone: z.string().optional(),
      address: z.string().optional(),
      addressDetail: z.string().optional(),
    })
    .optional(),
  // 중개사 정보
  brokerInfo: z
    .object({
      officeName: z.string(),
      representativeName: z.string(),
      registrationNumber: z.string(),
      phone: z.string(),
      email: z.string(),
      officeAddress: z.string(),
      officeAddressDetail: z.string().optional(),
    })
    .optional(),
  // 외국인 정보
  foreignerInfo: z
    .object({
      name: z.string(),
      registrationNumber: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      address: z.string().optional(),
      addressDetail: z.string().optional(),
    })
    .optional(),
  // 차량 정보
  vehicles: z
    .array(
      z.object({
        licensePlateNumber: z.string(),
        model: z.string().optional(),
        parkingSpaceId: z.string().optional(),
      })
    )
    .optional(),
  // 반려동물 정보
  petInfo: z
    .object({
      name: z.string(),
      type: z.string().optional(),
      weight: z.string().optional(),
      age: z.string().optional(),
      registrationNumber: z.string().optional(),
    })
    .optional(),
});

export async function updateLeaseAdditionalInfo(
  input: z.infer<typeof updateLeaseAdditionalInfoSchema>
): Promise<Result<{ id: string; updatedAt: Date }>> {
  // 1) 입력 검증
  const parsed = updateLeaseAdditionalInfoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      code: 'VALIDATION_ERROR',
      message: parsed.error.errors[0]?.message || '입력 오류가 발생했습니다',
    };
  }

  // 2) 권한 검사
  const session = await auth();
  if (!session?.user) {
    return {
      ok: false,
      code: ERROR_CODES.UNAUTHORIZED,
      message: '로그인이 필요합니다.',
    };
  }

  const {
    id,
    corporateInfo,
    brokerInfo,
    foreignerInfo,
    vehicles,
    petInfo,
    ...leaseData
  } = parsed.data;

  try {
    // 3) 계약 존재 여부 확인
    const existingLease = await database.lease.findUnique({
      where: { id: BigInt(id) },
      select: { id: true },
    });

    if (!existingLease) {
      return {
        ok: false,
        code: ERROR_CODES.NOT_FOUND,
        message: '존재하지 않는 임대차 계약입니다.',
      };
    }

    // 4) 트랜잭션으로 관련 정보 업데이트
    const updatedLease = await database.$transaction(async (tx) => {
      // 계약 기본 정보 업데이트
      const lease = await tx.lease.update({
        where: { id: BigInt(id) },
        data: leaseData,
      });

      // 법인 정보 업데이트
      if (corporateInfo) {
        await tx.company.upsert({
          where: { id: lease.companyId ?? 0 },
          update: corporateInfo,
          create: {
            ...corporateInfo,
          },
        });
      }

      // 중개사 정보 업데이트
      if (brokerInfo) {
        await tx.leaseBroker.upsert({
          where: { id: lease.brokerId ?? 0 },
          update: brokerInfo,
          create: {
            ...brokerInfo,
          },
        });
      }

      // 외국인 정보 업데이트
      if (foreignerInfo) {
        await tx.leaseForeigner.upsert({
          where: { id: lease.foreignerId ?? 0 },
          update: foreignerInfo,
          create: {
            ...foreignerInfo,
            registrationNumber: foreignerInfo.registrationNumber ?? '',
          },
        });
      }

      // 차량 정보 업데이트 (기존 차량 삭제 후 새로 생성)
      if (vehicles !== undefined) {
        await tx.leaseVehicle.deleteMany({
          where: { leaseId: BigInt(id) },
        });

        if (vehicles.length > 0) {
          await tx.leaseVehicle.createMany({
            data: vehicles.map((vehicle) => ({
              ...vehicle,
              leaseId: BigInt(id),
              parkingSpaceId: vehicle.parkingSpaceId
                ? BigInt(vehicle.parkingSpaceId)
                : null,
            })),
          });
        }
      }

      // 반려동물 정보 업데이트
      if (petInfo) {
        await tx.leasePet.upsert({
          where: { id: lease.petId ?? 0 },
          update: {
            ...petInfo,
            weight: petInfo.weight ? petInfo.weight.toString() : null,
            age: petInfo.age ? petInfo.age.toString() : null,
          },
          create: {
            ...petInfo,
            weight: petInfo.weight ? petInfo.weight.toString() : null,
            age: petInfo.age ? petInfo.age.toString() : null,
          },
        });
      }

      return lease;
    });

    return {
      ok: true,
      data: {
        id: updatedLease.id.toString(),
        updatedAt: updatedLease.updatedAt,
      },
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[updateLeaseAdditionalInfo] error:', error);
    return {
      ok: false,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: '부가 정보 수정 중 오류가 발생했습니다.',
    };
  }
}
