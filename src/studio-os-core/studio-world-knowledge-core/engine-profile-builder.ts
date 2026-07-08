import { KNOWLEDGE_CORE_DOMAINS } from './types';
import { PROMPT_STANDARDS } from './entries';
import { listIngestedPromptEntries } from './prompt-memory-ingest';
import { listCanonEntries } from './version-history';
import { buildArchivistLines } from './dock-advisor';
import type { OrganizationKnowledgeCoreProfile } from './types';
import { getAllKnowledgeEntries } from './engine';

export function buildOrganizationKnowledgeCoreProfile(
  organizationId: string
): OrganizationKnowledgeCoreProfile {
  const entries = getAllKnowledgeEntries();
  const ingested = listIngestedPromptEntries();

  return {
    organizationId,
    syncedAt: new Date().toISOString(),
    entryCount: entries.length,
    canonCount: listCanonEntries(entries).length,
    domainCount: KNOWLEDGE_CORE_DOMAINS.length,
    promptStandardCount: PROMPT_STANDARDS.length,
    ingestedPromptCount: ingested.length,
    archivistLines: buildArchivistLines(entries),
  };
}

export function summarizeKnowledgeCore(profile: OrganizationKnowledgeCoreProfile): string {
  return [
    `Knowledge Core™ — ${profile.entryCount} entries across ${profile.domainCount} domains.`,
    `${profile.canonCount} Canon™ · ${profile.promptStandardCount} Prompt Standards™ · ${profile.ingestedPromptCount} ingested prompts.`,
    profile.archivistLines[0] ?? 'Institutional memory operational.',
  ].join(' ');
}
