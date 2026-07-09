import {
  listSystemHealthScores,
  computeOverallSystemHealthAverage,
} from '../../live-validation-system/system-health/health-engine';
import {
  listDiaryPrompts,
  listDiaryAnswers,
} from '../../live-validation-system/founder-diary/diary-engine';
import { listImprovementProposals } from '../../live-validation-system/genesis-learning/proposal-engine';
import {
  listEscapePatterns,
  computePlatformEscapeVelocityScore,
} from '../../live-validation-system/escape-velocity/escape-velocity-engine';
import { evaluateWithdrawalTest } from '../../founder-acceptance-testing/withdrawal-test/withdrawal-engine';
import { evaluateReplacementTest } from '../../founder-acceptance-testing/replacement-test/replacement-engine';
import { listValidationRegistry } from '../../founder-acceptance-testing/validation/registry';
import {
  buildEvolutionLaunchStackProgress,
  computeLaunchStackProgressPercent,
} from '../../evolution-room/launch-stack/launch-stack-engine';
import { buildExecutiveEvolutionBrief } from '../../evolution-room/brief/brief-engine';
import { buildFounderTimeline } from '../../evolution-room/founder-timeline/timeline-engine';
import { listLegacyTimeline } from '../../evolution-room/legacy-wall/legacy-engine';
import { listFutureOpportunities } from '../../evolution-room/future-wall/future-engine';
import { buildEvolutionCouncilAgenda } from '../../evolution-room/council/council-engine';
import { listAutomationSuggestions } from '../../evolution-room/automation/automation-engine';
import type { ErsHealthReading } from '../types';

function now(): string {
  return new Date().toISOString();
}

export function buildExecutiveReviewSummary(founderName = 'Founder'): string {
  const brief = buildExecutiveEvolutionBrief(founderName);
  return brief.executiveSummary;
}

export function buildAllHealthReadings(): ErsHealthReading[] {
  const systemHealth = listSystemHealthScores();
  const systemAvg = computeOverallSystemHealthAverage();
  const launchPct = computeLaunchStackProgressPercent();
  const escapeScore = computePlatformEscapeVelocityScore();
  const automations = listAutomationSuggestions();
  const diaryAnswers = listDiaryAnswers(10);

  const founderStress = diaryAnswers.filter(
    (a) => a.sentiments.includes('stress') || a.sentiments.includes('frustration')
  ).length;
  const founderConfidence = diaryAnswers.filter(
    (a) => a.sentiments.includes('confidence') || a.sentiments.includes('delight')
  ).length;

  const founderScore = Math.max(40, Math.min(95, 72 - founderStress * 5 + founderConfidence * 3));

  return [
    {
      lens: 'system',
      score: systemAvg,
      trend: systemAvg >= 70 ? 'up' : 'flat',
      summary: `${systemHealth.length} Launch Stack systems tracked`,
      evidence: systemHealth.slice(0, 4).map((h) => `${h.officialName}: ${h.overallHealth}`),
      evaluatedAt: now(),
    },
    {
      lens: 'launch-stack',
      score: launchPct,
      trend: launchPct >= 65 ? 'up' : 'flat',
      summary: 'Launch Stack graduation progress',
      evidence: buildEvolutionLaunchStackProgress()
        .slice(0, 4)
        .map((m) => `${m.officialName}: ${m.progressPercent}%`),
      evaluatedAt: now(),
    },
    {
      lens: 'company',
      score: Math.round((systemAvg + launchPct) / 2),
      trend: 'flat',
      summary: 'Company operating health synthesized from platform validation',
      evidence: [`System health avg ${systemAvg}`, `Launch Stack ${launchPct}%`],
      evaluatedAt: now(),
    },
    {
      lens: 'founder',
      score: founderScore,
      trend: founderConfidence > founderStress ? 'up' : founderStress > 2 ? 'down' : 'flat',
      summary: 'Founder reflection and diary sentiment synthesis',
      evidence: [
        `${founderConfidence} confidence signals`,
        `${founderStress} stress/friction signals`,
      ],
      evaluatedAt: now(),
    },
    {
      lens: 'knowledge',
      score: Math.min(90, 55 + diaryAnswers.filter((a) => a.shouldBecomeGenesisLearning).length * 8),
      trend: 'up',
      summary: 'Knowledge capture from diary and learning candidates',
      evidence: diaryAnswers
        .filter((a) => a.shouldBecomeGenesisLearning)
        .slice(0, 3)
        .map((a) => a.response.slice(0, 60)),
      evaluatedAt: now(),
    },
    {
      lens: 'mission',
      score: Math.round(launchPct * 0.7 + systemAvg * 0.3),
      trend: 'flat',
      summary: 'Mission velocity inferred from Launch Stack and system health',
      evidence: ['Launch Stack progress drives mission readiness'],
      evaluatedAt: now(),
    },
    {
      lens: 'automation',
      score: Math.min(88, 50 + automations.length * 6),
      trend: 'up',
      summary: `${automations.length} automation candidates identified`,
      evidence: automations.slice(0, 3).map((a) => a.title),
      evaluatedAt: now(),
    },
    {
      lens: 'executive',
      score: Math.round((systemAvg + launchPct + founderScore) / 3),
      trend: 'flat',
      summary: 'Executive environment synthesis — clarity, progress, founder sustainability',
      evidence: [`Escape velocity ${escapeScore}`, 'Executive health composite'],
      evaluatedAt: now(),
    },
  ];
}

export function buildWithdrawalTestSummaries() {
  return listValidationRegistry().map((r) => {
    const result = evaluateWithdrawalTest(r.systemId);
    return {
      systemId: r.systemId,
      officialName: r.officialName,
      indispensable: result.founderWouldMiss,
      score: Math.round((result.criteriaMet / result.criteriaTotal) * 100),
    };
  });
}

export function buildReplacementTestSummaries() {
  return listValidationRegistry().map((r) => {
    const result = evaluateReplacementTest(r.systemId);
    return {
      systemId: r.systemId,
      officialName: r.officialName,
      replaced: result.passed,
      remainingDependencies: result.retainedTools,
    };
  });
}

export {
  listDiaryPrompts as listFounderDiaryPrompts,
  listDiaryAnswers as listFounderDiaryAnswers,
  listEscapePatterns as listEscapeVelocityPatterns,
  listImprovementProposals as listGenesisImprovementProposals,
  buildEvolutionLaunchStackProgress,
  buildExecutiveEvolutionBrief,
  buildFounderTimeline,
  listLegacyTimeline,
  listFutureOpportunities,
  buildEvolutionCouncilAgenda,
  computeLaunchStackProgressPercent,
  computePlatformEscapeVelocityScore,
};
