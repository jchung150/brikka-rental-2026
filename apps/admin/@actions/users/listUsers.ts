'use server';

import { ERROR_CODES, ERROR_MESSAGES, type Result } from '@repo/common/types';
import { type UserRole, database } from '@repo/database';
import { requireRole } from '../lib/auth';

export type UserListItem = {
  id: string;
  email: string;
  name: string;
  phoneNumber: string | null;
  userRole: string;
  profileImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  accessibleBuildings: {
    id: string;
    name: string;
  }[];
};

export async function listUsersForSelect(
  filter: UserRole[] = []
): Promise<Result<{ id: string; name: string }[]>> {
  if (!requireRole('ADMIN')) {
    return {
      ok: false,
      code: ERROR_CODES.FORBIDDEN,
      message: ERROR_MESSAGES.FORBIDDEN,
    };
  }

  const users = await database.user.findMany({
    select: { id: true, name: true },
    where: {
      userRole: {
        in: filter,
      },
    },
  });

  return {
    ok: true,
    data: users.map((user) => ({ id: user.id.toString(), name: user.name })),
  };
}

export async function listUsers(): Promise<Result<UserListItem[]>> {
  if (!requireRole('ADMIN')) {
    return {
      ok: false,
      code: ERROR_CODES.FORBIDDEN,
      message: ERROR_MESSAGES.FORBIDDEN,
    };
  }

  try {
    const users = await database.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        userRole: true,
        profileImageUrl: true,
        createdAt: true,
        updatedAt: true,
        BuildingOwnerships: {
          select: {
            Building: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return {
      ok: true,
      data: users.map((user) => ({
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        phoneNumber: user.phoneNumber,
        userRole: user.userRole,
        profileImageUrl: user.profileImageUrl,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        accessibleBuildings: user.BuildingOwnerships.map((ownership) => ({
          id: ownership.Building.id.toString(),
          name: ownership.Building.name,
        })),
      })),
    };
  } catch {
    return {
      ok: false,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: '사용자 목록 조회 중 오류가 발생했습니다.',
    };
  }
}
