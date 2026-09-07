'use server';

import type { Result } from '@repo/common/types';
import { database } from '@repo/database';

export async function deleteContact(
  id: bigint
): Promise<Result<{ id: bigint }>> {
  try {
    await database.contact.delete({
      where: { id },
    });

    return { ok: true, data: { id } };
  } catch (e) {
    console.error('[deleteContact] error', e);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '예약 삭제 중 오류가 발생했습니다.',
    };
  }
}
