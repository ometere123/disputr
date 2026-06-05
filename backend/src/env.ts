import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8080),
  DATABASE_URL: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  PINATA_JWT: z.string().optional(),
  PINATA_GATEWAY: z.string().optional(),
  NEXT_PUBLIC_GENLAYER_CHAIN_ID: z.coerce.number().int().default(61999),
  NEXT_PUBLIC_GENLAYER_RPC_URL: z.string().url().default("https://studio.genlayer.com/api"),
  NEXT_PUBLIC_DISPUTR_CONTRACT_ADDRESS: z.string().optional(),
  NEXT_PUBLIC_DISPUTR_NFT_CONTRACT_ADDRESS: z.string().optional(),
  NEXT_PUBLIC_APPEAL_ORACLE_CONTRACT_ADDRESS: z.string().optional(),
  FRONTEND_ORIGIN: z.string().url().optional()
});

export type RuntimeEnv = z.infer<typeof envSchema>;

function processEnv() {
  try {
    return process.env;
  } catch {
    return {};
  }
}

export function getRuntimeEnv(bindings?: Record<string, unknown>): RuntimeEnv {
  return envSchema.parse({
    ...processEnv(),
    ...bindings
  });
}

export const env = getRuntimeEnv();
