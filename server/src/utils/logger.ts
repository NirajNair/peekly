import { context, trace } from '@opentelemetry/api';
import { Logger, pino } from 'pino';
import config from '../config';
import { Environment } from '../../../shared/enums/env.enum';

class ContextLogger {
  private pinoLogger: Logger;

  constructor() {
    this.pinoLogger = pino({
      level: 'info',
      transport:
        config.environment !== Environment.Dev
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
                singleLine: true,
              },
            }
          : {
              target: 'pino-opentelemetry-transport',
              options: {
                url: `${config.otlpEndpoint}/v1/logs`,
                headers: {},
                resourceAttributes: {
                  'service.name': config.otelServiceName,
                  'service.version': config.otelServiceVersion,
                },
                sync: true,
              },
            },
      base: {
        service: config.otelServiceName,
        version: config.otelServiceVersion,
        environment: config.environment,
      },
    });
  }

  private enrichWithTraceContext(obj: any = {}) {
    const span = trace.getSpan(context.active());

    if (span && span.spanContext().traceId) {
      const spanContext = span.spanContext();
      return {
        ...obj,
        trace_id: spanContext.traceId,
        span_id: spanContext.spanId,
        trace_flags: spanContext.traceFlags,
      };
    }

    return obj;
  }

  info(obj: any, msg?: string): void;
  info(msg: string): void;
  info(objOrMsg: any, msg?: string): void {
    if (typeof objOrMsg === 'string') {
      this.pinoLogger.info(this.enrichWithTraceContext(), objOrMsg);
    } else {
      this.pinoLogger.info(this.enrichWithTraceContext(objOrMsg), msg);
    }
  }

  error(obj: any, msg?: string): void;
  error(msg: string): void;
  error(objOrMsg: any, msg?: string): void {
    if (typeof objOrMsg === 'string') {
      this.pinoLogger.error(this.enrichWithTraceContext(), objOrMsg);
    } else {
      this.pinoLogger.error(this.enrichWithTraceContext(objOrMsg), msg);
    }
  }

  warn(obj: any, msg?: string): void;
  warn(msg: string): void;
  warn(objOrMsg: any, msg?: string): void {
    if (typeof objOrMsg === 'string') {
      this.pinoLogger.warn(this.enrichWithTraceContext(), objOrMsg);
    } else {
      this.pinoLogger.warn(this.enrichWithTraceContext(objOrMsg), msg);
    }
  }

  debug(obj: any, msg?: string): void;
  debug(msg: string): void;
  debug(objOrMsg: any, msg?: string): void {
    if (typeof objOrMsg === 'string') {
      this.pinoLogger.debug(this.enrichWithTraceContext(), objOrMsg);
    } else {
      this.pinoLogger.debug(this.enrichWithTraceContext(objOrMsg), msg);
    }
  }
}

export const logger = new ContextLogger();
