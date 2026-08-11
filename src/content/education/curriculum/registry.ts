import type {
  CurriculumBibleEntry,
  CurriculumOverlapIssue,
  EducationPillar,
} from '../types';
import { getAllSlayTips } from '../catalog';
import { getAllCareLessons } from '../care/catalog';
import { PSA_TODAY_EPISODES } from '../../../content/psa-today';
import { LACE_CURRICULUM_ENTRIES } from './lace/entries';
import { CARE_CURRICULUM_ENTRIES } from './care/entries';

const ALL_ENTRIES: CurriculumBibleEntry[] = [
  ...LACE_CURRICULUM_ENTRIES,
  ...CARE_CURRICULUM_ENTRIES,
];

const byId = new Map(ALL_ENTRIES.map((e) => [e.id, e]));
const byCode = new Map(ALL_ENTRIES.map((e) => [e.curriculumCode, e]));

export function getAllCurriculumBibleEntries(): CurriculumBibleEntry[] {
  return ALL_ENTRIES;
}

export function getCurriculumBibleEntryById(id: string): CurriculumBibleEntry | undefined {
  return byId.get(id);
}

export function getCurriculumBibleEntryByCode(code: string): CurriculumBibleEntry | undefined {
  return byCode.get(code);
}

export function getCurriculumBibleEntriesByPillar(pillar: EducationPillar): CurriculumBibleEntry[] {
  return ALL_ENTRIES.filter((e) => e.pillar === pillar);
}

export function getCurriculumBibleEntriesByStatus(
  status: CurriculumBibleEntry['status']
): CurriculumBibleEntry[] {
  return ALL_ENTRIES.filter((e) => e.status === status);
}

/** Entries with published runtime content linked (for editorial audits — not customer LEARN). */
export function getCurriculumEntriesWithLinkedContent(): CurriculumBibleEntry[] {
  return ALL_ENTRIES.filter((e) => e.linkedContentId);
}

export { LACE_CURRICULUM_ENTRIES, LACE_CURRICULUM_LIFECYCLE } from './lace/entries';
export { CARE_CURRICULUM_ENTRIES, CARE_CURRICULUM_LIFECYCLE } from './care/entries';

function normalizeConcept(c: string): string {
  return c.trim().toLowerCase();
}

function getPsaTodayEpisodeById(id: string) {
  return PSA_TODAY_EPISODES.find((ep) => ep.id === id);
}
function contentRefExists(refId: string): boolean {
  if (byId.has(refId)) return true;
  if (getPsaTodayEpisodeById(refId)) return true;
  if (getAllSlayTips().some((t) => t.id === refId)) return true;
  if (getAllCareLessons().some((l) => l.id === refId)) return true;
  return false;
}

/**
 * Editorial anti-overlap validation — development / admin tooling only.
 */
