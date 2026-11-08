export interface JsonResponseOptions {
  readonly status?: number;
  readonly requestId: string;
  readonly headers?: HeadersInit;
}

export function jsonResponse(
  body: Readonly<Record<string, unknown>>,
  options: JsonResponseOptions,
): Response {
  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "no-referrer");
  headers.set("X-Request-ID", options.requestId);

  return new Response(JSON.stringify(body), {
    status: options.status ?? 200,
    headers,
  });
}
