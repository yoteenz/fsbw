import { summarizeDocumentationSync } from './sync-engine';
import { searchDocumentationFaq } from './faq-registry';
import { expandSemanticQuery } from './semantic-search';
import { getDocumentationSystem } from './system-registry';
import { ensureOrganizationDocumentationSyncProfile, getOrganizationDocumentationSyncProfile } from './store';
import type { DocumentationSyncDockAdvice } from './types';

export function resolveDocumentationSyncAdvice(
  input: string,
  organizationId: string
): DocumentationSyncDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationDocumentationSyncProfile(organizationId) ??
    ensureOrganizationDocumentationSyncProfile(organizationId);

  if (/documentation sync|sync documentation|help center|knowledge base|studio manual|getting started guide/i.test(trimmed)) {
    return {
      response: summarizeDocumentationSync(profile),
      concierge: 'Chief Concierge',
      syncScore: profile.syncScore,
    };
  }

  if (/how do i get started|onboarding|first time|where do i start/i.test(trimmed)) {
    const faq = searchDocumentationFaq('getting started', 1)[0];
    return {
      response: faq?.answer ?? summarizeDocumentationSync(profile),
      concierge: 'Chief Concierge',
    };
  }

  if (/search documentation|find help|semantic search|related concepts/i.test(trimmed)) {
    const { relatedSystemIds } = expandSemanticQuery(trimmed);
    const labels = relatedSystemIds
      .slice(0, 5)
      .map((id) => getDocumentationSystem(id)?.label)
      .filter(Boolean);
    return {
      response: `Semantic search active — ${profile.searchClusters} concept clusters. Related: ${labels.join(', ') || 'try "memory" or "AI"'}.`,
      concierge: 'Chief Concierge',
      syncScore: profile.syncScore,
    };
  }

  if (/faq|frequently asked|common questions/i.test(trimmed)) {
    const faqs = searchDocumentationFaq(trimmed, 3);
    return {
      response: faqs.map((f) => `${f.question} — ${f.answer.slice(0, 80)}…`).join(' ') || summarizeDocumentationSync(profile),
      concierge: 'Chief Concierge',
    };
  }

  return null;
}

export function listDocumentationSyncDockSuggestions(_organizationId: string): string[] {
  return [
    'How do I get started with Studio OS?',
    'Explain Documentation Synchronization and the help system.',
    'What is the difference between Memory Engine and Legacy Vault?',
    'How does documentation stay synchronized?',
  ].slice(0, 4);
}

export function buildProactiveDocumentationSyncSuggestion(organizationId: string): string | null {
  const profile = getOrganizationDocumentationSyncProfile(organizationId);
  if (!profile) return null;
  return summarizeDocumentationSync(profile);
}

export function buildDocumentationSyncOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationDocumentationSyncProfile(organizationId);
  return profile.dockDocumentationLine;
}
