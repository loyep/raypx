import { getAnalytics } from "../analytics";

export interface ClientPerformanceConfig {
  /** Track web vitals */
  trackWebVitals?: boolean;
  /** Track API calls */
  trackApiCalls?: boolean;
  /** Track route changes */
  trackRouteChanges?: boolean;
}

/**
 * Initialize client-side performance monitoring
 */
export function initPerformanceMonitoring(config: ClientPerformanceConfig = {}): void {
  if (typeof window === "undefined") return;

  const { trackWebVitals = true, trackApiCalls = true, trackRouteChanges = true } = config;
  const analytics = getAnalytics();

  // Track Web Vitals
  if (trackWebVitals) {
    trackWebVitalsMetrics(analytics);
  }

  // Track API calls
  if (trackApiCalls) {
    trackFetchPerformance(analytics);
  }

  // Track route changes
  if (trackRouteChanges) {
    trackRouteChangesTiming(analytics);
  }
}

/**
 * Track Core Web Vitals
 */
function trackWebVitalsMetrics(analytics: ReturnType<typeof getAnalytics>): void {
  // Use PerformanceObserver for LCP, FID, CLS
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === "largest-contentful-paint") {
        analytics.metric({
          name: "web_vital_lcp",
          value: entry.startTime,
          unit: "ms",
        });
      }
      if (entry.entryType === "first-input") {
        const fidEntry = entry as PerformanceEntry & {
          processingStart: number;
        };
        analytics.metric({
          name: "web_vital_fid",
          value: fidEntry.processingStart - entry.startTime,
          unit: "ms",
        });
      }
      if (entry.entryType === "layout-shift") {
        const clsEntry = entry as PerformanceEntry & {
          hadRecentInput: boolean;
          value: number;
        };
        if (!clsEntry.hadRecentInput) {
          analytics.metric({
            name: "web_vital_cls",
            value: clsEntry.value,
            unit: "score",
          });
        }
      }
    }
  });

  try {
    observer.observe({ type: "largest-contentful-paint", buffered: true });
    observer.observe({ type: "first-input", buffered: true });
    observer.observe({ type: "layout-shift", buffered: true });
  } catch {
    // Browser doesn't support these entry types
  }

  // Track navigation timing
  window.addEventListener("load", () => {
    setTimeout(() => {
      const nav = performance.getEntriesByType("navigation")[0] as
        | PerformanceNavigationTiming
        | undefined;
      if (nav) {
        analytics.metric({
          name: "page_load_time",
          value: nav.loadEventEnd - nav.fetchStart,
          unit: "ms",
        });
        analytics.metric({
          name: "dom_content_loaded",
          value: nav.domContentLoadedEventEnd - nav.fetchStart,
          unit: "ms",
        });
        analytics.metric({
          name: "time_to_first_byte",
          value: nav.responseStart - nav.requestStart,
          unit: "ms",
        });
      }
    }, 0);
  });
}

/**
 * Track fetch API performance
 */
function trackFetchPerformance(analytics: ReturnType<typeof getAnalytics>): void {
  const originalFetch = window.fetch;

  window.fetch = async (...args) => {
    const startTime = performance.now();
    const url = typeof args[0] === "string" ? args[0] : (args[0] as Request).url;

    try {
      const response = await originalFetch(...args);
      const duration = performance.now() - startTime;

      analytics.apiCall(url, duration, response.status);

      return response;
    } catch (error) {
      const duration = performance.now() - startTime;
      analytics.apiCall(url, duration, 0);
      throw error;
    }
  };
}

/**
 * Track route change timing
 */
function trackRouteChangesTiming(analytics: ReturnType<typeof getAnalytics>): void {
  // Track initial page view
  analytics.pageView(window.location.pathname);

  // Track route changes (for SPA)
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = (...args) => {
    originalPushState.apply(history, args);
    analytics.pageView(window.location.pathname);
  };

  history.replaceState = (...args) => {
    originalReplaceState.apply(history, args);
    analytics.pageView(window.location.pathname);
  };

  window.addEventListener("popstate", () => {
    analytics.pageView(window.location.pathname);
  });
}

export { getAnalytics } from "../analytics";
