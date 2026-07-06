import { getOrganizationPromptRegistryProfile } from '../prompt-registry/store';
import type { PromptVersionEntry } from './types';

function versionEntry(
  partial: Pick<
    PromptVersionEntry,
    'versionId' | 'promptId' | 'promptName' | 'version' | 'changedBy' | 'whatChanged' | 'whyChanged' | 'expectedImpact' | 'rollbackOption'
  > &
    Partial<PromptVersionEntry>
): PromptVersionEntry {
  return {
    createdAt: partial.createdAt ?? new Date().toISOString(),
    approvedBy: partial.approvedBy ?? null,
    status: partial.status ?? 'approved',
    ...partial,
  };
}

/** Prompt Versioning™ — permanent version history with Studio Intelligence explanations. */
export function buildPromptVersionHistory(organizationId: string): PromptVersionEntry[] {
  const registry = getOrganizationPromptRegistryProfile(organizationId);
  const registryHistory = registry?.versionHistory ?? [];
  const prompts = registry?.prompts ?? [];

  const enhanced: PromptVersionEntry[] = registryHistory.map((v) =>
    versionEntry({
      versionId: v.versionId,
      promptId: v.promptId,
      promptName: v.promptName,
      version: v.version,
      createdAt: v.createdAt,
      changedBy: v.createdBy,
      whatChanged: v.changeSummary,
      whyChanged: inferWhyChanged(v.changeSummary),
      approvedBy: v.approvedBy ?? null,
      expectedImpact: inferExpectedImpact(v.changeSummary, v.promptId),
      rollbackOption: `Rollback to previous version via Prompt Registry · versionId ${v.promptId}-v${parseVersion(v.version) - 1 || 1}`,
      status: v.status === 'pending-approval' ? 'pending-approval' : v.status === 'draft' ? 'draft' : v.status === 'archived' ? 'archived' : 'approved',
    })
  );

  if (enhanced.length > 0) return enhanced.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return buildSeedVersionHistory(prompts.slice(0, 6));
}

function parseVersion(version: string): number {
  return parseInt(version.split('.')[0] ?? '1', 10) || 1;
}

function inferWhyChanged(changeSummary: string): string {
  if (/dissent|confidence/i.test(changeSummary)) return 'Improve executive decision transparency and trust scoring accuracy.';
  if (/routing|registry/i.test(changeSummary)) return 'Expand module routing coverage as Studio OS platform grows.';
  if (/action item/i.test(changeSummary)) return 'Reduce founder cognitive load with clearer actionable outputs.';
  if (/initial/i.test(changeSummary)) return 'Establish canonical baseline for Prompt Registry governance.';
  return 'Continuous improvement of prompt clarity, safety, and organizational alignment.';
}

function inferExpectedImpact(changeSummary: string, promptId: string): string {
  if (/action item|extraction/i.test(changeSummary)) return 'Clearer actionable outputs with reduced founder cognitive load.';
  if (/routing|registry/i.test(changeSummary)) return 'Broader module routing coverage as Studio OS platform expands.';
  if (/concierge/i.test(promptId)) return 'Improved concierge consistency across all founder interactions.';
  if (/council/i.test(promptId)) return 'Higher-quality executive council synthesis with measurable confidence.';
  if (/profession-brain/i.test(promptId)) return 'Stronger Profession Brain asset — reduced ambiguity in expert voice.';
  if (/automation/i.test(promptId)) return 'More reliable workflow execution with fewer edge-case failures.';
  return 'Improved AI output quality, maintainability, and long-term organizational asset value.';
}

function buildSeedVersionHistory(
  prompts: { promptId: string; name: string; owner?: string }[]
): PromptVersionEntry[] {
  const seeds: PromptVersionEntry[] = [];

  for (const p of prompts) {
    seeds.push(
      versionEntry({
        versionId: `${p.promptId}-v1`,
        promptId: p.promptId,
        promptName: p.name,
        version: '1.0.0',
        changedBy: p.owner ?? 'Platform Governance',
        whatChanged: 'Initial registered version — canonical baseline established.',
        whyChanged: 'Register prompt as mission-critical infrastructure in Prompt Registry.',
        approvedBy: 'Platform Governance',
        expectedImpact: 'Enables versioned, auditable AI behavior for this capability.',
        rollbackOption: 'No prior version — archive prompt to disable capability.',
        status: 'approved',
        createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
      }),
      versionEntry({
        versionId: `${p.promptId}-v2`,
        promptId: p.promptId,
        promptName: p.name,
        version: '2.0.0',
        changedBy: p.owner ?? 'Prompt QA',
        whatChanged: 'Added explicit edge-case handling and Confidence Engine integration.',
        whyChanged: 'Prompt QA audit flagged missing edge cases and hallucination risk.',
        approvedBy: 'Founder',
        expectedImpact: 'Reduced ambiguous outputs · higher estimated AI confidence.',
        rollbackOption: `Rollback to v1.0.0 via Prompt Registry · versionId ${p.promptId}-v1`,
        status: 'approved',
        createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
      })
    );
  }

  if (prompts[0]) {
    seeds.push(
      versionEntry({
        versionId: `${prompts[0].promptId}-v3-draft`,
        promptId: prompts[0].promptId,
        promptName: prompts[0].name,
        version: '3.0.0',
        changedBy: 'Studio Intelligence',
        whatChanged: 'Modularized reasoning chain · extracted sub-prompts for maintainability.',
        whyChanged: 'Prompt QA flagged overly complex prompt structure and scalability concerns.',
        approvedBy: null,
        expectedImpact: 'Improved maintainability and scalability as organization knowledge grows.',
        rollbackOption: `Rollback to v2.0.0 · versionId ${prompts[0].promptId}-v2`,
        status: 'pending-approval',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      })
    );
  }

  return seeds.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getVersionHistoryForPrompt(promptId: string, history: PromptVersionEntry[]): PromptVersionEntry[] {
  return history.filter((v) => v.promptId === promptId).sort((a, b) => b.version.localeCompare(a.version));
}

export function getPendingVersions(history: PromptVersionEntry[]): PromptVersionEntry[] {
  return history.filter((v) => v.status === 'pending-approval');
}
