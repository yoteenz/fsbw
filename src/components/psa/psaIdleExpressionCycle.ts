import type { PsaAvatarExpression } from '../../constants/psaConfig';

export type PsaIdleCycleStep = {
  expression: PsaAvatarExpression;
  /** How long to hold before crossfading to the next step. */
  holdMs: number;
};

/** Closed FAB idle loop — always passes through neutral-smiling between mood shifts. */
export const PSA_IDLE_EXPRESSION_CYCLE: PsaIdleCycleStep[] = [
  { expression: 'neutral', holdMs: 10_000 },
  { expression: 'neutral-smiling', holdMs: 8_000 },
  { expression: 'listening', holdMs: 6_500 },
  { expression: 'neutral-smiling', holdMs: 7_000 },
  { expression: 'thinking-smiling', holdMs: 5_500 },
  { expression: 'neutral-smiling', holdMs: 7_500 },
];

/** Index to resume after a wave — soft landing, not bare neutral. */
export const PSA_IDLE_POST_WAVE_STEP_INDEX = 1;
