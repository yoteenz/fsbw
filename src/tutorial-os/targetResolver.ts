import type { TutorialStep } from './types';
import { logMissingTarget } from './progressStorage';

export type ResolvedTarget = {
  element: HTMLElement | null;
  rect: DOMRect | null;
};

const SCROLL_INTO_VIEW_OPTS: ScrollIntoViewOptions = {
  behavior: 'smooth',
  block: 'center',
  inline: 'nearest',
};

export function resolveTutorialTarget(step: TutorialStep, route: string): ResolvedTarget {
  if (!step.targetSelector) {
    return { element: null, rect: null };
  }
  const element = document.querySelector(step.targetSelector) as HTMLElement | null;
  if (!element) {
    logMissingTarget({
      tourId: step.tourId,
      stepId: step.id,
      selector: step.targetSelector,
      route,
    });
    return { element: null, rect: null };
  }
  if (step.animationType === 'scroll' || step.spotlight) {
    element.scrollIntoView(SCROLL_INTO_VIEW_OPTS);
  }
  return { element, rect: element.getBoundingClientRect() };
}

export function waitForTarget(
  step: TutorialStep,
  route: string,
  maxMs = 2400,
  intervalMs = 120
): Promise<ResolvedTarget> {
  return new Promise((resolve) => {
    const started = Date.now();
    const tick = () => {
      const result = resolveTutorialTarget(step, route);
      if (result.element || Date.now() - started >= maxMs) {
        resolve(result);
        return;
      }
      window.setTimeout(tick, intervalMs);
    };
    tick();
  });
}
