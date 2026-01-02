import { opentelemetry } from '@elysiajs/opentelemetry';
import { Context, Elysia } from 'elysia';
import { auth } from './lib/auth';
import { verifySmtpConnection } from './lib/mailer';
import router from './router';
import { initTelemetry } from './telemetry/tracer';

// Initialize telemetry before loading logger (pino) so instrumentation can hook in.
await initTelemetry();

const { logger } = await import('./utils/logger');

// Verify SMTP connection on startup
try {
  await verifySmtpConnection();
} catch (error) {
  process.exit(1);
}

// Boilerplate better-auth
const betterAuthView = (context: Context) => {
  const BETTER_AUTH_ACCEPT_METHODS = ['POST', 'GET'];
  // validate request method
  if (BETTER_AUTH_ACCEPT_METHODS.includes(context.request.method)) {
    return auth.handler(context.request);
  } else {
    context.set.status = 405;
  }
};

const app = new Elysia()
  .use(opentelemetry())
  .onError(({ error, code, set }) => {
    handleError(error, code, set);
  })
  .all('/api/auth/*', betterAuthView)
  .use(router)
  .listen(3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

function handleError(error: any, code: string | number, set: any) {
  const httpStatusCode = getHttpStatusCode(code);
  // Log error with trace context
  logger.error(
    {
      err: error,
      code: code,
      http_status: httpStatusCode,
      error_name: error.name,
      error_message: error.message,
    },
    'Request failed'
  );

  // Set response status
  set.status = httpStatusCode;

  // Return error response
  return {
    error: error.message,
    statusCode: httpStatusCode,
  };
}

function getHttpStatusCode(code: string | number): number {
  switch (code) {
    case 'INVALID_COOKIE_SIGNATURE':
      return 401;
    case 'UNKNOWN':
    case 'INTERNAL_SERVER_ERROR':
      return 500;
    case 'PARSE':
    case 'INVALID_FILE_TYPE':
    case 'VALIDATION':
      return 400;
    case 'NOT_FOUND':
      return 404;
    default:
      return typeof code === 'number' ? code : 500;
  }
}
