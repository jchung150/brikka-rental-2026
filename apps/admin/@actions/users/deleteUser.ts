'use server';

import { ERROR_CODES, ERROR_MESSAGES, type Result } from '@repo/common/types';
import { database } from '@repo/database';
import { z } from 'zod';
import { requireRole } from '../lib/auth';

const Input = z.object({
  id: z.string().min(1, '사용자 ID는 필수입니다'),
});

type Params = z.infer<typeof Input>;

export async function deleteUser(
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

  const { id } = parsed.data;

  await database.user.delete({
    where: { id: BigInt(id) },
  });

  return {
    ok: true,
    data: { id },
  };
}
