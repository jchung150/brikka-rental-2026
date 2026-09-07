'use server';

import { ERROR_CODES, ERROR_MESSAGES, type Result } from '@repo/common/types';
import { database } from '@repo/database';
import { z } from 'zod';
import { requireRole } from '../lib/auth';

const Input = z.object({
  name: z.string().min(1, '이름은 필수입니다'),
  ssn: z.string().optional(),
  phoneNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  addressDetail: z.string().optional(),
  accountBank: z.string().optional(),
  accountNumber: z.string().optional(),
  accountHolder: z.string().optional(),
});

type Params = z.infer<typeof Input>;

export async function createContractor(
  input: Params
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

  const {
    name,
    ssn,
    phoneNumber,
    email,
    address,
    addressDetail,
    accountBank,
    accountNumber,
    accountHolder,
  } = parsed.data;

  try {
    // 2) 계약자 생성
    const contractor = await database.leaseContractor.create({
      data: {
        name,
        ssn,
        phoneNumber,
        email: email || null,
        address,
        addressDetail,
        accountBank,
        accountNumber,
        accountHolder,
      },
      select: { id: true },
    });

    return { ok: true, data: { id: contractor.id.toString() } };
  } catch (e) {
    console.error('[createContractor] error', e);
    return {
      ok: false,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: '계약자 생성 중 오류가 발생했습니다.',
    };
  }
}
