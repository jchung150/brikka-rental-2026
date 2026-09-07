'use server';

import type { Result } from '@repo/common/types';
import { database } from '@repo/database';
import { z } from 'zod';

const updateContactConfigSchema = z.object({
  start: z
    .string()
    .regex(
      /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
      '올바른 시간 형식이 아닙니다 (HH:mm)'
    ),
  end: z
    .string()
    .regex(
      /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
      '올바른 시간 형식이 아닙니다 (HH:mm)'
    ),
});

export async function updateContactConfig(
  prevState: Result<{ id: bigint; start: string; end: string }> | null,
  formData: FormData
): Promise<Result<{ id: bigint; start: string; end: string }>> {
  const input = {
    start: formData.get('start') as string,
    end: formData.get('end') as string,
  };
  const parsed = updateContactConfigSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      code: 'VALIDATION_ERROR',
      message: '입력 데이터가 올바르지 않습니다.',
    };
  }

  try {
    const config = await database.contactConfig.upsert({
      where: { id: 1n },
      update: {
        start: parsed.data.start,
        end: parsed.data.end,
      },
      create: {
        id: 1n,
        start: parsed.data.start,
        end: parsed.data.end,
      },
      select: { id: true, start: true, end: true },
    });

    return { ok: true, data: config };
  } catch (e) {
    console.error('[updateContactConfig] error', e);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '설정 업데이트 중 오류가 발생했습니다.',
    };
  }
}
