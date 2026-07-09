import { buildLaunchStackProgress } from '../../founder-acceptance-testing/launch-stack/progress';
import {
  listImprovementProposals,
  countProposalsByStatus,
} from '../../live-validation-system/genesis-learning/proposal-engine';
import {
  listSystemHealthScores,
  computeOverallSystemHealthAverage,
} from '../../live-validation-system/system-health/health-engine';
import {
  listDiaryAnswers,
  computeDiaryAnswerRate,
} from '../../live-validation-system/founder-diary/diary-engine';
import {
  listEscapePatterns,
  computePlatformEscapeVelocityScore,
} from '../../live-validation-system/escape-velocity/escape-velocity-engine';
import { buildAdoptionSummary } from '../../live-validation-system/adoption/adoption-engine';
import type { ErBriefSection, ErExecutiveEvolutionBrief } from '../types';

function now(): string {
  return new Date().toISOString();
}

function monthLabel(): string {
  return new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

function id(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function buildExecutiveEvolutionBrief(
  founderDisplayName = 'Founder'
): ErExecutiveEvolutionBrief {
  const launchStack = buildLaunchStackProgress();
  const healthScores = listSystemHealthScores();
  const healthAvg = computeOverallSystemHealthAverage();
  const adoption = buildAdoptionSummary();
  const escapePatterns = listEscapePatterns();
  const diaryRate = computeDiaryAnswerRate();
  const proposals = listImprovementProposals();
  const queued = countProposalsByStatus();

  const graduated = launchStack.filter((m) => m.launchStackComplete).length;
  const blocked = launchStack.filter((m) => !m.architecturePass || !m.implementationPass).length;
  const topSystems = adoption.slice(0, 3).map((a) => a.officialName);
  const ignoredSystems = healthScores
    .filter((h) => h.overallHealth < 55)
    .slice(0, 3)
    .map((h) => h.officialName);

  const sections: ErBriefSection[] = [
    {
      sectionId: id('brief'),
      title: 'Major Accomplishments',
      headline: `${graduated} Launch Stack systems ready for graduation review`,
      evidence: launchStack
        .filter((m) => m.overallScore >= 70)
        .slice(0, 4)
        .map((m) => `${m.officialName}: ${m.overallScore}/100 validation score`),
      interpretation: 'Studio OS validation evidence shows meaningful platform maturity this month.',
      recommendation: 'Celebrate wins, then focus council time on blocked systems.',
      founderDecisionNeeded: false,
      sourceSystems: ['founder-acceptance-testing', 'live-validation-system'],
    },
    {
      sectionId: id('brief'),
      title: 'Launch Stack Progress',
      headline: `${launchStack.length} systems tracked · ${blocked} blocked`,
      evidence: launchStack.map(
        (m) =>
          `${m.officialName}: ${m.launchStackComplete ? 'complete' : !m.architecturePass || !m.implementationPass ? 'blocked' : 'advancing'} (${m.overallScore}/100)`
      ),
      interpretation: 'Launch Stack graduation remains the constitutional gate for canon promotion.',
      recommendation: 'Prioritize blocked systems in Genesis Opportunities stage.',
      founderDecisionNeeded: blocked > 0,
      sourceSystems: ['founder-acceptance-testing', 'build-order'],
    },
    {
      sectionId: id('brief'),
      title: 'Company Health',
      headline: `Platform health average: ${healthAvg}/100`,
      evidence: healthScores.slice(0, 5).map((h) => `${h.officialName}: ${h.overallHealth} (${h.trend})`),
      interpretation: 'Health scores synthesize adoption, value, confidence, and escape signals.',
      recommendation: 'Review weak dimensions before next-month priorities.',
      uncertainty: healthScores.length < 3 ? 'Limited system coverage — scores may shift as more systems validate.' : undefined,
      founderDecisionNeeded: healthAvg < 65,
      sourceSystems: ['live-validation-system', 'company-health-index'],
    },
    {
      sectionId: id('brief'),
      title: 'Knowledge & Reflection',
      headline: `Founder diary answer rate: ${diaryRate}%`,
      evidence: listDiaryAnswers(5).map((a) => `"${a.response.slice(0, 80)}…" (${a.sentiments.join(', ')})`),
      interpretation: 'Reflection quality improves Genesis learning and Evolution Council accuracy.',
      recommendation: 'Preserve high-confidence diary insights as knowledge updates.',
      founderDecisionNeeded: diaryRate < 50,
      sourceSystems: ['live-validation-system', 'knowledge-core'],
    },
    {
      sectionId: id('brief'),
      title: 'Systems Used Most',
      headline: topSystems.length ? `Habit leaders: ${topSystems.join(', ')}` : 'Adoption data still forming',
      evidence: adoption.slice(0, 5).map((a) => `${a.officialName}: habit ${a.habitScore}, value ${a.valueScore}`),
      interpretation: 'Voluntary return signals systems becoming dependable operating partners.',
      recommendation: 'Double down on high-habit systems in next-month missions.',
      founderDecisionNeeded: false,
      sourceSystems: ['live-validation-system'],
    },
    {
      sectionId: id('brief'),
      title: 'Systems Ignored',
      headline: ignoredSystems.length ? `Friction signals: ${ignoredSystems.join(', ')}` : 'No critical ignore patterns',
      evidence: ignoredSystems.map((name) => `${name}: health below threshold`),
      interpretation: 'Low adoption may indicate timing, friction, or misaligned expectations.',
      recommendation: 'Discuss whether to improve, defer, or accept boundary.',
      founderDecisionNeeded: ignoredSystems.length > 0,
      sourceSystems: ['live-validation-system'],
    },
    {
      sectionId: id('brief'),
      title: 'Escape Velocity',
      headline: `Escape velocity score: ${computePlatformEscapeVelocityScore()}`,
      evidence: escapePatterns.slice(0, 4).map(
        (p) => `${p.destinationCategory}: ${p.occurrenceCount} escapes → ${p.recommendedOutcome}`
      ),
      interpretation: 'External tool escapes reveal integration and workflow opportunities.',
      recommendation: 'Review integration-need escapes for Genesis proposal candidates.',
      founderDecisionNeeded: escapePatterns.some((p) => p.recommendedOutcome === 'integrate'),
      sourceSystems: ['live-validation-system'],
    },
    {
      sectionId: id('brief'),
      title: 'Genesis Opportunities',
      headline: `${queued.queued + queued['under-review']} proposals awaiting founder review`,
      evidence: proposals.slice(0, 4).map((p) => `${p.title} (${p.status})`),
      interpretation: 'Nothing becomes canon automatically — proposals await Evolution Room review.',
      recommendation: 'Schedule Genesis Review decisions in Founder Decisions stage.',
      founderDecisionNeeded: proposals.length > 0,
      sourceSystems: ['live-validation-system', 'genesis'],
    },
  ];

  const executiveSummary = [
    `${founderDisplayName}, this month's Evolution Room session synthesizes operating evidence across ${launchStack.length} Launch Stack systems.`,
    `Platform health averages ${healthAvg}/100 with ${queued.queued + queued['under-review']} Genesis proposals queued.`,
    blocked > 0
      ? `${blocked} systems remain blocked — council time recommended.`
      : 'No critical Launch Stack blocks detected.',
    'Nothing here becomes canon without your review.',
  ].join(' ');

  return {
    briefId: id('evolution-brief'),
    monthLabel: monthLabel(),
    generatedAt: now(),
    orbGreeting: `Welcome to The Evolution Room, ${founderDisplayName}. I prepared what we learned this month about you, the company, Studio OS, and Genesis. Nothing here becomes canon without your review.`,
    sections,
    executiveSummary,
  };
}
