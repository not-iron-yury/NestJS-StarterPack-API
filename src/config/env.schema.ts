import { z } from 'zod';

export const envSchema = z.object({
  // Database
  DATABASE_TYPE: z.literal('postgresql'),

  DATABASE_HOST: z.string().min(1),
  DATABASE_PORT: z.coerce.number(),

  DATABASE_USER: z.string().min(1),
  DATABASE_PASSWORD: z.string().min(1),
  DATABASE_NAME: z.string().min(1),

  // URLs
  APP_URL: z.url(),
  FRONTEND_URL: z.url(),

  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']),

  APP_NAME: z.string().min(1),
  APP_DESCRIPTION: z.string().min(1),

  PORT: z.coerce.number().positive(),
  API_PREFIX: z.string().min(1),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_ACCESS_EXPIRES_MINUTES: z.coerce.number().positive(),

  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_REFRESH_EXPIRES_DAYS: z.coerce.number().positive(),

  // Cookie
  REFRESH_COOKIE_NAME: z.string().min(1),

  // Security
  LOGIN_MAX_ATTEMPTS: z.coerce.number().positive(),
  LOGIN_ATTEMPT_WINDOW_MINUTES: z.coerce.number().positive(),
  LOCK_TIME_MINUTES: z.coerce.number().positive(),

  THROTTLE_LIMIT: z.coerce.number().positive(),
  THROTTLE_TTL_SECONDS: z.coerce.number().positive(),

  EMAIL_VERIFICATION_TTL_HOURS: z.coerce.number().positive(),
  PASSWORD_RESET_TTL_HOURS: z.coerce.number().positive(),

  // Mail
  MAIL_FROM: z.email(),
  MAIL_FROM_NAME: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;
