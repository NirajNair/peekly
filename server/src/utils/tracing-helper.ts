import { Span, SpanStatusCode, trace } from '@opentelemetry/api';

type AwaitedReturn<T> = T extends Promise<infer U> ? U : T;

const tracer = trace.getTracer('peekly-graph');

export function withTracing<T extends (...args: any[]) => any, R = AwaitedReturn<ReturnType<T>>>(
  spanName: string,
  func: T,
  opts?: {
    onStart?: (span: Span, args: Parameters<T>) => void;
    onSuccess?: (span: Span, res: R, args: Parameters<T>) => void;
    onError?: (span: Span, error: any, args: Parameters<T>) => void;
  }
): T {
  return (async (...args: Parameters<T>): Promise<R> => {
    return tracer.startActiveSpan(spanName, async (span) => {
      try {
        opts?.onStart?.(span, args);
        const res = await func(...args);
        span.setAttribute('graph.node', spanName);
        opts?.onSuccess?.(span, res as R, args);
        return res;
      } catch (error: any) {
        span.setStatus({ code: SpanStatusCode.ERROR, message: error?.message });
        span.recordException(error);
        opts?.onError?.(span, error, args);
        throw error;
      } finally {
        span.end();
      }
    });
  }) as T;
}
