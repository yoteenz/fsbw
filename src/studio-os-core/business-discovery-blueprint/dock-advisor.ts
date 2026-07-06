import { LIVING_DISCOVERY_PROMPT } from './constants';
import { getChapterDefinition } from './chapters';
import { detectLivingDiscoveryPhrase } from './conversational-engine';
import { recommendNextChapter } from './progress';
import {
  ensureOrganizationDiscoveryBlueprint,
  processLivingDiscoveryInput,
} from './store';
import type { LivingDiscoveryAdvice } from './types';

const UPDATE_CHAPTER_PATTERNS: Array<{ patterns: RegExp[]; chapterId: LivingDiscoveryAdvice['recommendedChapterId'] }> = [
  { patterns: [/another\s+service/i, /new\s+service/i], chapterId: 'services' },
  { patterns: [/customer/i, /support/i, /faq/i], chapterId: 'customers' },
  { patterns: [/hire|hiring|team|people|role/i], chapterId: 'people' },
  { patterns: [/grow|expansion|future|vision/i], chapterId: 'growth' },
  { patterns: [/decision|judgment|rule/i], chapterId: 'decision-intelligence' },
  { patterns: [/document|form|template|upload/i], chapterId: 'resources' },
  { patterns: [/mission|vision|identity|who we are/i], chapterId: 'organization-identity' },
  { patterns: [/my day|founder|only i know/i], chapterId: 'founder-brain' },
  { patterns: [/lesson|wisdom|advice|story/i], chapterId: 'knowledge-wisdom' },
];

export function resolveLivingDiscoveryAdvice(
  input: string,
  organizationId: string
): LivingDiscoveryAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (/business discovery|discovery blueprint|organizational archaeology/i.test(trimmed)) {
    const blueprint = ensureOrganizationDiscoveryBlueprint(organizationId);
    const next = getChapterDefinition(blueprint.recommendedNextChapterId);
    return {
      response: `Business Discovery Blueprint · ${blueprint.overallProgressPct}% preserved. Recommended next chapter: ${next.title}. The organization teaches Studio OS once — Studio OS remembers forever.`,
      concierge: 'Chief Concierge',
      suggestedCommand: `Continue ${next.title}.`,
      recommendedChapterId: blueprint.recommendedNextChapterId,
    };
  }

  if (!detectLivingDiscoveryPhrase(trimmed)) return null;

  processLivingDiscoveryInput(organizationId, trimmed);
  const blueprint = ensureOrganizationDiscoveryBlueprint(organizationId);
  let recommendedChapterId = recommendNextChapter(blueprint);

  for (const rule of UPDATE_CHAPTER_PATTERNS) {
    if (rule.patterns.some((p) => p.test(trimmed))) {
      recommendedChapterId = rule.chapterId ?? recommendedChapterId;
      break;
    }
  }

  const chapter = getChapterDefinition(recommendedChapterId!);
  return {
    response: `${LIVING_DISCOVERY_PROMPT} Your organizational memory evolves — let's update ${chapter.title}.`,
    concierge: 'Chief Concierge',
    suggestedCommand: `Open Business Discovery Blueprint · ${chapter.title}.`,
    recommendedChapterId,
  };
}

export function buildProactiveDiscoverySuggestion(organizationId: string): LivingDiscoveryAdvice | null {
  const blueprint = ensureOrganizationDiscoveryBlueprint(organizationId);
  if (blueprint.overallProgressPct >= 100) {
    return {
      response: 'Your Business Discovery Blueprint is foundational. Remember — it never finishes. Say "I forgot to mention…" anytime to evolve organizational memory.',
      concierge: 'Chief Concierge',
      suggestedCommand: 'Review Business Discovery Blueprint outputs.',
    };
  }
  const next = getChapterDefinition(blueprint.recommendedNextChapterId);
  return {
    response: `Business Discovery Blueprint · ${blueprint.overallProgressPct}% complete. Continue ${next.title} when you are ready — progress saves automatically.`,
    concierge: 'Chief Concierge',
    suggestedCommand: `Continue ${next.title}.`,
    recommendedChapterId: blueprint.recommendedNextChapterId,
  };
}

export function listDiscoveryDockSuggestions(organizationId: string): string[] {
  const blueprint = ensureOrganizationDiscoveryBlueprint(organizationId);
  const next = getChapterDefinition(blueprint.recommendedNextChapterId);
  return [
    `Continue Business Discovery Blueprint · ${next.title}.`,
    'I forgot to mention something about our services.',
    `What has the Blueprint generated so far? (${blueprint.generatedOutputs.length} outputs)`,
  ];
}
