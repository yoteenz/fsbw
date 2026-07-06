import type { RegistryVersionSnapshot } from './types';
import { getAllRegistryEntries } from './registration';

/** Version history per feature — documentation evolution preserved. */
export function buildVersionHistory(internalId: string): RegistryVersionSnapshot[] {
  const entry = getAllRegistryEntries().find((e) => e.internalId === internalId);
  if (!entry) return [];

  const snapshots: RegistryVersionSnapshot[] = [
    {
      version: entry.version,
      releaseDate: entry.releaseDate,
      summary: `${entry.officialName} — ${entry.purpose}`,
      architectureChanges: entry.architectureDocumentation.slice(0, 2),
      deprecated: entry.status === 'deprecated',
    },
  ];

  if (entry.milestone && entry.milestone !== entry.version) {
    snapshots.unshift({
      version: entry.milestone,
      releaseDate: entry.releaseDate,
      summary: `Initial release — ${entry.officialName}`,
      architectureChanges: [`Introduced ${entry.officialName} to Studio OS`],
      deprecated: false,
    });
  }

  if (entry.futureMilestones.length > 0) {
    for (const future of entry.futureMilestones) {
      snapshots.push({
        version: 'upcoming',
        releaseDate: 'TBD',
        summary: future,
        architectureChanges: [],
        deprecated: false,
      });
    }
  }

  return snapshots;
}

export function listDeprecatedFeatures(): string[] {
  return getAllRegistryEntries().filter((e) => e.status === 'deprecated').map((e) => e.officialName);
}

export function listUpcomingFeatures(): string[] {
  return getAllRegistryEntries()
    .filter((e) => e.status === 'upcoming' || e.futureMilestones.length > 0)
    .flatMap((e) => e.futureMilestones.length > 0 ? e.futureMilestones : [e.officialName]);
}
