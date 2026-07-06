import { EXPERIENCE_QUESTIONS } from './constants';
import type { ExperienceFinding, ExperiencePageReport, ExperienceQuestionAnswer } from './types';
import { PAGE_SEEDS } from './audit-engine';

function buildVerdict(feelsEffortless: boolean, experienceScore: number): string {
  if (feelsEffortless) {
    return `Effortless experience — ${experienceScore}% Experience Score. Users feel calm, confident, and that this is Studio OS. Optimizes for confidence, not clicks.`;
  }
  return `Experience needs refinement — ${experienceScore}% Experience Score. Software may function, but emotional quality gaps remain. See points of confusion and suggested improvements.`;
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function buildExperiencePageReports(findings: ExperienceFinding[], now: string): ExperiencePageReport[] {
  return PAGE_SEEDS.map((page) => {
    const pageFindings = findings.filter((f) => f.pageId === page.pageId);
    const criticalCount = pageFindings.filter((f) => f.severity === 'critical').length;
    const warningCount = pageFindings.filter((f) => f.severity === 'warning').length;

    const experienceScore = Math.max(44, 95 - criticalCount * 11 - warningCount * 5);
    const clarityScore = Math.max(48, 94 - pageFindings.filter((f) => f.category === 'information-architecture' || f.category === 'executive-clarity').length * 10);
    const emotionalLoad = Math.min(88, 28 + pageFindings.filter((f) => f.category === 'cognitive-load' || f.category === 'decision-fatigue' || f.category === 'emotional-experience').length * 12);
    const learningMinutes = Math.max(3, 8 + pageFindings.filter((f) => f.category === 'learning-curve').length * 4);
    const taskMinutes = Math.max(2, 5 + pageFindings.filter((f) => f.category === 'interaction-friction' || f.category === 'task-completion').length * 3);

    const confusionPoints = pageFindings
      .filter((f) => f.issueType === 'confusion-point' || f.issueType === 'unpredictable-flow' || f.severity === 'critical')
      .map((f) => f.description)
      .slice(0, 4);

    const improvements = pageFindings.slice(0, 4).map((f) => f.suggestedImprovement);
    const feelsEffortless = experienceScore >= 82 && clarityScore >= 80 && criticalCount === 0 && emotionalLoad <= 45;

    return {
      id: `exp-report-${page.pageId}`,
      pageId: page.pageId,
      pageLabel: page.pageLabel,
      route: page.route,
      experienceScore,
      clarityScore,
      emotionalLoad,
      estimatedLearningTime: formatMinutes(learningMinutes),
      estimatedTaskCompletionTime: formatMinutes(taskMinutes),
      pointsOfConfusion: confusionPoints.length > 0 ? confusionPoints : ['No major confusion points detected in latest simulation.'],
      suggestedImprovements: improvements.length > 0 ? improvements : ['Maintain current experience quality — re-simulate after next UX update.'],
      feelsEffortless,
      experienceVerdict: buildVerdict(feelsEffortless, experienceScore),
      findingsCount: pageFindings.length,
      auditedAt: now,
    };
  }).sort((a, b) => a.experienceScore - b.experienceScore);
}

export function buildQuestionAnswers(pageReports: ExperiencePageReport[]): ExperienceQuestionAnswer[] {
  const focus = pageReports.find((r) => !r.feelsEffortless) ?? pageReports[0];
  if (!focus) return [];

  return EXPERIENCE_QUESTIONS.map((question, idx) => {
    const score = Math.max(40, focus.experienceScore - idx * 2 + (focus.feelsEffortless ? 8 : -4));
    const answers: Record<string, string> = {
      'Does this screen feel overwhelming?': focus.emotionalLoad > 50 ? 'Yes — density and competing focal points create overwhelm.' : 'Mostly calm — density within executive threshold.',
      'Is there unnecessary friction?': focus.findingsCount > 2 ? 'Yes — extra navigation steps detected in simulation.' : 'Minimal friction — task paths are reasonably direct.',
      'Can users predict what happens next?': focus.pointsOfConfusion.length > 1 ? 'Partially — unpredictable tab and scroll behavior noted.' : 'Yes — flow is predictable for returning users.',
      'Does this interaction build confidence?': score >= 80 ? 'Yes — clear hierarchy and calm motion build trust.' : 'Not yet — confidence-eroding patterns need refinement.',
      'Is this emotionally calm?': focus.emotionalLoad <= 45 ? 'Yes — calm motion and luxury presentation maintained.' : 'Anxiety detected — rushed rhythm or high cognitive load.',
      'Does this feel premium?': score >= 78 ? 'Yes — glass depth and executive IA feel premium.' : 'Gaps remain — flat panels or mixed typography break premium feel.',
      'Does this respect the user\'s time?': focus.estimatedTaskCompletionTime.includes('8') || focus.estimatedTaskCompletionTime.includes('11') ? 'Partially — excessive scrolling adds time cost.' : 'Yes — priority actions reachable efficiently.',
      'Does this feel like Studio OS?': focus.feelsEffortless ? 'Yes — unmistakably Studio OS in tone, hierarchy, and calm.' : 'Not consistently — design language gaps break identity.',
    };

    return {
      question,
      answer: answers[question] ?? 'Under review in latest Experience QA simulation.',
      score,
      pageId: focus.pageId,
    };
  });
}

export function summarizeExperienceQa(profile: {
  overallExperienceScore: number;
  pagesAudited: number;
  findingsOpen: number;
  pagesNeedingRefinement: number;
  averageEmotionalLoad: number;
}): string {
  return `Experience QA™ ${profile.overallExperienceScore}% overall · ${profile.pagesAudited} pages · ${profile.findingsOpen} findings · ${profile.pagesNeedingRefinement} need refinement · avg emotional load ${profile.averageEmotionalLoad}%.`;
}

export function buildDockExperienceLine(profile: {
  overallExperienceScore: number;
  findingsOpen: number;
  pagesNeedingRefinement: number;
  pageReports: ExperiencePageReport[];
}): string {
  const worst = profile.pageReports.find((p) => !p.feelsEffortless);
  const worstLine = worst ? ` Focus: ${worst.pageLabel} (${worst.experienceScore}% experience).` : '';
  return `Experience QA ${profile.overallExperienceScore}% · ${profile.findingsOpen} findings · ${profile.pagesNeedingRefinement} pages need calm.${worstLine}`;
}

export function explainExperienceFinding(finding: ExperienceFinding): string {
  return `${finding.description} Emotional impact: ${finding.emotionalImpact} Fix: ${finding.suggestedImprovement}`;
}
