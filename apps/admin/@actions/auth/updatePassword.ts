'use server';

import { auth } from '@/auth';
import { database } from '@repo/database';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { hashPassword, verifyPassword } from '../lib/enc';

const Input = z
  .object({
    currentPassword: z.string().min(1, '현재 비밀번호를 입력해주세요.'),
    newPassword: z
      .string()
      .min(8, '새 비밀번호는 최소 8자 이상이어야 합니다.')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        '새 비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다.'
      ),
    confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  });

type Ok<T> = { ok: true; data: T };
type Err = { ok: false; code: string; message: string };
type Result<T> = Ok<T> | Err;

export async function updatePassword(
  input: unknown
): Promise<Result<{ success: boolean }>> {
  // 1) 입력 검증
  const parsed = Input.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0];
    return {
      ok: false,
      code: 'VALIDATION_ERROR',
      message: firstError?.message || '입력 정보를 확인해주세요.',
    };
  }

  // 2) 세션 확인
  const session = await auth();
  if (!session?.user?.id) {
    return {
      ok: false,
      code: 'UNAUTHORIZED',
      message: '로그인이 필요합니다.',
    };
  }

  const { currentPassword, newPassword } = parsed.data;

  try {
    // 3) 현재 사용자 정보 조회
    const user = await database.user.findUnique({
      where: { id: BigInt(session.user.id) },
      select: {
        id: true,
        passwordHash: true,
        email: true,
      },
    });

    if (!user) {
      return {
        ok: false,
        code: 'USER_NOT_FOUND',
        message: '사용자 정보를 찾을 수 없습니다.',
      };
    }

    // 4) 현재 비밀번호 검증
    const isValidCurrentPassword = await verifyPassword(
      currentPassword,
      user.passwordHash
    );
    if (!isValidCurrentPassword) {
      return {
        ok: false,
        code: 'INVALID_CURRENT_PASSWORD',
        message: '현재 비밀번호가 올바르지 않습니다.',
      };
    }

    // 5) 새 비밀번호 해시화
    const newPasswordHash = await hashPassword(newPassword);

    // 6) 비밀번호 업데이트
    await database.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      },
    });

    // 7) 캐시 무효화
    revalidatePath('/profile');

    return {
      ok: true,
      data: { success: true },
    };
  } catch (e) {
    console.error('[updatePassword] error', e);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '비밀번호 변경 중 오류가 발생했습니다.',
    };
  }
}
