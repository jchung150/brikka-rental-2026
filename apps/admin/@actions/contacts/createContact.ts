'use server';

import type { Result } from '@repo/common/types';
import { database } from '@repo/database';
import { z } from 'zod';

const createContactSchema = z.object({
  name: z
    .string()
    .min(1, '성함은 필수입니다')
    .max(100, '성함은 100자를 초과할 수 없습니다'),
  email: z
    .string()
    .email('올바른 이메일 형식이 아닙니다')
    .optional()
    .or(z.literal('')),
  phoneNumber: z.string().optional().or(z.literal('')),
  howDidYouFind: z
    .string()
    .max(255, '알게된 경로는 255자를 초과할 수 없습니다')
    .optional()
    .or(z.literal('')),
  memo: z.string().optional().or(z.literal('')),
  reservationTime: z.string().datetime('올바른 날짜 형식이 아닙니다'),
});

export async function createContact(input: {
  name: string;
  email?: string | null;
  phoneNumber?: string | null;
  howDidYouFind?: string | null;
  memo?: string | null;
  reservationTime: string;
}): Promise<Result<{ id: bigint }>> {
  const parsed = createContactSchema.safeParse({
    ...input,
    email: input.email || '',
    phoneNumber: input.phoneNumber || '',
    howDidYouFind: input.howDidYouFind || '',
    memo: input.memo || '',
  });

  if (!parsed.success) {
    return {
      ok: false,
      code: 'VALIDATION_ERROR',
      message:
        parsed.error.errors[0]?.message || '입력 데이터가 올바르지 않습니다.',
    };
  }

  try {
    const contact = await database.contact.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email || null,
        phoneNumber: parsed.data.phoneNumber || null,
        howDidYouFind: parsed.data.howDidYouFind || null,
        memo: parsed.data.memo || null,
        reservationTime: new Date(parsed.data.reservationTime),
      },
      select: { id: true },
    });

    return { ok: true, data: { id: contact.id } };
  } catch (e) {
    console.error('[createContact] error', e);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '예약 등록 중 오류가 발생했습니다.',
    };
  }
}
