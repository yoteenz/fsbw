/**
 * StudioOS service layer — shared platform service contracts.
 */

export type StudioServicePhase = 1 | 2;

export type StudioServiceFailureReason = 'NOT_CONNECTED' | 'PHASE_2' | 'DISABLED';

export type StudioServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: StudioServiceFailureReason; message: string };

export interface StudioServiceStub {
  readonly id: string;
  readonly label: string;
  readonly phase: StudioServicePhase;
  readonly enabled: boolean;
  readonly description: string;
}

export function studioServiceNotConnected<T>(message: string): StudioServiceResult<T> {
  return { ok: false, reason: 'NOT_CONNECTED', message };
}

export function studioServicePhase2<T>(message: string): StudioServiceResult<T> {
  return { ok: false, reason: 'PHASE_2', message };
}

/** Generic provider adapter state for AI and media providers. */
export type ProviderAdapterState = {
  id: string;
  enabled: boolean;
  statusMessage: string;
  lastCall: string | null;
};

export interface StudioProviderAdapter {
  readonly id: string;
  readonly label: string;
  readonly interchangeable: boolean;
  getState: () => ProviderAdapterState;
}
