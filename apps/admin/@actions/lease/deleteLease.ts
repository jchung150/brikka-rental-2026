'use server';

import { ERROR_CODES, ERROR_MESSAGES, type Result } from '@repo/common/types';
import { database } from '@repo/database';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireRole } from '../lib/auth';
import { trackDelete } from '../lib/change-history';

const Input = z.object({
  id: z.string().min(1, '계약 ID는 필수입니다'),
});

export async function deleteLease(
  input: unknown
): Promise<Result<{ id: string }>> {
  if (!requireRole('ADMIN')) {
    return {
      ok: false,
      code: ERROR_CODES.FORBIDDEN,
      message: ERROR_MESSAGES.FORBIDDEN,
    };
  }

  // 1) 입력 검증
  const parsed = Input.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: ERROR_MESSAGES.VALIDATION_ERROR,
    };
  }

  const { id } = parsed.data;

  try {
    // 2) 계약 존재 확인 (전체 데이터 조회)
    const existingLease = await database.lease.findUnique({
      where: { id: BigInt(id) },
      include: {
        Unit: {
          select: {
            id: true,
            buildingId: true,
          },
        },
      },
    });

    if (!existingLease) {
      return {
        ok: false,
        code: ERROR_CODES.NOT_FOUND,
        message: '존재하지 않는 계약입니다.',
      };
    }

    // 3) 활성 계약 삭제 방지 (안전장치)
    if (existingLease.status === 'ACTIVE') {
      return {
        ok: false,
        code: ERROR_CODES.FORBIDDEN,
        message:
          '진행 중인 계약은 삭제할 수 없습니다. 먼저 계약을 종료해주세요.',
      };
    }

    // 4) 관련 데이터 확인
    const relatedData = await database.$transaction(async (tx) => {
      // 청구 스케줄 수
      const billingSchedules = await tx.leaseBillingSchedule.count({
        where: { leaseId: BigInt(id) },
      });

      // 알림 설정 수
      const notificationSettings = await tx.leaseNotificationSetting.count({
        where: { leaseId: BigInt(id) },
      });

      // 첨부파일 수
      const attachments = await tx.attachment.count({
        where: { leaseId: BigInt(id) },
      });

      // 청구서 수
      const bills = await tx.bill.count({
        where: { leaseId: BigInt(id) },
      });

      // 차량 정보 수
      const vehicles = await tx.leaseVehicle.count({
        where: { leaseId: BigInt(id) },
      });

      return {
        billingSchedules,
        notificationSettings,
        attachments,
        bills,
        vehicles,
      };
    });

    // 5) 삭제 가능 여부 확인 및 경고 메시지 생성
    const hasRelatedData = Object.values(relatedData).some(
      (count) => count > 0
    );

    if (hasRelatedData) {
      const warnings: string[] = [];
      if (relatedData.billingSchedules > 0) {
        warnings.push(`${relatedData.billingSchedules}개 청구 스케줄`);
      }
      if (relatedData.notificationSettings > 0) {
        warnings.push(`${relatedData.notificationSettings}개 알림 설정`);
      }
      if (relatedData.attachments > 0) {
        warnings.push(`${relatedData.attachments}개 첨부파일`);
      }
      if (relatedData.bills > 0) {
        warnings.push(`${relatedData.bills}개 청구서`);
      }
      if (relatedData.vehicles > 0) {
        warnings.push(`${relatedData.vehicles}개 차량 정보`);
      }

      return {
        ok: false,
        code: ERROR_CODES.CONFLICT,
        message: `이 계약은 다음 데이터와 연결되어 있어 삭제할 수 없습니다: ${warnings.join(
          ', '
        )}. 먼저 관련 데이터를 정리해주세요.`,
      };
    }

    // 6) 계약 삭제 및 유닛 상태 복원
    await database.$transaction(async (tx) => {
      // 계약 삭제
      await tx.lease.delete({
        where: { id: BigInt(id) },
      });

      // 유닛 상태를 VACANT로 변경
      await tx.unit.update({
        where: { id: existingLease.unitId },
        data: { status: 'VACANT' },
      });
    });

    // 7) 변경 이력 기록
    const { Unit, ...leaseData } = existingLease;
    await trackDelete(
      'LEASE',
      BigInt(id),
      leaseData as Record<string, unknown>
    );

    revalidatePath(`/admin/buildings/${existingLease.Unit.buildingId}/units`);

    return {
      ok: true,
      data: { id },
    };
  } catch (e) {
    // biome-ignore lint/suspicious/noConsole: Server-side logging
    console.error('[deleteLease] error', e);

    // Prisma 에러 처리
    if (e instanceof Error) {
      if (e.message.includes('Record to delete does not exist')) {
        return {
          ok: false,
          code: ERROR_CODES.NOT_FOUND,
          message: '존재하지 않는 계약입니다.',
        };
      }

      if (e.message.includes('Foreign key constraint failed')) {
        return {
          ok: false,
          code: ERROR_CODES.CONFLICT,
          message: '이 계약은 다른 데이터와 연결되어 있어 삭제할 수 없습니다.',
        };
      }
    }

    return {
      ok: false,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: '임대차 계약 삭제 중 오류가 발생했습니다.',
    };
  }
}
