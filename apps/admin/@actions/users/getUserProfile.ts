'use server';

import { auth } from '@/auth';
import type { Result } from '@repo/common/types';
import { database } from '@repo/database';

export async function getUserProfile(): Promise<
  Result<{
    id: string;
    name: string;
    email: string;
    phoneNumber: string | null;
    profileImageUrl: string | null;
    role: string;
  }>
> {
  // 1) 세션 확인
  const session = await auth();
  if (!session?.user?.id) {
    return {
      ok: false,
      code: 'UNAUTHORIZED',
      message: '로그인이 필요합니다.',
    };
  }

  try {
    // 2) 사용자 프로필 정보 조회
    const user = await database.user.findUnique({
      where: { id: BigInt(session.user.id) },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        profileImageUrl: true,
        userRole: true,
      },
    });

    if (!user) {
      return {
        ok: false,
        code: 'NOT_FOUND',
        message: '사용자 정보를 찾을 수 없습니다.',
      };
    }

    return {
      ok: true,
      data: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profileImageUrl: user.profileImageUrl,
        role: user.userRole,
      },
    };
  } catch (e) {
    console.error('[getUserProfile] error', e);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '프로필 정보 조회 중 오류가 발생했습니다.',
    };
  }
}
