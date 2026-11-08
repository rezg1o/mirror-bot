import { z } from "zod";

export interface Env {
  readonly APP_ENV?: string;
  readonly PUBLIC_BOT_USERNAME?: string;
  readonly TELEGRAM_BOT_TOKEN?: string;
  readonly TELEGRAM_WEBHOOK_SECRET?: string;
  readonly SUPABASE_URL?: string;
  readonly SUPABASE_SECRET_KEY?: string;
}

const supabaseUrlSchema = z
  .url()
  .refine((value) => {
    const url = new URL(value);
    return (
      url.protocol === "https:" ||
      (url.protocol === "http:" &&
        (url.hostname === "localhost" || url.hostname === "127.0.0.1"))
    );
  }, "SUPABASE_URL must use HTTPS, except for localhost development.");

const runtimeEnvironmentSchema = z.object({
  APP_ENV: z.enum(["development", "test", "production"]).default("development"),
  PUBLIC_BOT_USERNAME: z
    .string()
    .regex(/^[A-Za-z0-9_]{5,32}$/)
    .default("MirrorDiscoverBot"),
  TELEGRAM_BOT_TOKEN: z.string().min(1).optional(),
  TELEGRAM_WEBHOOK_SECRET: z
    .string()
    .min(1)
    .max(256)
    .regex(/^[A-Za-z0-9_-]+$/)
    .optional(),
  SUPABASE_URL: supabaseUrlSchema.optional(),
  SUPABASE_SECRET_KEY: z.string().min(1).optional(),
});

export type RuntimeEnvironment = z.infer<typeof runtimeEnvironmentSchema>;

const REQUIRED_RUNTIME_VALUES = [
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_WEBHOOK_SECRET",
  "SUPABASE_URL",
  "SUPABASE_SECRET_KEY",
] as const;

/**
 * Checks configuration without returning or logging secret values.
 * The readiness endpoint intentionally exposes only a boolean state.
 */
export function isRuntimeReady(environment: Env): boolean {
  const parsed = runtimeEnvironmentSchema.safeParse(environment);

  if (!parsed.success) {
    return false;
  }

  return REQUIRED_RUNTIME_VALUES.every((key) => {
    const value = parsed.data[key];
    return typeof value === "string" && value.length > 0;
  });
}
