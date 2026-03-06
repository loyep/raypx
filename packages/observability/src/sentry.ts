import * as Sentry from "@sentry/node";

import type { SentryConfig } from "./types";

/**
 * Initialize Sentry for server-side error tracking
 */
export function initSentry(config: SentryConfig): void {
  if (!config.dsn) {
    console.warn("Sentry DSN not provided, error tracking disabled");
    return;
  }

  Sentry.init({
    dsn: config.dsn,
    environment: config.environment ?? process.env.NODE_ENV ?? "development",
    release: config.release,
    tracesSampleRate: config.tracesSampleRate ?? 0.1,
    profilesSampleRate: config.profilesSampleRate ?? 0.1,
    debug: config.debug ?? false,
    initialScope: {
      tags: config.tags ?? {},
    },
    integrations: [
      Sentry.httpIntegration(),
      Sentry.expressIntegration(),
      Sentry.prismaIntegration(),
      Sentry.nodeContextIntegration(),
    ],
  });
}

/**
 * Capture an exception with optional context
 */
export function captureException(
  error: Error,
  context?: {
    user?: { id: string; email?: string };
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  },
): string {
  return Sentry.captureException(error, {
    user: context?.user,
    tags: context?.tags,
    extra: context?.extra,
  });
}

/**
 * Capture a message with optional level
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = "info",
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  },
): string {
  return Sentry.captureMessage(message, {
    level,
    tags: context?.tags,
    extra: context?.extra,
  });
}

/**
 * Set user context for Sentry
 */
export function setUser(user: { id: string; email?: string; username?: string } | null): void {
  Sentry.setUser(user);
}

/**
 * Add a breadcrumb for tracing
 */
export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void {
  Sentry.addBreadcrumb(breadcrumb);
}

/**
 * Start a span for performance monitoring
 */
export function startSpan<T>(context: { name: string; op?: string }, callback: () => T): T {
  return Sentry.startSpan(context, callback);
}

/**
 * Create a Sentry client from environment
 */
export function createSentryFromEnv(): void {
  const dsn = process.env.SENTRY_DSN;
  const environment = process.env.NODE_ENV ?? "development";
  const release = process.env.SENTRY_RELEASE;
  const tracesSampleRate = process.env.SENTRY_TRACES_SAMPLE_RATE
    ? Number.parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE)
    : 0.1;

  initSentry({
    dsn,
    environment,
    release,
    tracesSampleRate,
    debug: environment === "development",
    tags: {
      service: process.env.SERVICE_NAME ?? "raypx",
    },
  });
}
