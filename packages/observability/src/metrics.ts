import { type Span, type Tracer, trace } from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { NodeSDK } from "@opentelemetry/sdk-node";

import type { MetricsConfig, SpanContext } from "./types";
import { ObservabilityError } from "./types";

/**
 * Metrics and tracing manager
 */
export class MetricsManager {
  private sdk: NodeSDK | null = null;
  private tracer: Tracer | null = null;
  private config: MetricsConfig;

  constructor(config: MetricsConfig) {
    this.config = config;
  }

  /**
   * Initialize the metrics SDK
   */
  async initialize(): Promise<void> {
    if (!this.config.enabled || !this.config.otlpEndpoint) {
      console.warn("Metrics disabled or OTLP endpoint not configured");
      return;
    }

    const traceExporter = new OTLPTraceExporter({
      url: this.config.otlpEndpoint,
    });

    this.sdk = new NodeSDK({
      serviceName: this.config.serviceName,
      traceExporter,
    });

    try {
      await this.sdk.start();
      this.tracer = trace.getTracer(this.config.serviceName);
    } catch (error) {
      throw new ObservabilityError(
        "INITIALIZATION_FAILED",
        `Failed to initialize metrics SDK: ${error}`,
      );
    }
  }

  /**
   * Shutdown the metrics SDK
   */
  async shutdown(): Promise<void> {
    if (this.sdk) {
      await this.sdk.shutdown();
    }
  }

  /**
   * Start a new span
   */
  startSpan(context: SpanContext): Span | null {
    if (!this.tracer) {
      return null;
    }

    return this.tracer.startSpan(context.name, {
      attributes: context.attributes,
    });
  }

  /**
   * Execute a function within a span
   */
  async withSpan<T>(context: SpanContext, fn: () => Promise<T>): Promise<T> {
    const span = this.startSpan(context);

    if (!span) {
      return fn();
    }

    try {
      const result = await fn();
      span.setStatus({ code: 0 }); // OK
      return result;
    } catch (error) {
      span.setStatus({
        code: 2, // ERROR
        message: error instanceof Error ? error.message : "Unknown error",
      });
      span.recordException(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Record a metric value
   */
  recordMetric(
    name: string,
    value: number,
    attributes?: Record<string, string | number | boolean>,
  ): void {
    const activeSpan = trace.getActiveSpan();
    if (activeSpan) {
      activeSpan.addEvent(name, {
        value,
        ...attributes,
      });
    }
  }
}

/**
 * Create a metrics manager from environment
 */
export function createMetrics(): MetricsManager {
  const config: MetricsConfig = {
    serviceName: process.env.SERVICE_NAME ?? "raypx",
    otlpEndpoint: process.env.OTLP_ENDPOINT,
    enabled: process.env.OTEL_ENABLED === "true",
  };

  return new MetricsManager(config);
}

/**
 * Performance timing helper
 */
export class PerformanceTimer {
  private startTime: number;
  private name: string;

  constructor(name: string) {
    this.name = name;
    this.startTime = performance.now();
  }

  /**
   * Get elapsed time in milliseconds
   */
  elapsed(): number {
    return performance.now() - this.startTime;
  }

  /**
   * End the timer and log the result
   */
  end(logger?: { debug: (message: string, context?: Record<string, unknown>) => void }): number {
    const elapsed = this.elapsed();
    logger?.debug(`Timer: ${this.name}`, { durationMs: elapsed });
    return elapsed;
  }
}

/**
 * Create a performance timer
 */
export function startTimer(name: string): PerformanceTimer {
  return new PerformanceTimer(name);
}
