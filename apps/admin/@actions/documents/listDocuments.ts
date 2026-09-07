'use server';
import type { Paged, Result } from '@repo/common/types';
import { Prisma, database } from '@repo/database';

const listDocumentsInclude = Prisma.validator<Prisma.AttachmentInclude>()({
  File: true,
  Uploader: true,
  Building: true,
  Unit: true,
});

export type DocumentListItem = Prisma.AttachmentGetPayload<{
  include: typeof listDocumentsInclude;
}>;

export interface ListDocumentsInput {
  wh: {
    buildingId?: number;
    leaseId?: number;
    unitId?: number;
  };
  page?: number;
  limit?: number;
  category?: string;
  type?: string;
}

export async function listDocuments(
  input: ListDocumentsInput
): Promise<Result<Paged<DocumentListItem>>> {
  try {
    const { wh, page = 1, limit = 200, category, type } = input;
    const skip = (page - 1) * limit;

    const whereConditions: Prisma.AttachmentWhereInput = {};
    if (wh.buildingId) {
      whereConditions.buildingId = BigInt(wh.buildingId);
    }
    if (wh.leaseId) {
      whereConditions.leaseId = BigInt(wh.leaseId);
    }
    if (wh.unitId) {
      whereConditions.unitId = BigInt(wh.unitId);
    }
    if (category && category !== 'all') {
      whereConditions.category = category;
    }
    if (type && type !== 'all') {
      whereConditions.type = type;
    }

    // 문서 목록 조회
    const documents = await database.attachment.findMany({
      where: whereConditions,
      include: listDocumentsInclude,
      orderBy: {
        id: 'desc',
      },
      skip,
      take: limit,
    });

    // 전체 개수 조회
    const total = await database.attachment.count({
      where: whereConditions,
    });

    return {
      ok: true,
      data: {
        items: documents,
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('[listDocuments] error:', error);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '문서 목록을 조회하는 중 오류가 발생했습니다.',
    };
  }
}
