import { evaluateDestinationExperience } from './destination-evaluator';
import { detectExperienceIssues } from './experience-detector';
import { recommendDiscoveryOpportunities } from './discovery-engine';
import { analyzeExperienceFlow } from './flow-analyzer';
import { generateExperienceImprovements } from './improvement-engine';
import { experienceMemoryBoost } from './memory-store';
import { STUDIO_WORLD_MIGRATION_AUDIT } from '../studio-world/migration-audit';
import type {
  ExperienceIntelligenceGateContext,
  ExperienceIntelligenceGateResult,
  ExperienceIntelligenceReport,
  ExperienceScores,
} from './types';

function applyMemoryBoost(scores: ExperienceScores, boost: number): ExperienceScores {
  const apply = (n: number) => Math.min(100, n + boost);
  return {
    immersion: apply(scores.immersion),
    wonder: apply(scores.wonder),
    luxury: apply(scores.luxury),
    emotionalImpact: apply(scores.emotionalImpact),
    navigationClarity: apply(scores.navigationClarity),
    environmentalStorytelling: apply(scores.environmentalStorytelling),
    cinematicQuality: apply(scores.cinematicQuality),
    personality: apply(scores.personality),
    senseOfDiscovery: apply(scores.senseOfDiscovery),
    senseOfScale: apply(scores.senseOfScale),
    believability: apply(scores.believability),
    flow: apply(scores.flow),
    replayability: apply(scores.replayability),
    founderDelight: apply(scores.founderDelight),
    guestDelight: apply(scores.guestDelight),
    overallMagic: apply(scores.overallMagic),
  };
}

/**
 * Studio World™ Creative Director — full experience intelligence evaluation.
 */
export function runExperienceIntelligenceAudit(
  context?: ExperienceIntelligenceGateContext
): ExperienceIntelligenceReport {
  const rows = STUDIO_WORLD_MIGRATION_AUDIT;
  const issues = detectExperienceIssues(rows);
  const { scores: baseScores, observatory: baseObs } = evaluateDestinationExperience(
    context?.projectId
  );
  const boost = experienceMemoryBoost(context?.route, context?.departmentId);
  const scores = applyMemoryBoost(baseScores, boost);
  const observatory = {
    ...baseObs,
    immersionHealth: scores.immersion,
    wonderIndex: scores.wonder,
    luxuryScore: scores.luxury,
    discoveryDensity: scores.senseOfDiscovery,
    emotionalImpact: scores.emotionalImpact,
    navigationFlow: scores.flow,
    founderDelight: scores.founderDelight,
    interactionQuality: Math.round((scores.personality + scores.flow) / 2),
  };

  const improvements = generateExperienceImprovements(issues);
  const discoveryOpportunities = recommendDiscoveryOpportunities();
  const flowFriction = analyzeExperienceFlow();

  const recommendedUpgrades = improvements
    .filter((i) => i.estimatedImpact === 'high')
    .slice(0, 8)
    .map((i) => i.recommendation);

  const critical = issues.filter((i) => i.severity === 'critical').length;
  const passed = scores.overallMagic >= 45 && critical < 20;

  return {
    evaluatedAt: new Date().toISOString(),
    scores,
    observatory,
    issues,
    improvements,
    discoveryOpportunities,
    flowFriction,
    recommendedUpgrades,
    passed,
  };
}

export function runExperienceIntelligenceGate(
  context: ExperienceIntelligenceGateContext
): ExperienceIntelligenceGateResult {
  const report = runExperienceIntelligenceAudit(context);

  if (context.kind === 'scene' && report.scores.overallMagic < 35) {
    return {
      ok: true,
      passed: false,
      proceed: false,
      report,
      reason: 'Experience Intelligence™ — scene lacks minimum magic threshold before Quality Inspector™',
    };
  }

  if (context.kind === 'destination' && report.scores.founderDelight < 30) {
    return {
      ok: true,
      passed: false,
      proceed: false,
      report,
      reason: 'Creative Director recommends experience upgrades before deploy',
    };
  }

  const passed = report.passed || context.kind === 'continuous';
  return {
    ok: true,
    passed,
    proceed: passed,
    report,
    reason: passed ? undefined : 'Experience does not yet meet Studio World magic standard',
  };
}

export function requestExperienceIntelligenceAudit(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('studio-world-experience-intelligence-requested'));
  }
}
