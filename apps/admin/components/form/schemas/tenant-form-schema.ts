import { z } from 'zod';

// 기본 tenant 정보 스키마
export const tenantFormSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요'),
  ssn: z.string().optional(),
  phoneNumber: z.string().min(1, '연락처를 입력해주세요'),
  email: z.string().email('올바른 이메일을 입력해주세요'),
  address: z.string().min(1, '주소를 입력해주세요'),
  addressDetail: z.string().optional(),
  zipcode: z.string().optional(),
  accountBank: z.string().optional(),
  accountNumber: z.string().optional(),
});

export type TenantFormData = z.infer<typeof tenantFormSchema>;
