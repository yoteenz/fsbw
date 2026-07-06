import { MANUAL_DOCUMENT_LABELS, SYNC_TRIGGER_LABELS, SYNC_TRIGGER_TYPES } from './constants';
import type { LiveSyncEvent, SyncTriggerType } from './types';

function now(offsetMinutes = 0): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - offsetMinutes);
  return d.toISOString();
}

const SYNC_DESCRIPTIONS: Record<SyncTriggerType, (count: number) => string> = {
  departments: (n) => `Department pack changes synced ${n} department guide section${n === 1 ? '' : 's'}.`,
  policies: (n) => `Policy library updated — ${n} procedure${n === 1 ? '' : 's'} reflect new professional scope.`,
  'profession-brain': (n) => `Profession Brain™ evolved — ${n} knowledge section${n === 1 ? '' : 's'} regenerated.`,
  automation: (n) => `Automation documentation refreshed — ${n} Shadow Mode rule${n === 1 ? '' : 's'} documented.`,
  training: (n) => `Training paths synchronized — ${n} Studio Institute module${n === 1 ? '' : 's'} updated.`,
  knowledge: (n) => `Knowledge expanded — ${n} article${n === 1 ? '' : 's'} added to Operating Manual.`,
};

export function buildLiveSyncEvents(organizationId: string, documentCount: number): LiveSyncEvent[] {
  const sectionsPerTrigger = Math.max(1, Math.floor(documentCount / SYNC_TRIGGER_TYPES.length));

  return SYNC_TRIGGER_TYPES.map((trigger, index) => ({
    id: `sync-${organizationId}-${trigger}`,
    trigger,
    label: SYNC_TRIGGER_LABELS[trigger],
    description: SYNC_DESCRIPTIONS[trigger](sectionsPerTrigger + (index % 2)),
    documentsUpdated: [
      MANUAL_DOCUMENT_LABELS[getDocTypeForTrigger(trigger)],
      ...(trigger === 'policies' ? [MANUAL_DOCUMENT_LABELS['standard-operating-procedures']] : []),
      ...(trigger === 'profession-brain' ? [MANUAL_DOCUMENT_LABELS['profession-brain-summaries']] : []),
    ],
    occurredAt: now(index * 45),
  }));
}

function getDocTypeForTrigger(trigger: SyncTriggerType): keyof typeof MANUAL_DOCUMENT_LABELS {
  switch (trigger) {
    case 'departments':
      return 'department-guides';
    case 'policies':
      return 'policy-library';
    case 'profession-brain':
      return 'profession-brain-summaries';
    case 'automation':
      return 'automation-documentation';
    case 'training':
      return 'training-paths';
    case 'knowledge':
      return 'knowledge-articles';
  }
}

export function summarizeLiveSynchronization(events: LiveSyncEvent[]): string {
  const recent = events.length;
  return `${recent} sync triggers active — manual updates automatically when departments, policies, brains, automation, training, or knowledge change. No outdated information.`;
}
