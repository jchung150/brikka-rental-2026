'use server';

import { auth } from '@/auth';
import type { Result } from '@repo/common/types';
import { database } from '@repo/database';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const updateUserProfileSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요'),
  email: z.string().email('올바른 이메일을 입력해주세요'),
  phoneNumber: z.string().optional(),
});

type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;

export async function updateUserProfile(input: UpdateUserProfileInput): Promise<
  Result<{
    id: string;
    updatedAt: string;
    updatedUser: { name: string; email: string; phoneNumber: string | null };
  }>
> {
  // 1) 입력 검증
  const parsed = updateUserProfileSchema.safeParse(input);
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

  const { name, email, phoneNumber } = parsed.data;

  try {
    // 3) 이메일 중복 확인 (다른 사용자가 사용 중인지)
    const existingUser = await database.user.findFirst({
      where: {
        email,
        id: { not: BigInt(session.user.id) },
      },
      select: { id: true },
    });

    if (existingUser) {
      return {
        ok: false,
        code: 'CONFLICT',
        message: '이미 사용 중인 이메일입니다.',
      };
    }

    // 5) 사용자 정보 업데이트
    const updatedUser = await database.user.update({
      where: { id: BigInt(session.user.id) },
      data: {
        name,
        email,
        phoneNumber: phoneNumber || null,
        updatedAt: new Date(),
      },
      select: { id: true, updatedAt: true },
    });

    // 6) 캐시 무효화
    revalidatePath('/profile');

    return {
      ok: true,
      data: {
        id: updatedUser.id.toString(),
        updatedAt: updatedUser.updatedAt.toISOString(),
        updatedUser: {
          name,
          email,
          phoneNumber: phoneNumber || null,
        },
      },
    };
  } catch (e) {
    console.error('[updateUserProfile] error', e);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '프로필 수정 중 오류가 발생했습니다.',
    };
  }
}
