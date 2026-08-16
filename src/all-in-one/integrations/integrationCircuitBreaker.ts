import type { CircuitBreakerState } from './integrationTypes';

export interface CircuitBreakerConfig {
  failureThreshold: number;
  openDurationMs: number;
  halfOpenSuccessThreshold: number;
}

export const DEFAULT_CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  openDurationMs: 60_000,
  halfOpenSuccessThreshold: 2,
};

export interface CircuitBreakerSnapshot {
  state: CircuitBreakerState;
  consecutiveFailures: number;
  openedAt?: string;
  lastFailureAt?: string;
}

export function recordCircuitSuccess(snapshot: CircuitBreakerSnapshot, config = DEFAULT_CIRCUIT_BREAKER_CONFIG): CircuitBreakerSnapshot {
  if (snapshot.state === 'HALF_OPEN') {
    const successes = (snapshot.consecutiveFailures < 0 ? -snapshot.consecutiveFailures : 0) + 1;
    if (successes >= config.halfOpenSuccessThreshold) {
      return { state: 'CLOSED', consecutiveFailures: 0 };
    }
    return { ...snapshot, consecutiveFailures: -successes };
  }
  return { state: 'CLOSED', consecutiveFailures: 0 };
}

export function recordCircuitFailure(
  snapshot: CircuitBreakerSnapshot,
  config = DEFAULT_CIRCUIT_BREAKER_CONFIG,
): CircuitBreakerSnapshot {
  const failures = snapshot.consecutiveFailures + 1;
  if (failures >= config.failureThreshold) {
    return {
      state: 'OPEN',
      consecutiveFailures: failures,
      openedAt: new Date().toISOString(),
      lastFailureAt: new Date().toISOString(),
    };
  }
  return {
    ...snapshot,
    consecutiveFailures: failures,
    lastFailureAt: new Date().toISOString(),
  };
}

export function shouldAllowRequest(snapshot: CircuitBreakerSnapshot, config = DEFAULT_CIRCUIT_BREAKER_CONFIG): boolean {
  if (snapshot.state === 'CLOSED') return true;
  if (snapshot.state === 'HALF_OPEN') return true;
  if (snapshot.state === 'OPEN' && snapshot.openedAt) {
    const elapsed = Date.now() - new Date(snapshot.openedAt).getTime();
    return elapsed >= config.openDurationMs;
  }
  return false;
}

export function transitionToHalfOpen(snapshot: CircuitBreakerSnapshot): CircuitBreakerSnapshot {
  if (snapshot.state !== 'OPEN') return snapshot;
  return { ...snapshot, state: 'HALF_OPEN', consecutiveFailures: 0 };
}
