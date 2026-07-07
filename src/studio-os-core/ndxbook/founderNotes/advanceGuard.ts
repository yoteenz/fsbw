import { hasBlockingFounderNotes, listFounderNotes, countBlockingFounderNotes } from './store';

export function buildAdvanceGuardMessage(assetId: string): string | null {
  const count = countBlockingFounderNotes(assetId);
  if (count === 0) return null;
  const open = listFounderNotes(assetId).filter((n) => !['resolved', 'deferred'].includes(n.status));
  const labels = open.slice(0, 2).map((n) => n.body.slice(0, 48));
  const suffix = open.length > 2 ? ` (+${open.length - 2} more)` : '';
  return `${count} unresolved founder note${count === 1 ? '' : 's'} — resolve, defer, or review revisions before advancing.${labels.length ? ` · ${labels.join(' · ')}${suffix}` : ''}`;
}

export function canAdvanceWithFounderNotes(assetId: string): { ok: boolean; reason?: string } {
  if (hasBlockingFounderNotes(assetId)) {
    return { ok: false, reason: buildAdvanceGuardMessage(assetId) ?? 'Unresolved founder notes block advancement.' };
  }
  return { ok: true };
}
