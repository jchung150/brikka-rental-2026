'use server';

import type { Result } from '@repo/common/types';
import { database } from '@repo/database';

export async function createContact(input: {
  name: string;
  email?: string | null;
  phoneNumber?: string | null;
  howDidYouFind?: string | null;
  memo?: string | null;
  reservationTime: string;
  dong?: string;
  type?: string;
}): Promise<Result<{ id: bigint }>> {
  try {
    const contact = await database.contact.create({
      data: {
        name: input.name,
        email: input.email || null,
        phoneNumber: input.phoneNumber || null,
        howDidYouFind: input.howDidYouFind || null,
        memo: input.memo || null,
        reservationTime: new Date(input.reservationTime),
        dong: input.dong || null,
        type: input.type || null,
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
