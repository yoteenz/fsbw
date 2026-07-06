import { readFounderPilotModeStore } from '../founder-pilot-mode/store';
import {
  applyPreferencesToCelebrationMessage,
  applyPreferencesToLivingMemory,
  buildLifeCultureContext,
  filterLivingHeadquartersEffects,
} from '../life-culture-preferences';
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
  const lifeCulture = buildLifeCultureContext(input.organizationId);
  const allowHoliday =
    input.allowHolidayAtmosphere ?? lifeCulture.allowHolidayEnvironment;
  const allowSeasonal =
    input.allowSeasonalEnvironment ?? lifeCulture.allowSeasonalEnvironment;

  const season = resolveLivingSeason(now);
  const atmosphereMode = resolveAtmosphereMode(
    milestoneRecords,
    organizationFoundedAt,
    healthScore,
    now,
    { allowHolidayAtmosphere: allowHoliday }
  );
  let effects = applySeasonEffects(season, atmosphereMode);
  if (!allowSeasonal) {
    effects = { ...effects, floralAccent: false, goldenHour: false };
  }
  effects = filterLivingHeadquartersEffects(lifeCulture, effects, atmosphereMode);

  const legacyWall = buildLegacyWall(
    { ...input, pagesPublished, knowledgeAssets },
    milestoneRecords
  );
  const executiveCollection = buildExecutiveCollection(milestoneRecords);
  const rawLivingMemory = resolveLivingMemory(milestoneRecords, organizationFoundedAt, now);
  const livingMemory = applyPreferencesToLivingMemory(
    lifeCulture,
    rawLivingMemory,
    Boolean(rawLivingMemory?.toLowerCase().includes('founded'))
  );
  const rawCelebration = resolveCelebrationMessage(milestoneRecords, now);
  const celebrationMessage = applyPreferencesToCelebrationMessage(lifeCulture, rawCelebration);

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
    communicationStyle: lifeCulture.communicationStyle,
    ...effects,
  };
}
