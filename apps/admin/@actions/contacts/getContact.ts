'use server';

import type { Result } from '@repo/common/types';
import { database } from '@repo/database';

export async function getContact(id: bigint): Promise<
  Result<{
    id: bigint;
    name: string;
    email: string | null;
    phoneNumber: string | null;
    howDidYouFind: string | null;
    memo: string | null;
    reservationTime: Date;
    status: string;
    adminMemo: string | null;
    createdAt: Date;
    updatedAt: Date;
  } | null>
> {
  try {
    const contact = await database.contact.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        howDidYouFind: true,
        memo: true,
        reservationTime: true,
        status: true,
        adminMemo: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { ok: true, data: contact };
  } catch (e) {
    console.error('[getContact] error', e);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '예약 조회 중 오류가 발생했습니다.',
    };
  }
}
