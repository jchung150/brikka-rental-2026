'use server';

import { auth } from '@/auth';
import type { Result } from '@repo/common/types';
import { Prisma, database } from '@repo/database';

const messageInclude = Prisma.validator<Prisma.MessageInclude>()({
  User: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
});

export type RequestMessage = Prisma.MessageGetPayload<{
  include: typeof messageInclude;
}>;

export async function createRequestMessage(input: {
  requestId: number;
  content: string;
  parentId?: number;
}): Promise<Result<{ id: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        ok: false,
        code: 'UNAUTHORIZED',
        message: '로그인이 필요합니다.',
      };
    }

    const { requestId, content, parentId } = input;

    // 요청 존재 확인
    const request = await database.request.findUnique({
      where: { id: BigInt(requestId) },
      select: { id: true },
    });

    if (!request) {
      return {
        ok: false,
        code: 'NOT_FOUND',
        message: '요청을 찾을 수 없습니다.',
      };
    }

    const message = await database.message.create({
      data: {
        title: '요청 응답',
        receiverId: BigInt(session.user.id),
        content,
        method: 'EMAIL',
        messageType: 'REQUEST_RESPONSE',
      },
      select: { id: true },
    });

    return {
      ok: true,
      data: { id: message.id.toString() },
    };
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Server-side logging
    console.error('[createRequestMessage] error:', error);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '메시지를 생성하는 중 오류가 발생했습니다.',
    };
  }
}

export async function updateRequestMessage(
  id: number,
  content: string
): Promise<Result<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        ok: false,
        code: 'UNAUTHORIZED',
        message: '로그인이 필요합니다.',
      };
    }

    // 메시지 존재 확인
    const existingMessage = await database.message.findUnique({
      where: { id: BigInt(id) },
      select: { receiverId: true },
    });

    if (!existingMessage) {
      return {
        ok: false,
        code: 'NOT_FOUND',
        message: '메시지를 찾을 수 없습니다.',
      };
    }

    // 수신자만 수정 가능
    if (existingMessage.receiverId !== BigInt(session.user.id)) {
      return {
        ok: false,
        code: 'FORBIDDEN',
        message: '메시지를 수정할 권한이 없습니다.',
      };
    }

    await database.message.update({
      where: { id: BigInt(id) },
      data: { content },
    });

    return {
      ok: true,
      data: undefined,
    };
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Server-side logging
    console.error('[updateRequestMessage] error:', error);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '메시지를 수정하는 중 오류가 발생했습니다.',
    };
  }
}

export async function deleteRequestMessage(id: number): Promise<Result<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        ok: false,
        code: 'UNAUTHORIZED',
        message: '로그인이 필요합니다.',
      };
    }

    // 메시지 존재 확인
    const existingMessage = await database.message.findUnique({
      where: { id: BigInt(id) },
      select: { receiverId: true },
    });

    if (!existingMessage) {
      return {
        ok: false,
        code: 'NOT_FOUND',
        message: '메시지를 찾을 수 없습니다.',
      };
    }

    // 수신자만 삭제 가능
    if (existingMessage.receiverId !== BigInt(session.user.id)) {
      return {
        ok: false,
        code: 'FORBIDDEN',
        message: '메시지를 삭제할 권한이 없습니다.',
      };
    }

    await database.message.delete({
      where: { id: BigInt(id) },
    });

    return {
      ok: true,
      data: undefined,
    };
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Server-side logging
    console.error('[deleteRequestMessage] error:', error);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '메시지를 삭제하는 중 오류가 발생했습니다.',
    };
  }
}

export async function listRequestMessages(
  _requestId: number
): Promise<Result<RequestMessage[]>> {
  // TODO: Message 스키마에 requestId 필드 추가 후 구현 필요
  return {
    ok: true,
    data: [],
  };
}
