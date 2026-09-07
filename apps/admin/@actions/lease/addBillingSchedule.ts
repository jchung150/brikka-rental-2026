'use server';

import type { Result } from '@repo/common/types';
import {
  type RecurrencePeriod,
  type RecurrenceType,
  database,
} from '@repo/database';

type AddBillingScheduleInput = {
  leaseId: string;
  itemName: string;
  amount: number;
  dueDate: string;
  recurrenceType: RecurrenceType;
  recurrencePeriod?: RecurrencePeriod;
  recurrenceEndDate?: string;
  isTaxable: boolean;
  memo?: string;
  notificationDays: number;
};

export async function addBillingSchedule(
  input: AddBillingScheduleInput
): Promise<Result<void>> {
  const {
    leaseId,
    itemName,
    amount,
    dueDate,
    recurrenceType,
    recurrencePeriod,
    recurrenceEndDate,
    isTaxable,
    memo,
    notificationDays,
  } = input;

  await database.leaseBillingSchedule.create({
    data: {
      leaseId: BigInt(leaseId),
      itemName,
      amount,
      dueDate,
      recurrenceType,
      recurrencePeriod,
      recurrenceEndDate,
      isTaxable,
      memo,
      notificationDays: notificationDays ?? undefined,
    },
  });

  return {
    ok: true,
    data: undefined,
  };
}
