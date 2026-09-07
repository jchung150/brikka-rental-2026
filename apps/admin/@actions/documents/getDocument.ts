'use server';

import { auth } from '@/auth';
import type { Result } from '@repo/common/types';
import { database } from '@repo/database';

interface DocumentDetail {
  id: number;
  buildingId: number;
  fileId: number;
  category: string;
  type: string;
  title?: string;
  unitId?: number;
  memo?: string;
  fileName: string;
  fileUrl: string;
  uploaderName: string;
  createdAt: string;
}

export async function getDocument(id: number): Promise<Result<DocumentDetail>> {
  try {
    // 1) 권한 검사
    const session = await auth();
    if (!session?.user) {
      return {
        ok: false,
        code: 'UNAUTHORIZED',
        message: '로그인이 필요합니다.',
      };
    }

    // 2) 문서 상세 조회
    const document = await database.attachment.findUnique({
      where: { id: BigInt(id) },
      include: {
        File: {
          select: {
            fileUrl: true,
            fileName: true,
            createdAt: true,
          },
        },
        Uploader: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!document) {
      return {
        ok: false,
        code: 'NOT_FOUND',
        message: '해당 문서를 찾을 수 없습니다.',
      };
    }

    // 3) 데이터 변환
    const documentDetail: DocumentDetail = {
      id: Number(document.id),
      buildingId: Number(document.buildingId),
      fileId: Number(document.fileId),
      category: document.category,
      type: document.type,
      title: document.title || undefined,
      unitId: document.unitId ? Number(document.unitId) : undefined,
      memo: document.memo || undefined,
      fileName: document.File.fileName,
      fileUrl: document.File.fileUrl,
      uploaderName: document.Uploader.name,
      createdAt: document.File.createdAt.toISOString(),
    };

    return {
      ok: true,
      data: documentDetail,
    };
  } catch (error) {
    console.error('[getDocument] error:', error);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '문서 조회 중 오류가 발생했습니다.',
    };
  }
}
