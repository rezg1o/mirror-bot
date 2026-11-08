import { describe, expect, it } from "vitest";
import { type Env, isRuntimeReady } from "../../src/config/env";

const completeEnvironment: Env = {
  APP_ENV: "test",
  PUBLIC_BOT_USERNAME: "MirrorDiscoverBot",
  TELEGRAM_BOT_TOKEN: "test-token-value-that-is-not-a-real-credential",
  TELEGRAM_WEBHOOK_SECRET: "test_webhook_secret_123456789",
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SECRET_KEY: "sb_secret_test_value_that_is_not_real",
};

describe("runtime configuration validation", () => {
  it("accepts a complete test configuration", () => {
    expect(isRuntimeReady(completeEnvironment)).toBe(true);
  });

  it("rejects a configuration with a missing provider secret", () => {
    const incompleteEnvironment: Env = {
      APP_ENV: "test",
      PUBLIC_BOT_USERNAME: "MirrorDiscoverBot",
      TELEGRAM_WEBHOOK_SECRET: "test_webhook_secret_123456789",
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_SECRET_KEY: "sb_secret_test_value_that_is_not_real",
    };

    expect(isRuntimeReady(incompleteEnvironment)).toBe(false);
  });

  it("rejects an invalid Supabase URL without throwing", () => {
    const invalidEnvironment: Env = {
      ...completeEnvironment,
      SUPABASE_URL: "not-a-url",
    };

    expect(isRuntimeReady(invalidEnvironment)).toBe(false);
  });

  it("rejects insecure non-local Supabase URLs", () => {
    const invalidEnvironment: Env = {
      ...completeEnvironment,
      SUPABASE_URL: "http://example.supabase.co",
    };

    expect(isRuntimeReady(invalidEnvironment)).toBe(false);
  });

  it("rejects an invalid Telegram webhook secret", () => {
    const invalidEnvironment: Env = {
      ...completeEnvironment,
      TELEGRAM_WEBHOOK_SECRET: "contains spaces and punctuation!",
    };

    expect(isRuntimeReady(invalidEnvironment)).toBe(false);
  });

  it("rejects an invalid bot username", () => {
    const invalidEnvironment: Env = {
      ...completeEnvironment,
      PUBLIC_BOT_USERNAME: "@invalid",
    };

    expect(isRuntimeReady(invalidEnvironment)).toBe(false);
  });
});
