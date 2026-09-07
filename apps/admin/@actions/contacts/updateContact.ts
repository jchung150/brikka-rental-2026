'use server';

import type { Result } from '@repo/common/types';
import { database } from '@repo/database';
import { z } from 'zod';

const updateContactSchema = z.object({
  id: z.bigint(),
  name: z
    .string()
    .min(1, '성함은 필수입니다')
    .max(100, '성함은 100자를 초과할 수 없습니다')
    .optional(),
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
  reservationTime: z
    .string()
    .datetime('올바른 날짜 형식이 아닙니다')
    .optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).optional(),
  adminMemo: z.string().optional().or(z.literal('')),
});

export async function updateContact(input: {
  id: bigint;
  name?: string;
  email?: string | null;
  phoneNumber?: string | null;
  howDidYouFind?: string | null;
  memo?: string | null;
  reservationTime?: string;
  status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  adminMemo?: string | null;
}): Promise<Result<{ id: bigint }>> {
  const parsed = updateContactSchema.safeParse({
    ...input,
    email: input.email || '',
    phoneNumber: input.phoneNumber || '',
    howDidYouFind: input.howDidYouFind || '',
    memo: input.memo || '',
    adminMemo: input.adminMemo || '',
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
    const updateData: any = {};

    if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
    if (parsed.data.email !== undefined)
      updateData.email = parsed.data.email || null;
    if (parsed.data.phoneNumber !== undefined)
      updateData.phoneNumber = parsed.data.phoneNumber || null;
    if (parsed.data.howDidYouFind !== undefined)
      updateData.howDidYouFind = parsed.data.howDidYouFind || null;
    if (parsed.data.memo !== undefined)
      updateData.memo = parsed.data.memo || null;
    if (parsed.data.reservationTime !== undefined)
      updateData.reservationTime = new Date(parsed.data.reservationTime);
    if (parsed.data.status !== undefined)
      updateData.status = parsed.data.status;
    if (parsed.data.adminMemo !== undefined)
      updateData.adminMemo = parsed.data.adminMemo || null;

    const contact = await database.contact.update({
      where: { id: parsed.data.id },
      data: updateData,
      select: { id: true },
    });

    return { ok: true, data: { id: contact.id } };
  } catch (e) {
    console.error('[updateContact] error', e);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '예약 수정 중 오류가 발생했습니다.',
    };
  }
}
