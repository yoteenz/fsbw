import type {
  AtlasDiscoveryStore,
  AtlasWorldForecast,
  AtlasWorldForecastYear,
} from './types';

export function buildWorldForecast(
  horizonYears: AtlasWorldForecastYear,
  discovery: Pick<AtlasDiscoveryStore, 'masterPlan' | 'futureVisionConcepts' | 'buildingMemories'>
): AtlasWorldForecast {
  const operational = discovery.masterPlan.filter((p) => p.phase === 'operational').length;
  const planned = discovery.masterPlan.filter((p) => !p.isConcept && p.phase !== 'operational').length;
  const concepts = discovery.futureVisionConcepts.length;
  const memories = discovery.buildingMemories.length;

  const scale = horizonYears === 1 ? 1 : horizonYears === 3 ? 1.4 : horizonYears === 5 ? 1.8 : 2.5;
  const buildingCount = Math.round((memories + planned * 0.5 + concepts * 0.3) * scale);
  const districtCount = Math.round((planned + operational + 3) * (scale * 0.6));

  const milestones: string[] = [];
  if (horizonYears >= 1) milestones.push('Command Center ring completes · Atlas fully operational');
  if (horizonYears >= 3) milestones.push('Marketing HQ operational · Innovation Quarter commissioned');
  if (horizonYears >= 5) milestones.push('Research Campus · Training Academy · transit loop');
  if (horizonYears >= 10) milestones.push('Full Studio World civilization · 10-year legacy monuments');

  const narrative =
    horizonYears === 1
      ? "Today's reserved land becomes tomorrow's wings — ${planned} projects move from Vision™ toward Operational™ within one year."
      : horizonYears === 3
        ? `Three-year campus: ${buildingCount} buildings, ${districtCount} districts — intentional growth from Master Planner™ decisions made now.`
        : horizonYears === 5
          ? `Five-year headquarters: skybridges connect Expedition Hub™ to Innovation Quarter — founder equity compounds across ${buildingCount} destinations.`
          : `Ten-year legacy campus: ${buildingCount} buildings form a master-planned civilization — every expansion traceable to Atlas World Memory™.`;

  return {
    horizonYears,
    buildingCount,
    districtCount,
    narrative: narrative.replace('${planned}', String(planned)),
    milestones: milestones.slice(0, horizonYears === 1 ? 2 : horizonYears === 3 ? 3 : 4),
  };
}

export function forecastHorizonLabel(years: AtlasWorldForecastYear): string {
  return years === 1 ? '1 YEAR' : `${years} YEARS`;
}
