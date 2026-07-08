import { KNOWLEDGE_CORE_DOMAINS } from './types';
import { KNOWLEDGE_CORE_ENTRIES, PROMPT_STANDARDS } from './entries';
import { listIngestedPromptEntries } from './prompt-memory-ingest';
import { listPublishedEntries } from '../studio-world-memory-system/canonical-publishing';
import { getApprovalQueue } from '../studio-world-memory-system/founder-review';
import { listKnowledgeDomains } from './domains';

export function getKnowledgeCoreStats() {
  const ingested = listIngestedPromptEntries();
  const published = listPublishedEntries();
  const pendingReview = getApprovalQueue().length;
  const entries = [...KNOWLEDGE_CORE_ENTRIES, ...published];

  return {
    totalEntries: entries.length,
    canonEntries: entries.filter((e) => e.status === 'Canon').length,
    approvedEntries: entries.filter((e) => e.status === 'Approved').length,
    draftEntries: entries.filter((e) => e.status === 'Draft').length,
    experimentalEntries: entries.filter((e) => e.status === 'Experimental').length,
    historicalEntries: entries.filter((e) => e.status === 'Historical' || e.status === 'Archived').length,
    domainCount: KNOWLEDGE_CORE_DOMAINS.length,
    registeredDomainCount: listKnowledgeDomains().length,
    promptStandardCount: PROMPT_STANDARDS.length,
    ingestedPromptCount: ingested.length,
    publishedViaMemorySystem: published.length,
    pendingFounderReview: pendingReview,
  };
}
