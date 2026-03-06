import type { AnalyticsEvent, PerformanceMetric } from "./types";

class Analytics {
  private events: AnalyticsEvent[] = [];
  private metrics: PerformanceMetric[] = [];
  private flushInterval: ReturnType<typeof setInterval> | null = null;
  private maxBufferSize = 100;

  constructor() {
    if (typeof window !== "undefined") {
      this.startFlushInterval();
    }
  }

  /**
   * Track an analytics event
   */
  track(event: AnalyticsEvent): void {
    this.events.push({
      ...event,
      timestamp: event.timestamp ?? new Date(),
    });

    if (this.events.length >= this.maxBufferSize) {
      this.flush();
    }
  }

  /**
   * Track a performance metric
   */
  metric(metric: PerformanceMetric): void {
    this.metrics.push({
      ...metric,
      timestamp: metric.timestamp ?? new Date(),
    });

    if (this.metrics.length >= this.maxBufferSize) {
      this.flushMetrics();
    }
  }

  /**
   * Track page view
   */
  pageView(path: string, properties?: Record<string, unknown>): void {
    this.track({
      name: "page_view",
      properties: {
        path,
        ...properties,
      },
    });
  }

  /**
   * Track user action
   */
  action(action: string, properties?: Record<string, unknown>): void {
    this.track({
      name: "user_action",
      properties: {
        action,
        ...properties,
      },
    });
  }

  /**
   * Track API call performance
   */
  apiCall(endpoint: string, duration: number, status: number): void {
    this.metric({
      name: "api_call_duration",
      value: duration,
      unit: "ms",
      tags: {
        endpoint,
        status: String(status),
      },
    });
  }

  /**
   * Flush events to server
   */
  private flush(): void {
    if (this.events.length === 0) return;

    const events = [...this.events];
    this.events = [];

    // Send to analytics endpoint
    this.send("/api/analytics/events", { events }).catch(() => {
      // Re-add events on failure
      this.events = [...events, ...this.events].slice(0, this.maxBufferSize);
    });
  }

  /**
   * Flush metrics to server
   */
  private flushMetrics(): void {
    if (this.metrics.length === 0) return;

    const metrics = [...this.metrics];
    this.metrics = [];

    this.send("/api/analytics/metrics", { metrics }).catch(() => {
      this.metrics = [...metrics, ...this.metrics].slice(0, this.maxBufferSize);
    });
  }

  /**
   * Send data to server
   */
  private async send(endpoint: string, data: unknown): Promise<void> {
    if (typeof window === "undefined") return;

    try {
      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        keepalive: true,
      });
    } catch {
      // Silently fail
    }
  }

  /**
   * Start interval to flush periodically
   */
  private startFlushInterval(): void {
    this.flushInterval = setInterval(() => {
      this.flush();
      this.flushMetrics();
    }, 30 * 1000); // Every 30 seconds
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
    this.flushMetrics();
  }
}

// Singleton instance
let analyticsInstance: Analytics | null = null;

export function getAnalytics(): Analytics {
  if (!analyticsInstance) {
    analyticsInstance = new Analytics();
  }
  return analyticsInstance;
}

export { Analytics };
