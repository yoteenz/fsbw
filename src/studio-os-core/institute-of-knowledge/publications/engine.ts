import { mutateInstituteStore, readInstituteStore } from '../persistence/store';
import {
  applyPublicationRevision,
  buildPublicationRecord,
  setPublicationStatus,
  validatePublicationDraft,
} from './schema';
import type {
  InstituteApprovalRecord,
  InstitutePublication,
  InstitutePublicationRelationship,
  InstitutePublicationStatus,
  InstitutePublicationType,
  InstituteDivisionId,
  InstituteRelationshipType,
} from '../types';

function now(): string {
  return new Date().toISOString();
}

export function listInstitutePublications(): InstitutePublication[] {
  return readInstituteStore().publications;
}

export function getInstitutePublication(publicationId: string): InstitutePublication | undefined {
  return readInstituteStore().publications.find((p) => p.publicationId === publicationId);
}

export function createInstitutePublication(input: {
  title: string;
  type: InstitutePublicationType;
  divisionId: InstituteDivisionId;
  summary: string;
  author: string;
  status?: InstitutePublicationStatus;
  codexArticleIds?: string[];
  tags?: string[];
}): InstitutePublication {
  const errors = validatePublicationDraft(input);
  if (errors.length) throw new Error(errors.join(' '));

  const publication = buildPublicationRecord(input);

  mutateInstituteStore((store) => ({
    ...store,
    publications: [...store.publications, publication],
  }));

  return publication;
}

export function reviseInstitutePublication(
  publicationId: string,
  input: { author: string; summary: string; changeNote: string }
): InstitutePublication | undefined {
  let updated: InstitutePublication | undefined;

  mutateInstituteStore((store) => {
    const idx = store.publications.findIndex((p) => p.publicationId === publicationId);
    if (idx < 0) return store;
    updated = applyPublicationRevision(store.publications[idx], input);
    const publications = [...store.publications];
    publications[idx] = updated;
    return { ...store, publications };
  });

  return updated;
}

export function updateInstitutePublicationStatus(
  publicationId: string,
  status: InstitutePublicationStatus,
  approval: Omit<InstituteApprovalRecord, 'recordId' | 'createdAt'>
): InstitutePublication | undefined {
  let updated: InstitutePublication | undefined;

  mutateInstituteStore((store) => {
    const idx = store.publications.findIndex((p) => p.publicationId === publicationId);
    if (idx < 0) return store;

    const current = store.publications[idx];
    const record: InstituteApprovalRecord = {
      ...approval,
      recordId: `apr-${Date.now().toString(36)}`,
      createdAt: now(),
    };

    updated = {
      ...setPublicationStatus(current, status),
      approvalHistory: [...current.approvalHistory, record],
    };

    const publications = [...store.publications];
    publications[idx] = updated;
    return { ...store, publications };
  });

  return updated;
}

export function addInstitutePublicationRelationship(input: {
  fromPublicationId: string;
  toPublicationId: string;
  type: InstituteRelationshipType;
  label?: string;
}): InstitutePublicationRelationship {
  const relationship: InstitutePublicationRelationship = {
    id: `rel-${input.fromPublicationId}-${input.toPublicationId}-${Date.now().toString(36)}`,
    fromPublicationId: input.fromPublicationId,
    toPublicationId: input.toPublicationId,
    type: input.type,
    label: input.label,
    createdAt: now(),
  };

  mutateInstituteStore((store) => ({
    ...store,
    relationships: [...store.relationships, relationship],
  }));

  return relationship;
}

export function listInstituteRelationships(): InstitutePublicationRelationship[] {
  return readInstituteStore().relationships;
}

export function listRelationshipsForPublication(
  publicationId: string
): InstitutePublicationRelationship[] {
  const store = readInstituteStore();
  return store.relationships.filter(
    (r) => r.fromPublicationId === publicationId || r.toPublicationId === publicationId
  );
}

export function findRelatedPublicationIds(publicationId: string): string[] {
  const rels = listRelationshipsForPublication(publicationId);
  const ids = new Set<string>();
  for (const rel of rels) {
    if (rel.fromPublicationId !== publicationId) ids.add(rel.fromPublicationId);
    if (rel.toPublicationId !== publicationId) ids.add(rel.toPublicationId);
  }
  return [...ids];
}

export function getInstitutePublicationGraphNeighbors(publicationId: string): InstitutePublication[] {
  const relatedIds = findRelatedPublicationIds(publicationId);
  return relatedIds
    .map((id) => getInstitutePublication(id))
    .filter((p): p is InstitutePublication => Boolean(p));
}
