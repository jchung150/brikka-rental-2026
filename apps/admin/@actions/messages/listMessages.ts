'use server';

import { auth } from '@/auth';
import type { Result } from '@repo/common/types';
import { Prisma, database } from '@repo/database';

interface ListMessagesInput {
  leaseId?: number;
  buildingId?: number;
  billId?: number;
  receiverId?: number;
  method?: string;
  messageType?: string;
  page?: number;
  limit?: number;
}

const messageListItemInclude = Prisma.validator<Prisma.MessageInclude>()({
  User: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  Lease: {
    include: {
      Unit: {
        select: {
          id: true,
          unitNumber: true,
          Building: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      LeaseTenants: {
        include: {
          Tenant: true,
        },
      },
    },
  },
  Building: {
    select: {
      id: true,
      name: true,
    },
  },
  Bill: {
    select: {
      id: true,
      totalAmount: true,
      status: true,
    },
  },
});

export type MessageListItem = Prisma.MessageGetPayload<{
  include: typeof messageListItemInclude;
}>;

export async function listMessages(
  input: ListMessagesInput
): Promise<Result<MessageListItem[]>> {
  try {
    // 권한 검사
    const session = await auth();
    if (!session?.user) {
      return {
        ok: false,
        code: 'UNAUTHORIZED',
        message: '로그인이 필요합니다.',
      };
    }

    const {
      leaseId,
      buildingId,
      billId,
      receiverId,
      method,
      messageType,
      page = 1,
      limit = 20,
    } = input;
    const skip = (page - 1) * limit;

    // where 조건 동적 생성
    const whereConditions: Prisma.MessageWhereInput = {};

    if (leaseId != null) {
      whereConditions.leaseId = BigInt(leaseId);
    }

    if (buildingId != null) {
      whereConditions.buildingId = BigInt(buildingId);
    }

    if (billId != null) {
      whereConditions.billId = BigInt(billId);
    }

    if (receiverId != null) {
      whereConditions.receiverId = BigInt(receiverId);
    }

    if (method != null) {
      whereConditions.method = method as any;
    }

    if (messageType != null) {
      whereConditions.messageType = messageType;
    }

    // 메시지 목록 조회
    const messages = await database.message.findMany({
      where: whereConditions,
      include: messageListItemInclude,
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    return {
      ok: true,
      data: messages,
    };
  } catch (error) {
    console.error('[listMessages] error:', error);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '메시지 목록을 조회하는 중 오류가 발생했습니다.',
    };
  }
}
