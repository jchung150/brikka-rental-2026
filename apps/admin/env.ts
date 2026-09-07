import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  extends: [],
  server: {
    AUTH_SECRET: z.string().min(1),
    ENCRYPTION_KEY: z.string().min(1),
    AWS_ACCESS_KEY_ID: z.string().min(1),
    AWS_SECRET_ACCESS_KEY: z.string().min(1),
    AWS_BUCKET_PRIVATE: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_AWS_BUCKET: z.string().min(1),
  },
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    NEXT_PUBLIC_AWS_BUCKET: process.env.NEXT_PUBLIC_AWS_BUCKET,
    AWS_BUCKET_PRIVATE: process.env.AWS_BUCKET_PRIVATE,
  },
});
