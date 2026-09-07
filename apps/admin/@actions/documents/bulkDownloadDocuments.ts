'use server';

import { resolveFileURL } from '@/@actions/aws';
import type { Result } from '@repo/common/types';
import { database } from '@repo/database';
import { requireRole } from '../lib/auth';

export async function bulkDownloadDocuments(
  fileIds: number[]
): Promise<
  Result<{ urls: Array<{ fileId: number; url: string; fileName: string }> }>
> {
  // 권한 검사
  if (!requireRole('ADMIN')) {
    return {
      ok: false,
      code: 'UNAUTHORIZED',
      message: '권한이 없습니다.',
    };
  }

  if (!fileIds.length) {
    return {
      ok: false,
      code: 'VALIDATION_ERROR',
      message: '다운로드할 파일이 선택되지 않았습니다.',
    };
  }

  try {
    // 파일 정보 조회
    const files = await database.file.findMany({
      where: {
        id: {
          in: fileIds,
        },
      },
      select: {
        id: true,
        fileName: true,
        isPrivate: true,
        fileUrl: true,
      },
    });

    if (files.length === 0) {
      return {
        ok: false,
        code: 'NOT_FOUND',
        message: '선택된 파일을 찾을 수 없습니다.',
      };
    }

    // 각 파일의 URL 해결
    const urlPromises = files.map(async (file) => {
      const urlResult = await resolveFileURL(Number(file.id));
      return {
        fileId: Number(file.id),
        fileName: file.fileName,
        url: urlResult.ok ? urlResult.data.url : '',
        success: urlResult.ok,
      };
    });

    const urlResults = await Promise.all(urlPromises);
    const successfulUrls = urlResults
      .filter((result) => result.success)
      .map(({ fileId, fileName, url }) => ({ fileId, fileName, url }));

    if (successfulUrls.length === 0) {
      return {
        ok: false,
        code: 'INTERNAL_ERROR',
        message: '파일 URL을 가져오는 중 오류가 발생했습니다.',
      };
    }

    return {
      ok: true,
      data: {
        urls: successfulUrls,
      },
    };
  } catch (error) {
    console.error('[bulkDownloadDocuments] error:', error);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '파일 다운로드 중 오류가 발생했습니다.',
    };
  }
}
