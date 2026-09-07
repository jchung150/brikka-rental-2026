'use server';

import { auth } from '@/auth';
import type { Result } from '@repo/common/types';
import { type Prisma, database } from '@repo/database';

export async function createDocument(
  input: Omit<Prisma.AttachmentUncheckedCreateInput, 'uploaderId'>
): Promise<Result<{ id: string }>> {
  try {
    const session = await auth();
    console.log('session', session);
    const uploaderId = session?.user?.id;
    if (!uploaderId) {
      return {
        ok: false,
        code: 'UNAUTHORIZED',
        message: '로그인이 필요합니다.',
      };
    }
    // 문서 생성
    const document = await database.attachment.create({
      data: {
        ...input,
        uploaderId: BigInt(uploaderId),
      },
      select: {
        id: true,
      },
    });

    return {
      ok: true,
      data: { id: document.id.toString() },
    };
  } catch (error) {
    console.error('[createDocument] error:', error);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '문서를 생성하는 중 오류가 발생했습니다.',
    };
  }
}
