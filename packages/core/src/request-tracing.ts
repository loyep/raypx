import type { LoggerContext } from "./logger";

export interface RequestTraceContext {
  requestId: string;
  traceId: string;
}

export interface RequestLike {
  headers: unknown;
  method?: string;
  url: string | URL;
}

function sanitizeHeaderValue(value: string | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function getHeaderValue(headers: unknown, name: string): string | null {
  if (
    typeof headers === "object" &&
    headers !== null &&
    "get" in headers &&
    typeof headers.get === "function"
  ) {
    const value = headers.get(name);
    return typeof value === "string" ? value : null;
  }

  if (typeof headers === "object" && headers !== null && name in headers) {
    const value = (headers as Record<string, unknown>)[name];
    return typeof value === "string" ? value : null;
  }

  return null;
}

function parseTraceparent(header: string | null): string | undefined {
  const value = sanitizeHeaderValue(header);
  if (!value) return undefined;

  const [, traceId] = value.split("-");
  if (!traceId || !/^[0-9a-f]{32}$/i.test(traceId) || /^0+$/.test(traceId)) {
    return undefined;
  }

  return traceId.toLowerCase();
}

export function resolveRequestTrace(request: RequestLike): RequestTraceContext {
  const requestId =
    sanitizeHeaderValue(getHeaderValue(request.headers, "x-request-id")) ?? crypto.randomUUID();

  const traceId =
    parseTraceparent(getHeaderValue(request.headers, "traceparent")) ??
    sanitizeHeaderValue(getHeaderValue(request.headers, "x-trace-id")) ??
    requestId;

  return {
    requestId,
    traceId,
  };
}

export function getRequestTraceLogContext(
  request: RequestLike,
  trace: RequestTraceContext,
): LoggerContext {
  return {
    method: request.method,
    path: new URL(request.url).pathname,
    requestId: trace.requestId,
    traceId: trace.traceId,
  };
}

export function withTraceHeaders(response: Response, trace: RequestTraceContext): Response {
  const headers = new Headers(response.headers);
  headers.set("x-request-id", trace.requestId);
  headers.set("x-trace-id", trace.traceId);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
