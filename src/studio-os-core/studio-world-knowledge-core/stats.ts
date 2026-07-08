import { KNOWLEDGE_CORE_DOMAINS } from './types';
import { KNOWLEDGE_CORE_ENTRIES, PROMPT_STANDARDS } from './entries';
import { listIngestedPromptEntries } from './prompt-memory-ingest';
import { listKnowledgeDomains } from './domains';

export function getKnowledgeCoreStats() {
  const ingested = listIngestedPromptEntries();
  const entries = [...KNOWLEDGE_CORE_ENTRIES, ...ingested];

  return {
    totalEntries: entries.length,
    canonEntries: entries.filter((e) => e.status === 'Canon').length,
    draftEntries: entries.filter((e) => e.status === 'Draft').length,
    experimentalEntries: entries.filter((e) => e.status === 'Experimental').length,
    historicalEntries: entries.filter((e) => e.status === 'Historical' || e.status === 'Archived').length,
    domainCount: KNOWLEDGE_CORE_DOMAINS.length,
    registeredDomainCount: listKnowledgeDomains().length,
    promptStandardCount: PROMPT_STANDARDS.length,
    ingestedPromptCount: ingested.length,
  };
}
