import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { TraceIdRatioBasedSampler } from "@opentelemetry/sdk-trace-node";
import {
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
  SEMRESATTRS_SERVICE_NAME,
} from "@opentelemetry/semantic-conventions";
import { createLogger } from "@raypx/core/logger";

const log = createLogger({ tag: "telemetry" });

export interface ServerTelemetryConfig {
  enabled: boolean;
  serviceName: string;
  endpoint?: string;
  environment?: string;
  sampleRate?: number;
}

let sdk: NodeSDK | null = null;

/**
 * Initialize OpenTelemetry for server-side
 */
export function initTelemetry(config: ServerTelemetryConfig): void {
  if (!config.enabled) {
    log.info("Telemetry disabled");
    return;
  }

  if (sdk) {
    log.warn("Telemetry already initialized");
    return;
  }

  const exporter = config.endpoint ? new OTLPTraceExporter({ url: config.endpoint }) : undefined;

  const sampleRate = config.sampleRate ?? 1.0;

  sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [SEMRESATTRS_SERVICE_NAME]: config.serviceName,
      [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: config.environment ?? "development",
    }),
    traceExporter: exporter,
    sampler: new TraceIdRatioBasedSampler(sampleRate),
  });

  sdk.start();
  log.info(`Telemetry initialized for ${config.serviceName}`);
}

/**
 * Shutdown telemetry
 */
export async function shutdownTelemetry(): Promise<void> {
  if (sdk) {
    await sdk.shutdown();
    sdk = null;
    log.info("Telemetry shutdown");
  }
}
