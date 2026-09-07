import { z } from 'zod';

export const billingScheduleFormSchema = z.object({
  itemName: z.string().min(1, '청구항목을 입력해주세요'),
  recurrencePeriod: z.string().optional(),
  recurrenceType: z.string().optional(),
  amount: z
    .number({ required_error: '청구액을 입력해주세요' })
    .min(0, '청구액은 0 이상이어야 합니다'),
  dueDate: z.string().min(1, '청구일을 선택해주세요'),
  notificationDays: z.number().min(1).max(30).default(5),
  isTaxable: z.boolean().default(false),
  memo: z.string().optional(),
});

export type BillingScheduleFormData = z.infer<typeof billingScheduleFormSchema>;
