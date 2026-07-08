import { mutateInstituteStore, readInstituteStore } from '../persistence/store';
import type { ChronicleEntry, InstituteDivisionId } from '../types';

function now(): string {
  return new Date().toISOString();
}

export function listChronicleEntries(): ChronicleEntry[] {
  return readInstituteStore().chronicle.sort(
    (a, b) => new Date(b.eventAt).getTime() - new Date(a.eventAt).getTime()
  );
}

export function recordChronicleEvent(input: {
  title: string;
  summary: string;
  eventAt?: string;
  publicationIds?: string[];
  codexArticleIds?: string[];
  tags?: string[];
  divisionId?: InstituteDivisionId;
}): ChronicleEntry {
  const entry: ChronicleEntry = {
    entryId: `chronicle-${Date.now().toString(36)}`,
    title: input.title.trim(),
    summary: input.summary.trim(),
    eventAt: input.eventAt ?? now(),
    recordedAt: now(),
    publicationIds: input.publicationIds ?? [],
    codexArticleIds: input.codexArticleIds ?? [],
    tags: input.tags ?? [],
    divisionId: input.divisionId ?? 'world-chronicle',
  };

  mutateInstituteStore((store) => ({
    ...store,
    chronicle: [...store.chronicle, entry],
  }));

  return entry;
}

export function getChronicleTimelineByTag(tag: string): ChronicleEntry[] {
  return listChronicleEntries().filter((e) => e.tags.includes(tag));
}
