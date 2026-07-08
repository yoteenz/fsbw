import type { PlatformMaturityStage } from '../types';

export const PLATFORM_MATURITY_STAGES: PlatformMaturityStage[] = [
  'internal-tool',
  'founder-workflow',
  'company-capability',
  'platform-product',
];

export const PLATFORM_MATURITY_STAGE_LABELS: Record<PlatformMaturityStage, string> = {
  'internal-tool': 'Internal Tool',
  'founder-workflow': 'Founder Workflow',
  'company-capability': 'Company Capability',
  'platform-product': 'Platform Product',
};

export function getStageIndex(stage: PlatformMaturityStage): number {
  return PLATFORM_MATURITY_STAGES.indexOf(stage);
}

export function getNextStage(stage: PlatformMaturityStage): PlatformMaturityStage | null {
  const idx = getStageIndex(stage);
  if (idx < 0 || idx >= PLATFORM_MATURITY_STAGES.length - 1) return null;
  return PLATFORM_MATURITY_STAGES[idx + 1]!;
}

export function canAdvanceStage(
  current: PlatformMaturityStage,
  target: PlatformMaturityStage
): boolean {
  const currentIdx = getStageIndex(current);
  const targetIdx = getStageIndex(target);
  if (currentIdx < 0 || targetIdx < 0) return false;
  return targetIdx === currentIdx + 1;
}

export function stageMeetsMinimum(
  stage: PlatformMaturityStage,
  minimum: PlatformMaturityStage
): boolean {
  return getStageIndex(stage) >= getStageIndex(minimum);
}
