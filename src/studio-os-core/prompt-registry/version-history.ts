import { buildPromptCatalog } from './prompt-catalog';
import type { PromptVersionComparison, PromptVersionRecord } from './types';

function versionRecord(
  partial: Pick<
    PromptVersionRecord,
    'versionId' | 'promptId' | 'promptName' | 'version' | 'createdBy' | 'changeSummary' | 'contentPreview'
  > &
    Partial<PromptVersionRecord>
): PromptVersionRecord {
  const now = new Date();
  return {
    createdAt: partial.createdAt ?? now.toISOString(),
    status: partial.status ?? 'approved',
    ...partial,
  };
}

/** Seed version history — nothing overwritten; complete prompt evolution. */
export function buildSeedVersionHistory(): PromptVersionRecord[] {
  const catalog = buildPromptCatalog();
  const records: PromptVersionRecord[] = [];

  for (const p of catalog.slice(0, 8)) {
    records.push(
      versionRecord({
        versionId: `${p.promptId}-v1`,
        promptId: p.promptId,
        promptName: p.name,
        version: '1.0.0',
        createdBy: p.owner,
        changeSummary: 'Initial registered version',
        contentPreview: `You are ${p.owner}. ${p.purpose.slice(0, 80)}…`,
        status: 'approved',
        approvedBy: 'Platform Governance',
        approvedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      })
    );
  }

  const council = catalog.find((p) => p.promptId === 'executive-council.meeting-synthesis');
  if (council) {
    records.push(
      versionRecord({
        versionId: 'executive-council.meeting-synthesis-v5',
        promptId: council.promptId,
        promptName: council.name,
        version: '5.0.0',
        createdBy: 'Executive Council',
        changeSummary: 'Added dissent tracking and confidence scoring',
        contentPreview: 'Synthesize council deliberations. Include consensus score and dissent notes…',
        status: 'approved',
        approvedBy: 'Founder',
        approvedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
      }),
      versionRecord({
        versionId: 'executive-council.meeting-synthesis-v6',
        promptId: council.promptId,
        promptName: council.name,
        version: '6.0.0',
        createdBy: 'Executive Council',
        changeSummary: 'Improved action item extraction and founder voice alignment',
        contentPreview: 'Synthesize council output. Extract action items with owners and deadlines…',
        status: 'pending-approval',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      })
    );
  }

  const dock = catalog.find((p) => p.promptId === 'command-dock.intent-routing');
  if (dock) {
    records.push(
      versionRecord({
        versionId: 'command-dock.intent-routing-v2',
        promptId: dock.promptId,
        promptName: dock.name,
        version: '2.0.0',
        createdBy: 'Command Dock',
        changeSummary: 'Added Prompt Registry and Automation Registry routing',
        contentPreview: 'Route founder commands. Priority: Prompt Registry → Automation Registry → Event Bus…',
        status: 'approved',
        approvedBy: 'Platform Governance',
        approvedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      })
    );
  }

  return records.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getVersionHistoryForPrompt(promptId: string, history: PromptVersionRecord[]): PromptVersionRecord[] {
  return history.filter((v) => v.promptId === promptId).sort((a, b) => b.version.localeCompare(a.version));
}

export function comparePromptVersions(
  promptId: string,
  versionA: string,
  versionB: string,
  history: PromptVersionRecord[]
): PromptVersionComparison | null {
  const a = history.find((v) => v.promptId === promptId && v.version === versionA);
  const b = history.find((v) => v.promptId === promptId && v.version === versionB);
  if (!a || !b) return null;

  return {
    promptId,
    promptName: a.promptName,
    versionA,
    versionB,
    summary: `${a.changeSummary} → ${b.changeSummary}`,
    qualityDeltaPct: versionB > versionA ? 4 : -2,
    latencyDeltaMs: versionB > versionA ? -45 : 12,
    tokenDelta: versionB > versionA ? -120 : 80,
  };
}

export function filterVersionsChangedThisMonth(history: PromptVersionRecord[]): PromptVersionRecord[] {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  return history.filter((v) => new Date(v.createdAt) >= monthStart);
}

export function filterPendingApprovalVersions(history: PromptVersionRecord[]): PromptVersionRecord[] {
  return history.filter((v) => v.status === 'pending-approval');
}
