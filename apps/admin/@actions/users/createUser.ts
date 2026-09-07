'use server';

import { ERROR_CODES, ERROR_MESSAGES, type Result } from '@repo/common/types';
import { UserPermissionType, UserRole, database } from '@repo/database';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireRole } from '../lib/auth';
import { hashPassword } from '../lib/enc';

const Input = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
  password: z.string().min(1, '비밀번호는 필수입니다'),
  name: z
    .string()
    .min(1, '이름은 필수입니다')
    .max(100, '이름은 100자 이하여야 합니다'),
  phoneNumber: z.string().optional(),
  userRole: z.nativeEnum(UserRole).optional(),
  address: z.string().optional(),
  addressDetail: z.string().optional(),
  accountBank: z.string().optional(),
  accountNumber: z.string().optional(),
  profileImageUrl: z.string().optional(),
  twoFactorSecret: z.string().optional(),
  buildingType: z.string().optional(),
  landlords: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        ownershipPercentage: z.number(),
      })
    )
    .optional(),
  permissions: z.array(z.nativeEnum(UserPermissionType)).optional(),
});

type Params = z.infer<typeof Input>;

export async function createUser(
  input: Params
): Promise<Result<{ id: string }>> {
  if (!requireRole('ADMIN')) {
    return {
      ok: false,
      code: ERROR_CODES.FORBIDDEN,
      message: ERROR_MESSAGES.FORBIDDEN,
    };
  }

  // 1) 입력 검증
  const parsed = Input.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: ERROR_MESSAGES.VALIDATION_ERROR,
    };
  }

  const {
    email,
    password,
    name,
    phoneNumber,
    userRole,
    address,
    addressDetail,
    accountBank,
    accountNumber,
    profileImageUrl,
    twoFactorSecret,
    permissions,
  } = parsed.data;

  const passwordHash = await hashPassword(password);

  try {
    // 2) 이메일 중복 확인
    const existingUser = await database.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return {
        ok: false,
        code: ERROR_CODES.CONFLICT,
        message: '이미 존재하는 이메일입니다.',
      };
    }

    // const existingPhoneNumber = await database.user.findUnique({
    //   where: { phoneNumber },
    //   select: { id: true },
    // });

    // if (existingPhoneNumber) {
    //   return {
    //     ok: false,
    //     code: ERROR_CODES.CONFLICT,
    //     message: '이미 존재하는 전화번호입니다.',
    //   };
    // }

    // 5) 사용자 생성 및 권한 설정
    const result = await database.$transaction(async (tx) => {
      // 사용자 생성
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          name,
          phoneNumber,
          address,
          addressDetail,
          accountBank,
          accountNumber,
          userRole,
          profileImageUrl,
          twoFactorSecret,
        },
        select: { id: true },
      });

      // 권한 설정 (제공된 경우)
      if (permissions && permissions.length > 0) {
        await tx.userPermission.createMany({
          data: permissions.map((permission) => ({
            userId: user.id,
            permission,
          })),
        });
      }

      return user;
    });

    // 6) 캐시 무효화 & 반환
    revalidatePath('/admin/users');
    return { ok: true, data: { id: result.id.toString() } };
  } catch (e) {
    console.error('[createUser] error', e);
    return {
      ok: false,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: '사용자 생성 중 오류가 발생했습니다.',
    };
  }
}
