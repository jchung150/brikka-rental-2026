'use server';

import { signOut as nextAuthSignOut } from '@/auth';
import type { Result } from '@repo/common/types';
import { revalidatePath } from 'next/cache';

export async function signOut(): Promise<Result<{ redirectTo: string }>> {
  try {
    // 1) NextAuth 로그아웃 처리
    await nextAuthSignOut({
      redirect: false,
    });

    // 2) 캐시 무효화
    revalidatePath('/', 'layout');

    // 3) 성공 시 로그인 페이지로 리다이렉트
    return {
      ok: true,
      data: { redirectTo: '/login' },
    };
  } catch (e) {
    console.error('[signOut] error', e);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '로그아웃 처리 중 오류가 발생했습니다.',
    };
  }
}
