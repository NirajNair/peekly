import { logger } from './logger';

export async function retryWithDelay<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries: number;
    delayMs: number;
    operationName: string;
  }
): Promise<T> {
  let lastError: Error;
  for (let retryAttempt = 1; retryAttempt <= options.maxRetries; retryAttempt++) {
    try {
      return fn();
    } catch (error) {
      if (retryAttempt == options.maxRetries) {
        throw error;
      }
      lastError = error as Error;

      logger.warn(
        { error: lastError.message },
        `${options.operationName} failed (attempt ${retryAttempt}/${options.maxRetries}), retrying in ${options.delayMs}ms...`
      );

      await new Promise((resolve) => setTimeout(resolve, options.delayMs));
    }
  }
  throw lastError!;
}
