import { aioPaths } from '../utils/paths';
import {
  JOURNEY_CONTEXT_PARAM,
  JOURNEY_FROM_PARAM,
  JOURNEY_STEP_PARAM,
  START_BUSINESS_JOURNEY_SLUG,
  type JourneyStepId,
} from './journeyTypes';

export function journeyQuery(
  step?: JourneyStepId,
  from?: string,
): Record<string, string> {
  const q: Record<string, string> = { [JOURNEY_CONTEXT_PARAM]: START_BUSINESS_JOURNEY_SLUG };
  if (step) q[JOURNEY_STEP_PARAM] = step;
  if (from) q[JOURNEY_FROM_PARAM] = from;
  return q;
}

export function withJourneyContext(path: string, step?: JourneyStepId): string {
  const params = new URLSearchParams(journeyQuery(step));
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}${params.toString()}`;
}

export function journeyBackHref(fromParam?: string | null): string {
  if (fromParam && fromParam.startsWith('/')) return fromParam;
  return aioPaths.startYourBusiness;
}

export function parseJourneyStep(param: string | null): JourneyStepId | null {
  const valid: JourneyStepId[] = ['build', 'authorize', 'protect', 'register', 'activate', 'roll'];
  return valid.includes(param as JourneyStepId) ? (param as JourneyStepId) : null;
}

export function isInStartBusinessJourney(searchParams: URLSearchParams): boolean {
  return searchParams.get(JOURNEY_CONTEXT_PARAM) === START_BUSINESS_JOURNEY_SLUG;
}