export function validateCurriculumRegistry(
  entries: CurriculumBibleEntry[] = ALL_ENTRIES
): CurriculumOverlapIssue[] {
  const issues: CurriculumOverlapIssue[] = [];
  const conceptOwners = new Map<string, string[]>();

  const codesSeen = new Map<string, string>();
  for (const entry of entries) {
    const prev = codesSeen.get(entry.curriculumCode);
    if (prev) {
      issues.push({
        kind: 'duplicate-curriculum-code',
        entryId: entry.id,
        curriculumCode: entry.curriculumCode,
        message: `Duplicate curriculum code ${entry.curriculumCode}`,
        details: { alsoUsedBy: prev },
      });
    } else {
      codesSeen.set(entry.curriculumCode, entry.id);
    }

    for (const concept of entry.ownsConcepts) {
      const key = normalizeConcept(concept);
      const owners = conceptOwners.get(key) ?? [];
      owners.push(entry.id);
      conceptOwners.set(key, owners);
    }

    for (const concept of entry.ownsConcepts) {
      const key = normalizeConcept(concept);
      if (entry.excludesConcepts?.some((ex) => normalizeConcept(ex) === key)) {
        issues.push({
          kind: 'own-exclude-conflict',
          entryId: entry.id,
          curriculumCode: entry.curriculumCode,
          message: `Entry both owns and excludes "${concept}"`,
        });
      }
    }

    for (const prereq of entry.prerequisiteContentIds ?? []) {
      if (!byId.has(prereq)) {
        issues.push({
          kind: 'broken-prerequisite',
          entryId: entry.id,
          curriculumCode: entry.curriculumCode,
          message: `Broken prerequisite: ${prereq}`,
        });
      }
    }

    for (const next of entry.recommendedNextIds ?? []) {
      if (!byId.has(next)) {
        issues.push({
          kind: 'broken-related-content',
          entryId: entry.id,
          curriculumCode: entry.curriculumCode,
          message: `Broken recommended-next: ${next}`,
        });
      }
    }

    for (const route of entry.diagnosticRouteIds ?? []) {
      if (!byId.has(route)) {
        issues.push({
          kind: 'broken-related-content',
          entryId: entry.id,
          curriculumCode: entry.curriculumCode,
          message: `Broken diagnostic route: ${route}`,
        });
      }
    }

    for (const tipId of entry.companionSlayTipIds ?? []) {
      if (!getAllSlayTips().some((t) => t.id === tipId)) {
        issues.push({
          kind: 'missing-companion-slay-tip',
          entryId: entry.id,
          curriculumCode: entry.curriculumCode,
          message: `Companion Slay Tip not found: ${tipId}`,
        });
      }
    }

    for (const careId of entry.relatedCareIds ?? []) {
      if (!getAllCareLessons().some((l) => l.id === careId)) {
        issues.push({
          kind: 'missing-related-care',
          entryId: entry.id,
          curriculumCode: entry.curriculumCode,
          message: `Related Care lesson not found: ${careId}`,
        });
      }
    }

    if (entry.linkedContentId && entry.contentType === 'psa-today') {
      if (!getPsaTodayEpisodeById(entry.linkedContentId)) {
        issues.push({
          kind: 'missing-linked-content',
          entryId: entry.id,
          curriculumCode: entry.curriculumCode,
          message: `Linked PSA Today episode not found: ${entry.linkedContentId}`,
        });
      }
    }

    if (entry.contentType === 'care-route' && !(entry.relatedCareIds?.length)) {
      issues.push({
        kind: 'broken-related-content',
        entryId: entry.id,
        curriculumCode: entry.curriculumCode,
        message: 'Care-route entry must specify relatedCareIds',
      });
    }
  }

  for (const [concept, owners] of conceptOwners) {
    if (owners.length > 1) {
      issues.push({
        kind: 'duplicate-ownership',
        entryId: owners[0],
        curriculumCode: byId.get(owners[0])?.curriculumCode ?? '',
        message: `Concept "${concept}" owned by multiple entries`,
        details: { owners },
      });
    }
  }

  return issues;
}

/** Resolve all content refs for an entry (prereqs, routes, related). */
export function resolveCurriculumContentRefs(entry: CurriculumBibleEntry): string[] {
  const ids = new Set<string>();
  for (const id of entry.prerequisiteContentIds ?? []) ids.add(id);
  for (const id of entry.recommendedNextIds ?? []) ids.add(id);
  for (const id of entry.diagnosticRouteIds ?? []) ids.add(id);
  for (const id of entry.relatedPSAEpisodeIds ?? []) ids.add(id);
  for (const id of entry.relatedCareIds ?? []) ids.add(id);
  for (const id of entry.companionSlayTipIds ?? []) ids.add(id);
  if (entry.linkedContentId) ids.add(entry.linkedContentId);
  return [...ids];
}

export function curriculumRefLabel(refId: string): string {
  const bible = byId.get(refId);
  if (bible) return `${bible.curriculumCode} · ${bible.title}`;
  const ep = getPsaTodayEpisodeById(refId);
  if (ep) return `PSA · ${ep.title}`;
  const tip = getAllSlayTips().find((t) => t.id === refId);
  if (tip) {
    const label = tip.publicTitle?.trim() || tip.cardTitle?.trim() || tip.title.trim();
    return `SLAY TIP · ${label}`;
  }
  const care = getAllCareLessons().find((l) => l.id === refId);
  if (care) return `CARE · ${care.title}`;
  return refId;
}

export function contentRefExistsForCurriculum(refId: string): boolean {
  return contentRefExists(refId);
}
