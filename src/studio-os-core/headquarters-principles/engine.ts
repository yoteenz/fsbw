import { readHeadquartersPrinciplesStore } from './persistence/store';
import { bootstrapHeadquartersPrinciplesStore, getSubsystemSeedCount } from './bootstrap/seeds';
import { buildDailyBriefing, buildDailyBriefingLines } from './briefing/daily-briefing';
import {
  listHeadquartersZones,
  getDefaultHeadquartersArrivalPath,
  getHeadquartersZone,
} from './headquarters/architecture';
import {
  getRoutingPhilosophyLines,
  resolveFounderArrivalPath,
  resolveHeadquartersRoute,
  HEADQUARTERS_ROUTING_PHILOSOPHY,
} from './routing';
import {
  listCanonicalTerminology,
  resolveConstitutionalTerm,
  translateFounderFacingLabel,
} from './terminology';
import {
  listSubsystemMaturityRecords,
  getSubsystemMaturityRecord,
  listExpansionCandidates,
} from './maturity/registry';
import {
  assertPlatformExpansionAllowed,
  canPromoteToPlatformProduct,
  constitutionalExpansionSummary,
  listBlockedExpansions,
} from './maturity/promotion-gate';
import { PLATFORM_MATURITY_STAGES, PLATFORM_MATURITY_STAGE_LABELS } from './maturity/stages';
import {
  buildHeadquartersOrbLines,
  resolveHeadquartersPrinciplesAdvice,
  resolveHeadquartersPrinciplesOrbLine,
} from './orb/advisor';

export type HeadquartersPrinciplesStats = {
  subsystemCount: number;
  expansionEligible: number;
  expansionBlocked: number;
  platformProducts: number;
  averageReadiness: number;
  zoneCount: number;
};

export function ensureHeadquartersPrinciplesStore() {
  return readHeadquartersPrinciplesStore();
}

export function getHeadquartersPrinciplesStats(): HeadquartersPrinciplesStats {
  const store = readHeadquartersPrinciplesStore();
  const expansion = constitutionalExpansionSummary(store.subsystems);
  const avg =
    store.subsystems.length === 0
      ? 0
      : Math.round(
          store.subsystems.reduce((sum, s) => sum + s.platformReadiness, 0) / store.subsystems.length
        );

  return {
    subsystemCount: store.subsystems.length,
    expansionEligible: expansion.eligibleCount,
    expansionBlocked: expansion.blockedCount,
    platformProducts: expansion.platformProductCount,
    averageReadiness: avg,
    zoneCount: listHeadquartersZones().length,
  };
}

export function listPlatformMaturityRegistry() {
  return listSubsystemMaturityRecords(readHeadquartersPrinciplesStore().subsystems);
}

export function listPlatformReadinessReports() {
  return listPlatformMaturityRegistry().map((record) => ({
    subsystemId: record.subsystemId,
    title: record.title,
    readinessScore: record.platformReadiness,
    currentStage: record.currentStage,
    expansionEligible: record.expansionEligible,
    expansionBlockers: record.expansionBlockers,
    topGap: record.readinessDimensions.sort((a, b) => a.score - b.score)[0]?.label,
  }));
}

export {
  HEADQUARTERS_ROUTING_PHILOSOPHY,
  PLATFORM_MATURITY_STAGES,
  PLATFORM_MATURITY_STAGE_LABELS,
  bootstrapHeadquartersPrinciplesStore,
  getSubsystemSeedCount,
  listHeadquartersZones,
  getHeadquartersZone,
  getDefaultHeadquartersArrivalPath,
  resolveFounderArrivalPath,
  resolveHeadquartersRoute,
  getRoutingPhilosophyLines,
  listCanonicalTerminology,
  resolveConstitutionalTerm,
  translateFounderFacingLabel,
  getSubsystemMaturityRecord,
  listExpansionCandidates,
  assertPlatformExpansionAllowed,
  canPromoteToPlatformProduct,
  constitutionalExpansionSummary,
  listBlockedExpansions,
  buildDailyBriefing,
  buildDailyBriefingLines,
  buildHeadquartersOrbLines,
  resolveHeadquartersPrinciplesAdvice,
  resolveHeadquartersPrinciplesOrbLine,
};
