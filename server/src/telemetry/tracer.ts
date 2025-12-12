import { diag, DiagConsoleLogger, DiagLogLevel, metrics, trace } from '@opentelemetry/api';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { HostMetrics } from '@opentelemetry/host-metrics';
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import config from '../config';

const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: config.otelServiceName,
  [ATTR_SERVICE_VERSION]: config.otelServiceVersion,
});

// Enable OpenTelemetry's internal logging for debugging
// Remove this in production or set to DiagLogLevel.ERROR
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const traceExporter = new OTLPTraceExporter({
  url: `${config.otlpEndpoint}/v1/traces`,
});

const metricExporter = new OTLPMetricExporter({
  url: `${config.otlpEndpoint}/v1/metrics`,
});
const metricReader = new PeriodicExportingMetricReader({
  exporter: metricExporter,
  exportIntervalMillis: 15000, // 15s
});

let hostMetrics: HostMetrics | undefined;

let sdk: NodeSDK;

export async function initTelemetry() {
  if (sdk) {
    console.log('OpenTelemetry already initialized');
    return;
  }

  sdk = new NodeSDK({
    resource,
    traceExporter,
    metricReaders: [metricReader],
    instrumentations: [
      new PinoInstrumentation({
        logHook: (span, record) => {
          record['traceId'] = span.spanContext().traceId;
          record['spanId'] = span.spanContext().spanId;
          record['traceFlags'] = span.spanContext().traceFlags;
        },
      }),
    ],
  });

  await sdk.start();

  // Start host metrics after the global MeterProvider is registered by the SDK.
  hostMetrics = new HostMetrics({
    metricGroups: [
      'system.cpu',
      'system.memory',
      'system.network',
      'process.cpu',
      'process.memory',
    ],
  });
  hostMetrics.start();

  console.log('OpenTelemetry initialized successfully');
  console.log(`Sending telemetry to: ${config.otlpEndpoint}`);

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    sdk
      ?.shutdown()
      .then(() => console.log('OpenTelemetry shut down successfully'))
      .catch((error) => console.error('Error shutting down OpenTelemetry', error))
      .finally(() => process.exit(0));
  });
}

export function getTracer() {
  return trace.getTracer(config.otelServiceName, config.otelServiceVersion);
}

export function getMeter() {
  return metrics.getMeter(config.otelServiceName, config.otelServiceVersion);
}
