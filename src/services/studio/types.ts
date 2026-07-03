/** Studio service layer — shared Phase 2 contract (no live integrations). */

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
