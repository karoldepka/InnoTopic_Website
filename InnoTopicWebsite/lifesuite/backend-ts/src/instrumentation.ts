import { registerOTel } from '@vercel/otel';

// Initialise OpenTelemetry before the server starts.
// Set OTEL_EXPORTER_OTLP_ENDPOINT to export traces to Jaeger / Tempo / Vercel.
registerOTel({ serviceName: 'lifesuite-backend-ts' });
