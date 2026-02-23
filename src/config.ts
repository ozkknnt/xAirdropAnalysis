import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const optionalString = z.preprocess(
  (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
  z.string().optional()
);

const optionalUrl = z.preprocess(
  (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
  z.string().url().optional()
);

const envBoolean = (defaultValue: boolean) =>
  z.preprocess((v) => {
    if (typeof v === 'boolean') return v;
    if (typeof v !== 'string') return defaultValue;
    const normalized = v.trim().toLowerCase();
    if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
    if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
    return defaultValue;
  }, z.boolean());

const envSchema = z.object({
  NODE_ENV: z.string().optional(),
  TZ: z.string().default('Asia/Tokyo'),
  USE_DUMMY_DATA: envBoolean(true),
  DRY_RUN: envBoolean(false),

  X_OAUTH2_ACCESS_TOKEN: optionalString,
  X_BEARER_TOKEN: optionalString,
  X_OAUTH2_CLIENT_ID: optionalString,
  X_OAUTH2_CLIENT_SECRET: optionalString,
  X_OAUTH2_REFRESH_TOKEN: optionalString,

  X_LIST_ID_EVM: optionalString,
  X_LIST_ID_SOL: optionalString,
  X_LIST_ID_SECURITY: optionalString,
  X_FETCH_MAX_PAGES: z.coerce.number().int().min(1).max(20).default(3),
  X_FETCH_PAGE_SIZE: z.coerce.number().int().min(5).max(100).default(100),

  DISCORD_WEBHOOK_URL: optionalUrl,
  SCORE_MIN: z.coerce.number().int().min(0).default(8)
});

export const env = envSchema.parse(process.env);

export const listIds = {
  EVM: env.X_LIST_ID_EVM,
  SOL: env.X_LIST_ID_SOL,
  SECURITY: env.X_LIST_ID_SECURITY
} as const;

export function resolveXToken(): { token: string; mode: 'oauth2-user' | 'app-bearer' } | null {
  if (env.X_OAUTH2_ACCESS_TOKEN) {
    return { token: env.X_OAUTH2_ACCESS_TOKEN, mode: 'oauth2-user' };
  }
  if (env.X_BEARER_TOKEN) {
    return { token: env.X_BEARER_TOKEN, mode: 'app-bearer' };
  }
  return null;
}
