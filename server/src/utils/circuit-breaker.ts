import { logger } from './logger';

interface CircuitState {
  failures: number;
  lastFailureTime: number;
  isOpen: boolean;
}

class CircuitBreaker {
  private circuits: Map<string, CircuitState>;

  private readonly FAILURE_THRESHOLD = 5;
  private readonly RESET_TIMEOUT = 60 * 1000; // 1 minute

  constructor() {
    this.circuits = new Map();
  }

  // skip if circuit is already open
  shouldSkip(serviceName: string) {
    const circuit = this.circuits.get(serviceName);
    if (!circuit || !circuit.isOpen) {
      return false;
    }
    if (Date.now() - circuit.lastFailureTime > this.RESET_TIMEOUT) {
      logger.info(`Circuit breaker RESET automatically for ${serviceName} after timeout`);
      this.circuits.delete(serviceName);
      return false;
    }

    logger.warn(`Circuit breaker OPEN for ${serviceName}, skipping`);
    return true;
  }

  recordFailure(serviceName: string) {
    const circuit = this.circuits.get(serviceName) || {
      failures: 0,
      lastFailureTime: Date.now(),
      isOpen: false,
    };
    circuit.failures++;
    circuit.lastFailureTime = Date.now();

    if (circuit.failures >= this.FAILURE_THRESHOLD) {
      circuit.isOpen = true;
      logger.error(`Circuit breaker OPENED for ${serviceName} after ${circuit.failures} failures`);
    }

    this.circuits.set(serviceName, circuit);
  }

  recordSuccess(serviceName: string) {
    this.circuits.delete(serviceName);
    logger.info(`Circuit breaker RESET for ${serviceName} after success`);
  }
}

export const circuitBreaker = new CircuitBreaker();
