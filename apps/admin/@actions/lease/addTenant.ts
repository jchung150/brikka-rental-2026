'use server';

import { ERROR_CODES, ERROR_MESSAGES, type Result } from '@repo/common/types';
import { database } from '@repo/database';
import { requireRole } from '../lib/auth';
import { hashPassword } from '../lib/enc';

export type AddTenantInput = {
  leaseId: string;
  name: string;
  ssn: string;
  phoneNumber: string;
  email: string;
  zipcode: string;
  address: string;
  addressDetail: string;
  accountBank: string;
  accountNumber: string;
};

export async function addTenant(input: AddTenantInput): Promise<Result<void>> {
  if (!requireRole('ADMIN')) {
    return {
      ok: false,
      code: ERROR_CODES.FORBIDDEN,
      message: ERROR_MESSAGES.FORBIDDEN,
    };
  }

  const {
    leaseId,
    name,
    ssn,
    phoneNumber,
    email,
    address,
    addressDetail,
    accountBank,
    accountNumber,
    zipcode,
  } = input;

  let user = await database.user.findUnique({
    where: {
      email: email,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    user = await database.user.create({
      data: {
        email: email,
        name: name,
        zipcode: zipcode,
        phoneNumber: phoneNumber,
        ssn: ssn,
        passwordHash: await hashPassword(phoneNumber),
        address: address,
        addressDetail: addressDetail,
        accountBank: accountBank,
        accountNumber: accountNumber,
        userRole: 'TENANT',
      },
      select: {
        id: true,
      },
    });
  }

  const currentRepresentative = await database.leaseTenant.findMany({
    where: {
      leaseId: BigInt(leaseId),
      isRepresentative: true,
    },
    select: {
      tenantId: true,
    },
  });

  const isRepresentative = currentRepresentative.length === 0;

  await database.leaseTenant.create({
    data: {
      leaseId: BigInt(leaseId),
      tenantId: user.id,
      isRepresentative: isRepresentative,
    },
  });

  return {
    ok: true,
    data: undefined,
  };
}
