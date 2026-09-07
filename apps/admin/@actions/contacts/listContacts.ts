'use server';

import type { Result } from '@repo/common/types';
import { database } from '@repo/database';
import type { Prisma } from '@repo/database';

type ContactListInput = {
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  startDate?: string;
  endDate?: string;
};

export async function listContacts(input: ContactListInput = {}): Promise<
  Result<{
    contacts: Array<{
      id: bigint;
      name: string;
      email: string | null;
      phoneNumber: string | null;
      howDidYouFind: string | null;
      memo: string | null;
      reservationTime: Date;
      status: string;
      adminMemo: string | null;
      dong: string | null;
      type: string | null;
      createdAt: Date;
    }>;
    total: number;
    page: number;
    limit: number;
  }>
> {
  try {
    const page = input.page || 1;
    const limit = input.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ContactWhereInput = {};

    if (input.status) {
      where.status = input.status as any;
    }

    if (input.startDate || input.endDate) {
      where.reservationTime = {};
      if (input.startDate) {
        where.reservationTime.gte = new Date(input.startDate);
      }
      if (input.endDate) {
        where.reservationTime.lte = new Date(input.endDate);
      }
    }

    const [contacts, total] = await Promise.all([
      database.contact.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          howDidYouFind: true,
          memo: true,
          reservationTime: true,
          status: true,
          adminMemo: true,
          dong: true,
          type: true,
          createdAt: true,
        },
        orderBy: { reservationTime: 'desc' },
        skip,
        take: limit,
      }),
      database.contact.count({ where }),
    ]);

    return {
      ok: true,
      data: {
        contacts,
        total,
        page,
        limit,
      },
    };
  } catch (e) {
    console.error('[listContacts] error', e);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '예약 목록 조회 중 오류가 발생했습니다.',
    };
  }
}
