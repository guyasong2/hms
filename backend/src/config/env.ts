import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000').transform(Number),
  DATABASE_URL: z.string(),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  // MTN MoMo
  MTN_MOMO_BASE_URL: z.string().url().default('https://sandbox.momodeveloper.mtn.com'),
  MTN_SUBSCRIPTION_KEY: z.string().default(''),
  MTN_API_USER: z.string().default(''),
  MTN_API_KEY: z.string().default(''),
  MTN_TARGET_ENVIRONMENT: z.string().default('sandbox'),
  MTN_CALLBACK_URL: z.string().url().default('http://localhost:5000/api/payments/mtn/callback'),
  // Orange Money
  ORANGE_MONEY_BASE_URL: z.string().url().default('https://api.orange.com'),
  ORANGE_CLIENT_ID: z.string().default(''),
  ORANGE_CLIENT_SECRET: z.string().default(''),
  ORANGE_CALLBACK_URL: z.string().url().default('http://localhost:5000/api/payments/orange/callback'),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
