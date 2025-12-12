import { opentelemetry } from '@elysiajs/opentelemetry';
import { Elysia } from 'elysia';
import router from './router';
import { initTelemetry } from './telemetry/tracer';

// Initialize telemetry before loading logger (pino) so instrumentation can hook in.
await initTelemetry();

const { logger } = await import('./utils/logger');

const app = new Elysia()
  .use(opentelemetry())
  .onError(({ error, code, set }) => {
    handleError(error, code, set);
  })
  .use(router)
  .listen(3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

function handleError(error: any, code: any, set: any) {
  // Log error with trace context
  logger.error('Request failed', error, {
    error_code: code,
    error_name: error.name,
  });

  // Set response status
  set.status = code === 'NOT_FOUND' ? 404 : 500;

  // Return error response
  return {
    error: error.message,
    code: code,
  };
}
