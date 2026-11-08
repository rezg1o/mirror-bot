import { createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import type { Env } from "../../src/config/env";
import worker from "../../src/index";

const testEnvironment: Env = {
  APP_ENV: "test",
  PUBLIC_BOT_USERNAME: "MirrorDiscoverBot",
};

async function callWorker(path: string, method = "GET"): Promise<Response> {
  const request = new Request(new URL(path, "https://mirror.test"), { method });
  const context = createExecutionContext();
  const response = await worker.fetch(request, testEnvironment, context);

  await waitOnExecutionContext(context);

  return response;
}

describe("Worker HTTP foundation", () => {
  it("exposes a liveness endpoint without requiring secrets", async () => {
    const response = await callWorker("/health/live");
    const body = (await response.json()) as { status: string; service: string };

    expect(response.status).toBe(200);
    expect(body).toEqual({
      service: "mirror-bot",
      version: "0.1.0",
      status: "alive",
    });
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-request-id")).toBeTruthy();
  });

  it("does not report ready when required provider configuration is missing", async () => {
    const response = await callWorker("/health/ready");
    const body = (await response.json()) as { status: string };

    expect(response.status).toBe(503);
    expect(body.status).toBe("not_ready");
    expect(JSON.stringify(body)).not.toContain("TELEGRAM_BOT_TOKEN");
  });

  it("does not pretend the Telegram webhook is implemented", async () => {
    const response = await callWorker("/telegram/webhook", "POST");
    const body = (await response.json()) as { error: { code: string } };

    expect(response.status).toBe(501);
    expect(body.error.code).toBe("WEBHOOK_NOT_IMPLEMENTED");
  });

  it("returns a consistent 404 response for unknown routes", async () => {
    const response = await callWorker("/unknown");
    const body = (await response.json()) as { error: { code: string } };

    expect(response.status).toBe(404);
    expect(body.error.code).toBe("ROUTE_NOT_FOUND");
  });

  it("rejects unsupported methods and advertises the allowed method", async () => {
    const response = await callWorker("/health/live", "POST");

    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("GET");
  });
});
