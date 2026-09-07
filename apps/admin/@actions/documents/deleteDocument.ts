'use server';

import type { Result } from '@repo/common/types';
import { database } from '@repo/database';
import { revalidatePath } from 'next/cache';

export async function deleteDocument(
  id: string
): Promise<Result<{ id: string }>> {
  try {
    // 문서 존재 확인
    const existingDocument = await database.attachment.findUnique({
      where: { id: BigInt(id) },
      select: {
        id: true,
        buildingId: true,
      },
    });

    if (!existingDocument) {
      return {
        ok: false,
        code: 'NOT_FOUND',
        message: '문서를 찾을 수 없습니다.',
      };
    }

    // 문서 삭제
    await database.attachment.delete({
      where: { id: BigInt(id) },
    });

    revalidatePath(`/buildings/${Number(existingDocument.buildingId)}`);

    return {
      ok: true,
      data: { id },
    };
  } catch (error) {
    console.error('[deleteDocument] error:', error);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '문서를 삭제하는 중 오류가 발생했습니다.',
    };
  }
}
