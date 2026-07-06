import { KNOWLEDGE_PAGE_GUIDES } from '../../utils/adminStudioKnowledgeHubDemo';
import { DOCUMENTATION_SYSTEM_REGISTRY } from '../documentation-sync/system-registry';
import { searchDocumentationFaq } from '../documentation-sync/faq-registry';
import { OFFICIAL_TERMINOLOGY } from './constants';
import type { TerminologyInconsistency } from './types';

function scanText(text: string, location: string, featureId?: string): TerminologyInconsistency[] {
  const issues: TerminologyInconsistency[] = [];
  const lower = text.toLowerCase();

  for (const [official, banned] of Object.entries(OFFICIAL_TERMINOLOGY)) {
    for (const variant of banned) {
      if (lower.includes(variant.toLowerCase()) && !lower.includes(official.replace(/™/g, '').toLowerCase())) {
        issues.push({
          id: `term-${location}-${variant.replace(/\s+/g, '-')}`,
          officialTerm: official,
          foundVariant: variant,
          location,
          featureId,
          recommendation: `Replace "${variant}" with official term "${official}" unless registered as an alias.`,
        });
      }
    }
  }

  return issues;
}

/** Consistency engine — enforce official Studio OS terminology platform-wide. */
export function scanTerminologyInconsistencies(): TerminologyInconsistency[] {
  const issues: TerminologyInconsistency[] = [];

  for (const guide of KNOWLEDGE_PAGE_GUIDES) {
    const blob = `${guide.title} ${guide.purpose} ${guide.whyItExists} ${guide.whenToUse.join(' ')}`;
    issues.push(...scanText(blob, `Knowledge Hub · ${guide.title}`, guide.moduleId));
  }

  for (const sys of DOCUMENTATION_SYSTEM_REGISTRY) {
    const blob = `${sys.label} ${sys.purpose} ${sys.overview} ${sys.aliases.join(' ')}`;
    issues.push(...scanText(blob, `System Registry · ${sys.label}`, sys.id));
  }

  for (const faq of searchDocumentationFaq('', 50)) {
    issues.push(...scanText(`${faq.question} ${faq.answer}`, `FAQ · ${faq.id}`));
  }

  const seen = new Set<string>();
  return issues.filter((i) => {
    const key = `${i.location}-${i.foundVariant}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function computeConsistencyScore(issues: TerminologyInconsistency[]): number {
  return Math.max(0, Math.min(99, 100 - issues.length * 8));
}
