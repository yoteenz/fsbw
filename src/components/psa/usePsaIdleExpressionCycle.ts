import { useCallback, useEffect, useRef, useState } from 'react';
import type { PsaAvatarExpression } from '../../constants/psaConfig';
import {
  PSA_IDLE_EXPRESSION_CYCLE,
  PSA_IDLE_POST_WAVE_STEP_INDEX,
} from './psaIdleExpressionCycle';

/**
 * Advances through a slow idle expression loop while the FAB chat is closed.
 */
export function usePsaIdleExpressionCycle(active: boolean): {
  expression: PsaAvatarExpression;
  resetToSoftLanding: () => void;
} {
  const stepRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [expression, setExpression] = useState<PsaAvatarExpression>(
    PSA_IDLE_EXPRESSION_CYCLE[0].expression
  );

  const clearTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const scheduleFromStep = (stepIndex: number) => {
    clearTimer();
    const step = PSA_IDLE_EXPRESSION_CYCLE[stepIndex];
    stepRef.current = stepIndex;
    setExpression(step.expression);

    timeoutRef.current = setTimeout(() => {
      const next = (stepIndex + 1) % PSA_IDLE_EXPRESSION_CYCLE.length;
      scheduleFromStep(next);
    }, step.holdMs);
  };

  const resetToSoftLanding = useCallback(() => {
    stepRef.current = PSA_IDLE_POST_WAVE_STEP_INDEX;
    if (active) {
      scheduleFromStep(PSA_IDLE_POST_WAVE_STEP_INDEX);
    }
  }, [active]);

  useEffect(() => {
    if (!active) {
      clearTimer();
      return;
    }

    scheduleFromStep(stepRef.current);

    return clearTimer;
  }, [active]);

  return { expression, resetToSoftLanding };
}
