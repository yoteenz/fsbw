import { getPageKnowledgeForPath } from '../../utils/adminStudioKnowledgeHubDemo';
import { DOCUMENTATION_SYSTEM_REGISTRY } from './system-registry';
import { getNextGettingStartedStep, GETTING_STARTED_PROGRESSION } from './getting-started-progression';
import { searchDocumentationFaq } from './faq-registry';
import { expandSemanticQuery } from './semantic-search';

export type ContextualHelpBundle = {
  moduleId: string;
  moduleTitle: string;
  purpose: string;
  suggestedNextSteps: string[];
  relatedDocumentation: Array<{ label: string; route?: string }>;
  relatedSystems: string[];
  faqMatches: Array<{ question: string; answer: string }>;
  gettingStartedHint?: string;
};

export function resolveContextualHelp(pathname: string, completedPhases: string[] = []): ContextualHelpBundle | null {
  const guide = getPageKnowledgeForPath(pathname);
  if (!guide) return null;

  const sys = DOCUMENTATION_SYSTEM_REGISTRY.find((s) => s.moduleId === guide.moduleId);
  const { relatedSystemIds } = expandSemanticQuery(guide.moduleId.replace(/-/g, ' '));

  const relatedFromSys = sys?.relatedSystems ?? [];
  const allRelated = [...new Set([...relatedFromSys, ...relatedSystemIds])];

  const relatedDocumentation = allRelated
    .slice(0, 5)
    .map((id) => {
      const rel = DOCUMENTATION_SYSTEM_REGISTRY.find((s) => s.id === id);
      return rel ? { label: rel.label, route: rel.route } : null;
    })
    .filter(Boolean) as ContextualHelpBundle['relatedDocumentation'];

  const faqMatches = searchDocumentationFaq(guide.title, 3).map((f) => ({
    question: f.question,
    answer: f.answer,
  }));

  const nextStep = getNextGettingStartedStep(completedPhases);
  const gettingStartedHint = nextStep
    ? `Getting Started next: ${nextStep.title} — ${nextStep.summary}`
    : undefined;

  const suggestedNextSteps = [
    ...(guide.whenToUse.slice(0, 2).map((w) => `When: ${w}`)),
    ...(guide.exampleWorkflows.slice(0, 1)),
    ...(sys?.exampleWorkflows.slice(0, 1) ?? []),
    gettingStartedHint,
  ].filter(Boolean) as string[];

  return {
    moduleId: guide.moduleId,
    moduleTitle: guide.title,
    purpose: guide.purpose,
    suggestedNextSteps,
    relatedDocumentation,
    relatedSystems: allRelated,
    faqMatches,
    gettingStartedHint,
  };
}

export function getGettingStartedWalkthroughStops() {
  return GETTING_STARTED_PROGRESSION.map((step) => ({
    id: step.phase,
    title: step.title,
    purpose: step.summary,
    routeSegment: step.routeSegment,
    order: step.order,
  }));
}
