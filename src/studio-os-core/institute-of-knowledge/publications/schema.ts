import type {
  InstitutePublication,
  InstitutePublicationRevision,
  InstitutePublicationStatus,
  InstitutePublicationType,
  InstituteDivisionId,
} from '../types';

export function createPublicationId(type: InstitutePublicationType): string {
  const prefix = type.replace(/-/g, '').slice(0, 4).toUpperCase();
  const stamp = Date.now().toString(36).toUpperCase();
  return `PUB-${prefix}-${stamp}`;
}

export function createRevisionId(): string {
  return `rev-${Date.now().toString(36)}`;
}

export function bumpRevision(current: string): string {
  const parts = current.split('.').map(Number);
  if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
    parts[2] += 1;
    return parts.join('.');
  }
  return `${current}.1`;
}

export function validatePublicationDraft(input: {
  title: string;
  type: InstitutePublicationType;
  summary: string;
  divisionId: InstituteDivisionId;
}): string[] {
  const errors: string[] = [];
  if (!input.title.trim()) errors.push('Title is required.');
  if (!input.summary.trim()) errors.push('Summary is required.');
  if (!input.type) errors.push('Publication type is required.');
  if (!input.divisionId) errors.push('Division is required.');
  return errors;
}

export function buildInitialRevision(
  author: string,
  edition = '1',
  revision = '1.0.0'
): InstitutePublicationRevision {
  const ts = new Date().toISOString();
  return {
    revisionId: createRevisionId(),
    edition,
    revision,
    createdAt: ts,
    author,
    summary: 'Initial publication record.',
    changeNote: 'Created by Institute Publication Engine™.',
  };
}

export function buildPublicationRecord(input: {
  title: string;
  type: InstitutePublicationType;
  divisionId: InstituteDivisionId;
  summary: string;
  author: string;
  status?: InstitutePublicationStatus;
  codexArticleIds?: string[];
  tags?: string[];
}): InstitutePublication {
  const ts = new Date().toISOString();
  const revision = buildInitialRevision(input.author);

  return {
    publicationId: createPublicationId(input.type),
    title: input.title.trim(),
    type: input.type,
    edition: revision.edition,
    revision: revision.revision,
    status: input.status ?? 'Draft',
    divisionId: input.divisionId,
    summary: input.summary.trim(),
    contributors: [input.author],
    approvalHistory: [],
    revisionHistory: [revision],
    relatedPublicationIds: [],
    codexArticleIds: input.codexArticleIds ?? [],
    constitutionalArticleIds: [],
    professionIds: [],
    tags: input.tags ?? [],
    worldGraphNodeId: undefined,
    createdAt: ts,
    updatedAt: ts,
  };
}

export function applyPublicationRevision(
  publication: InstitutePublication,
  input: { author: string; summary: string; changeNote: string; bump?: boolean }
): InstitutePublication {
  const nextRevision = input.bump !== false ? bumpRevision(publication.revision) : publication.revision;
  const revisionEntry: InstitutePublicationRevision = {
    revisionId: createRevisionId(),
    edition: publication.edition,
    revision: nextRevision,
    createdAt: new Date().toISOString(),
    author: input.author,
    summary: input.summary,
    changeNote: input.changeNote,
  };

  const contributors = publication.contributors.includes(input.author)
    ? publication.contributors
    : [...publication.contributors, input.author];

  return {
    ...publication,
    revision: nextRevision,
    contributors,
    revisionHistory: [...publication.revisionHistory, revisionEntry],
    updatedAt: revisionEntry.createdAt,
  };
}

export function setPublicationStatus(
  publication: InstitutePublication,
  status: InstitutePublicationStatus
): InstitutePublication {
  return {
    ...publication,
    status,
    updatedAt: new Date().toISOString(),
  };
}

export function listPublicationsByStatus(
  publications: InstitutePublication[],
  status: InstitutePublicationStatus
): InstitutePublication[] {
  return publications.filter((p) => p.status === status);
}

export function listCanonicalPublications(
  publications: InstitutePublication[]
): InstitutePublication[] {
  return publications.filter((p) => p.status === 'Canonical' || p.status === 'Approved');
}
