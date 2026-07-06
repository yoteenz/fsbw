import { readFounderPilotModeStore } from '../founder-pilot-mode/store';
import { applySeasonEffects, atmosphereModeLabel, resolveAtmosphereMode } from './atmosphere';
import { buildExecutiveCollection } from './executive-collection';
import { buildLegacyWall } from './legacy-wall';
import { resolveCelebrationMessage, resolveLivingMemory } from './living-memories';
import { resolveLivingSeason, seasonAtmosphereLabel } from './season';
import type { LivingHeadquartersInput, LivingHeadquartersState } from './types';

function yearsSinceFounding(foundedAt: string | null | undefined, now = new Date()): number {
  if (!foundedAt) return 0;
  const f = new Date(foundedAt);
  let years = now.getFullYear() - f.getFullYear();
  const ann = new Date(f);
  ann.setFullYear(now.getFullYear());
  if (now < ann) years -= 1;
  return Math.max(0, years);
}

/** Living Headquarters™ — emotional environmental state for Headquarters Experience. */
export function resolveLivingHeadquarters(input: LivingHeadquartersInput, now = new Date()): LivingHeadquartersState {
  const pilot = readFounderPilotModeStore(input.organizationId);
  const milestoneRecords =
    input.milestoneRecords ??
    (pilot.enabled
      ? pilot.milestones.map((m) => ({
          id: m.id,
          label: m.label,
          description: m.description,
          recordedAt: m.recordedAt,
        }))
      : []);

  const organizationFoundedAt = input.organizationFoundedAt ?? (pilot.enabled ? pilot.activatedAt : null);
  const pagesPublished = input.pagesPublished ?? pilot.pagesPublished;
  const knowledgeAssets = input.knowledgeAssets ?? pilot.knowledgeAssets;
  const healthScore = input.healthScore ?? 70;

  const season = resolveLivingSeason(now);
  const atmosphereMode = resolveAtmosphereMode(milestoneRecords, organizationFoundedAt, healthScore, now);
  const effects = applySeasonEffects(season, atmosphereMode);

  const legacyWall = buildLegacyWall(
    { ...input, pagesPublished, knowledgeAssets },
    milestoneRecords
  );
  const executiveCollection = buildExecutiveCollection(milestoneRecords);
  const livingMemory = resolveLivingMemory(milestoneRecords, organizationFoundedAt, now);
  const celebrationMessage = resolveCelebrationMessage(milestoneRecords, now);

  const atmosphereLabel =
    atmosphereMode === 'default'
      ? seasonAtmosphereLabel(season)
      : atmosphereModeLabel(atmosphereMode);

  return {
    season,
    atmosphereMode,
    atmosphereLabel,
    livingMemory,
    celebrationMessage,
    legacyWall,
    executiveCollection,
    organizationAgeYears: yearsSinceFounding(organizationFoundedAt, now),
    ...effects,
  };
}
