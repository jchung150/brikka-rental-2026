'use server';

import type { Result } from '@repo/common/types';
import { database } from '@repo/database';

export async function getContactConfig(): Promise<
  Result<{ id: bigint; start: string; end: string } | null>
> {
  try {
    const config = await database.contactConfig.findUnique({
      where: { id: 1n },
      select: { id: true, start: true, end: true },
    });

    return { ok: true, data: config };
  } catch (e) {
    console.error('[getContactConfig] error', e);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '설정 조회 중 오류가 발생했습니다.',
    };
  }
}
