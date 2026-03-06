export interface TelemetryConfig {
  /** Enable/disable telemetry */
  enabled: boolean;
  /** Service name for tracing */
  serviceName: string;
  /** OTLP endpoint URL */
  endpoint?: string;
  /** Sample rate (0-1) */
  sampleRate?: number;
  /** Environment (development, production, etc.) */
  environment?: string;
}

export interface AnalyticsEvent {
  /** Event name */
  name: string;
  /** Event properties */
  properties?: Record<string, unknown>;
  /** Timestamp */
  timestamp?: Date;
  /** User ID (if available) */
  userId?: string;
  /** Session ID */
  sessionId?: string;
}

export interface PerformanceMetric {
  /** Metric name */
  name: string;
  /** Metric value */
  value: number;
  /** Unit (ms, bytes, etc.) */
  unit: string;
  /** Timestamp */
  timestamp?: Date;
  /** Additional tags */
  tags?: Record<string, string>;
}

export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
}
