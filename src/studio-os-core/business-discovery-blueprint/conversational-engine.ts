import { getPromptsForChapter } from './chapters';
import type { ConversationalFollowUp, DiscoveryPrompt, OrganizationDiscoveryBlueprint } from './types';

const SHORT_ANSWER_THRESHOLD = 40;

function isPromptApplicable(prompt: DiscoveryPrompt, industryId: string): boolean {
  if (prompt.onlyForIndustries?.length && !prompt.onlyForIndustries.includes(industryId)) return false;
  if (prompt.skipForIndustries?.includes(industryId)) return false;
  return true;
}

export function listApplicablePrompts(
  chapterId: OrganizationDiscoveryBlueprint['currentChapterId'],
  industryId: string
): DiscoveryPrompt[] {
  return getPromptsForChapter(chapterId).filter((p) => isPromptApplicable(p, industryId));
}

export function getNextUnansweredPrompt(
  blueprint: OrganizationDiscoveryBlueprint,
  chapterId: OrganizationDiscoveryBlueprint['currentChapterId']
): DiscoveryPrompt | null {
  const prompts = listApplicablePrompts(chapterId, blueprint.industryId);
  for (const prompt of prompts) {
    const existing = blueprint.responses.find((r) => r.promptId === prompt.id);
    if (!existing?.answer.trim()) return prompt;
  }
  return null;
}

export function listPendingFollowUps(blueprint: OrganizationDiscoveryBlueprint): ConversationalFollowUp[] {
  const followUps: ConversationalFollowUp[] = [];
  for (const prompt of getPromptsForChapter(blueprint.currentChapterId)) {
    if (!isPromptApplicable(prompt, blueprint.industryId)) continue;
    const response = blueprint.responses.find((r) => r.promptId === prompt.id);
    if (!response?.answer.trim() || !prompt.followUpWhenShort) continue;
    if (response.answer.trim().length < SHORT_ANSWER_THRESHOLD) {
      followUps.push({
        promptId: prompt.id,
        question: prompt.followUpWhenShort,
        reason: 'Your answer was brief — Studio OS wants to understand the full story.',
      });
    }
  }
  return followUps;
}

export function buildConversationalIntro(chapterTitle: string, isReturning: boolean): string {
  if (isReturning) {
    return `Welcome back. Let's continue ${chapterTitle} — pick up wherever you left off. Your progress is saved.`;
  }
  return `Let's explore ${chapterTitle}. Tell your organization's story in your own words — this is not a form.`;
}

export function adaptQuestionForIndustry(question: string, industryId: string): string {
  if (industryId === 'creator' || industryId === 'media') {
    return question.replace(/customers/gi, 'audience members');
  }
  if (industryId === 'law' || industryId === 'professional-services') {
    return question.replace(/customers/gi, 'clients');
  }
  if (industryId === 'restaurant' || industryId === 'hospitality') {
    return question.replace(/services/gi, 'offerings');
  }
  return question;
}

export const LIVING_DISCOVERY_PHRASES: RegExp[] = [
  /i forgot to mention/i,
  /i do this differently/i,
  /we(?:'ve|\s+have)\s+changed/i,
  /here(?:'s|\s+is)\s+another\s+service/i,
  /update.*blueprint/i,
  /forgot.*(?:to\s+)?(?:tell|mention|add)/i,
  /things?\s+have\s+changed/i,
  /we\s+added\s+a\s+new/i,
];

export function detectLivingDiscoveryPhrase(input: string): boolean {
  return LIVING_DISCOVERY_PHRASES.some((p) => p.test(input.trim()));
}
