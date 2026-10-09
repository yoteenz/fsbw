import type { JournalDocument } from './types';

export const DEVICE_DRAFT_KEY = 'workflow-journal-device-draft-v1';

export type SaveReceipt = {
  persistence: JournalDocument['persistence'];
  label: string;
  savedAt: string;
  durable: boolean;
};

export function deviceSaveReceipt(savedAt: string): SaveReceipt {
  return {
    persistence: 'device',
    label: 'Saved on this device. This is not permanent company storage.',
    savedAt,
    durable: false,
  };
}

export function serverSaveReceipt(kind: JournalDocument['persistence'], savedAt: string): SaveReceipt {
  if (kind === 'durable_server') {
    return {
      persistence: kind,
      label: 'Saved for this organization on the server.',
      savedAt,
      durable: true,
    };
  }
  return {
    persistence: 'process_memory',
    label: 'Saved in this server process only. It will disappear when the process restarts.',
    savedAt,
    durable: false,
  };
}

export function readDeviceDraft(storage: Pick<Storage, 'getItem'>): JournalDocument | null {
  try {
    const raw = storage.getItem(DEVICE_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as JournalDocument;
    if (!parsed?.id || !parsed.organizationId) return null;
    return { ...parsed, persistence: 'device' };
  } catch {
    return null;
  }
}

export function writeDeviceDraft(storage: Pick<Storage, 'setItem'>, doc: JournalDocument): SaveReceipt {
  const savedAt = new Date().toISOString();
  const next = { ...doc, persistence: 'device' as const, updatedAt: savedAt };
  storage.setItem(DEVICE_DRAFT_KEY, JSON.stringify(next));
  return deviceSaveReceipt(savedAt);
}
