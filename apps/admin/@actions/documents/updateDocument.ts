'use server';

import { auth } from '@/auth';
import type { Result } from '@repo/common/types';
import { database } from '@repo/database';
import { z } from 'zod';

const updateDocumentSchema = z.object({
  id: z.number(),
  category: z.string().min(1, '구분을 선택해주세요'),
  type: z.string().min(1, '카테고리를 입력해주세요'),
  title: z.string().optional(),
  unitId: z.number().optional(),
  memo: z.string().optional(),
  fileId: z.number().optional(),
});

export async function updateDocument(
  input: z.infer<typeof updateDocumentSchema>
): Promise<Result<{ id: number }>> {
  try {
    // 1) 입력 검증
    const parsed = updateDocumentSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        code: 'VALIDATION_ERROR',
        message: '입력 데이터가 올바르지 않습니다.',
      };
    }

    // 2) 권한 검사
    const session = await auth();
    if (!session?.user) {
      return {
        ok: false,
        code: 'UNAUTHORIZED',
        message: '로그인이 필요합니다.',
      };
    }

    const { id, category, type, title, unitId, memo, fileId } = parsed.data;

    // 3) 문서 존재 여부 확인
    const existingDocument = await database.attachment.findUnique({
      where: { id: BigInt(id) },
      select: { id: true, buildingId: true },
    });

    if (!existingDocument) {
      return {
        ok: false,
        code: 'NOT_FOUND',
        message: '해당 문서를 찾을 수 없습니다.',
      };
    }

    // 4) 문서 업데이트
    const updateData: any = {
      category,
      type,
      title: title || null,
      unitId: unitId ? BigInt(unitId) : null,
      memo: memo || null,
    };

    // 파일이 변경된 경우에만 fileId 업데이트
    if (fileId) {
      updateData.fileId = BigInt(fileId);
    }

    const updatedDocument = await database.attachment.update({
      where: { id: BigInt(id) },
      data: updateData,
      select: { id: true },
    });

    return {
      ok: true,
      data: { id: Number(updatedDocument.id) },
    };
  } catch (error) {
    console.error('[updateDocument] error:', error);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '문서 수정 중 오류가 발생했습니다.',
    };
  }
}
