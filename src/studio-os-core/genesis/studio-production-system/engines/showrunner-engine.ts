import type { XniNarrativeBlueprint } from '../../narrative-intelligence/types';
import type { XpsBlockingIssue } from '../types';

/** Showrunner™ — series / campaign continuity */
export function evaluateShowrunnerContinuity(
  blueprint: XniNarrativeBlueprint,
  priorTopics: string[] = []
): {
  continuityNotes: string[];
  blockingIssues: XpsBlockingIssue[];
} {
  const continuityNotes = [
    `Series thread: ${blueprint.topic}`,
    `Emotional through-line: ${blueprint.desiredEmotion}`,
    `CTA continuity: ${blueprint.cta}`,
  ];

  const blockingIssues: XpsBlockingIssue[] = [];
  const duplicate = priorTopics.some((t) => t.toLowerCase() === blueprint.topic.toLowerCase());
  if (duplicate) {
    blockingIssues.push({
      issueId: 'sr-duplicate',
      departmentId: 'showrunner',
      severity: 'warning',
      summary: 'Similar topic produced recently — audience fatigue risk.',
      recommendation: 'Differentiate hook or repurpose prior production.',
    });
  }

  return { continuityNotes, blockingIssues };
}
