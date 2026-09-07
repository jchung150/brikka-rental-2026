import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  extends: [],
  server: {
    DATABASE_URL: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_ADMIN_TENANT_LOGIN_URL: z.string().min(1),
    NEXT_PUBLIC_KAKAO_APP_JAVASCRIPT_KEY: z.string().min(1),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_ADMIN_TENANT_LOGIN_URL:
      process.env.NEXT_PUBLIC_ADMIN_TENANT_LOGIN_URL,
    NEXT_PUBLIC_KAKAO_APP_JAVASCRIPT_KEY:
      process.env.NEXT_PUBLIC_KAKAO_APP_JAVASCRIPT_KEY,
  },
});
