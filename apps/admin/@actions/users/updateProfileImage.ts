'use server';

import { auth } from '@/auth';
import type { Result } from '@repo/common/types';
import { database } from '@repo/database';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const updateProfileImageSchema = z.object({
  profileImageUrl: z.string().url('올바른 이미지 URL을 입력해주세요'),
});

type UpdateProfileImageInput = z.infer<typeof updateProfileImageSchema>;

export async function updateProfileImage(
  input: UpdateProfileImageInput
): Promise<Result<{ id: string; updatedAt: string }>> {
  // 1) 입력 검증
  const parsed = updateProfileImageSchema.safeParse(input);
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

  const { profileImageUrl } = parsed.data;

  try {
    // 3) 사용자 프로필 이미지 업데이트
    const updatedUser = await database.user.update({
      where: { id: BigInt(session.user.id) },
      data: {
        profileImageUrl,
        updatedAt: new Date(),
      },
      select: { id: true, updatedAt: true },
    });

    // 4) 캐시 무효화
    revalidatePath('/profile');

    return {
      ok: true,
      data: {
        id: updatedUser.id.toString(),
        updatedAt: updatedUser.updatedAt.toISOString(),
      },
    };
  } catch (e) {
    console.error('[updateProfileImage] error', e);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '프로필 이미지 업데이트 중 오류가 발생했습니다.',
    };
  }
}
