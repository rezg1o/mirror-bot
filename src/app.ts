import { isRuntimeReady, type Env } from "./config/env";
import { jsonResponse } from "./shared/http/json-response";

const SERVICE_NAME = "mirror-bot";
const SERVICE_VERSION = "0.1.0";

function methodNotAllowed(requestId: string, allowedMethod: string): Response {
  return jsonResponse(
    {
      error: {
        code: "METHOD_NOT_ALLOWED",
        message: "The HTTP method is not supported for this endpoint.",
      },
    },
    {
      status: 405,
      requestId,
      headers: { Allow: allowedMethod },
    },
  );
}

function notFound(requestId: string): Response {
  return jsonResponse(
    {
      error: {
        code: "ROUTE_NOT_FOUND",
        message: "The requested endpoint does not exist.",
      },
    },
    { status: 404, requestId },
  );
}

export async function handleRequest(request: Request, environment: Env): Promise<Response> {
  const requestId = crypto.randomUUID();

  try {
    const { pathname } = new URL(request.url);

    if (pathname === "/health/live") {
      if (request.method !== "GET") {
        return methodNotAllowed(requestId, "GET");
      }

      return jsonResponse(
        {
          service: SERVICE_NAME,
          version: SERVICE_VERSION,
          status: "alive",
        },
        { status: 200, requestId },
      );
    }

    if (pathname === "/health/ready") {
      if (request.method !== "GET") {
        return methodNotAllowed(requestId, "GET");
      }

      const ready = isRuntimeReady(environment);

      return jsonResponse(
        {
          service: SERVICE_NAME,
          status: ready ? "ready" : "not_ready",
        },
        { status: ready ? 200 : 503, requestId },
      );
    }

    if (pathname === "/telegram/webhook") {
      if (request.method !== "POST") {
        return methodNotAllowed(requestId, "POST");
      }

      return jsonResponse(
        {
          error: {
            code: "WEBHOOK_NOT_IMPLEMENTED",
            message: "Telegram update handling is not enabled in this build.",
          },
        },
        { status: 501, requestId },
      );
    }

    return notFound(requestId);
  } catch (error: unknown) {
    const errorName = error instanceof Error ? error.name : "UnknownError";

    console.error(
      JSON.stringify({
        level: "error",
        event: "request_failed",
        requestId,
        errorName,
      }),
    );

    return jsonResponse(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred.",
        },
      },
      { status: 500, requestId },
    );
  }
}
