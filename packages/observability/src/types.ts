/**
 * Log levels
 */
export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

/**
 * Log context with structured metadata
 */
export interface LogContext {
  /**
   * Request/correlation ID
   */
  requestId?: string;

  /**
   * User ID
   */
  userId?: string;

  /**
   * Organization ID
   */
  organizationId?: string;

  /**
   * Service name
   */
  service?: string;

  /**
   * Environment
   */
  environment?: string;

  /**
   * Additional metadata
   */
  [key: string]: unknown;
}

/**
 * Structured log entry
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Sentry configuration
 */
export interface SentryConfig {
  /**
   * Sentry DSN
   */
  dsn?: string;

  /**
   * Environment name
   */
  environment?: string;

  /**
   * Release version
   */
  release?: string;

  /**
   * Sample rate for transactions (0-1)
   */
  tracesSampleRate?: number;

  /**
   * Sample rate for profiles (0-1)
   */
  profilesSampleRate?: number;

  /**
   * Enable debug mode
   */
  debug?: boolean;

  /**
   * Tags to apply to all events
   */
  tags?: Record<string, string>;
}

/**
 * Metrics configuration
 */
export interface MetricsConfig {
  /**
   * Service name for metrics
   */
  serviceName: string;

  /**
   * OTLP endpoint for traces
   */
  otlpEndpoint?: string;

  /**
   * Enable metrics export
   */
  enabled?: boolean;
}

/**
 * Observability configuration
 */
export interface ObservabilityConfig {
  /**
   * Service name
   */
  serviceName: string;

  /**
   * Environment
   */
  environment: string;

  /**
   * Log level
   */
  logLevel?: LogLevel;

  /**
   * Sentry configuration
   */
  sentry?: SentryConfig;

  /**
   * Metrics configuration
   */
  metrics?: MetricsConfig;
}

/**
 * Span context for tracing
 */
export interface SpanContext {
  name: string;
  attributes?: Record<string, string | number | boolean>;
}

/**
 * Observability error types
 */
export type ObservabilityErrorType =
  | "INITIALIZATION_FAILED"
  | "EXPORT_FAILED"
  | "INVALID_CONFIGURATION";

/**
 * Custom observability error class
 */
export class ObservabilityError extends Error {
  constructor(
    public type: ObservabilityErrorType,
    message: string,
  ) {
    super(message);
    this.name = "ObservabilityError";
  }
}
