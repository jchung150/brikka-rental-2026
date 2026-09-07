'use server';

import { signIn as nextAuthSignIn } from '@/auth';
import type { Result } from '@repo/common/types';
import { database } from '@repo/database';
import { z } from 'zod';
import { verifyPassword } from '../lib/enc';

const signInInputSchema = z.object({
  email: z.string().min(1, '이메일을 입력해주세요.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
});
type SignInInput = z.infer<typeof signInInputSchema>;
export async function signIn(
  input: SignInInput
): Promise<Result<{ redirectTo: string }>> {
  // 1) 입력 검증
  const parsed = signInInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      code: 'VALIDATION_ERROR',
      message: '입력 정보를 확인해주세요.',
    };
  }
  const { email, password } = parsed.data;

  try {
    // 2) 사용자 조회
    const user = await database.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        userRole: true,
        profileImageUrl: true,
      },
    });

    if (!user) {
      return {
        ok: false,
        code: 'INVALID_CREDENTIALS',
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
      };
    }

    // 3) 비밀번호 검증
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return {
        ok: false,
        code: 'INVALID_CREDENTIALS',
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
      };
    }

    // 4) NextAuth 로그인 처리
    const result = await nextAuthSignIn('credentials', {
      email: user.email,
      password,
      userId: user.id,
      userName: user.name,
      userRole: user.userRole,
      userProfile: user.profileImageUrl,
      redirect: false,
    });

    if (result?.error) {
      return {
        ok: false,
        code: 'AUTH_ERROR',
        message: '로그인 처리 중 오류가 발생했습니다.',
      };
    }

    // 6) 성공 시 리다이렉트 경로 결정
    const redirectTo = user.userRole === 'ADMIN' ? '/dashboard' : '/homepage';

    return {
      ok: true,
      data: { redirectTo },
    };
  } catch (e) {
    console.error('[signIn] error', e);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '로그인 처리 중 오류가 발생했습니다.',
    };
  }
}
