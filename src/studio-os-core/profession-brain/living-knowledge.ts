import { LIVING_BRAIN_PROMPT } from './constants';

export const LIVING_BRAIN_PHRASES: RegExp[] = [
  /we changed this/i,
  /we do it differently/i,
  /this regulation changed/i,
  /special exception/i,
  /update.*profession brain/i,
  /forgot to mention/i,
  /we'?ve changed/i,
  /different now/i,
  /new rule/i,
  /policy changed/i,
];

export function detectLivingBrainPhrase(input: string): boolean {
  return LIVING_BRAIN_PHRASES.some((p) => p.test(input.trim()));
}

export function buildLivingBrainResponse(brainLabel?: string): string {
  const target = brainLabel ? ` the ${brainLabel}` : ' your Profession Brain';
  return `${LIVING_BRAIN_PROMPT} Every correction strengthens${target} — organizational intelligence never finishes learning.`;
}
