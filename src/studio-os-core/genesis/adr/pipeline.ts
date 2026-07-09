import { mutateGenesisStore, readGenesisStore } from '../persistence/store';
import { createGenesisObject } from '../objects/factory';
import { getGenesisProposal } from '../proposals/pipeline';
import type { GenesisAdr, GenesisAdrOption } from '../types';

function now(): string {
  return new Date().toISOString();
}

function createAdrId(): string {
  return `adr-${Date.now().toString(36)}`;
}

export function listGenesisAdrs(): GenesisAdr[] {
  return readGenesisStore().adrs;
}

export function getGenesisAdr(adrId: string): GenesisAdr | undefined {
  return readGenesisStore().adrs.find((a) => a.adrId === adrId);
}

/** ADR Pipeline™ — architecture decisions derived from Genesis context. */
export function createGenesisAdr(input: {
  title: string;
  author: string;
  decisionContext: string;
  optionsConsidered: GenesisAdrOption[];
  decision: string;
  consequences: string[];
  proposalId?: string;
  supersedesAdrIds?: string[];
}): GenesisAdr {
  const object = createGenesisObject({
    type: 'adr',
    title: input.title,
    category: 'Architecture Decision',
    author: input.author,
    slug: input.title,
    summary: input.decision,
    pipelineStage: 'adr',
    tags: ['genesis-adr'],
    payload: {
      decisionContext: input.decisionContext,
      optionsConsidered: input.optionsConsidered,
      decision: input.decision,
      consequences: input.consequences,
    },
  });

  const adr: GenesisAdr = {
    adrId: createAdrId(),
    objectId: object.objectId,
    proposalId: input.proposalId,
    title: input.title.trim(),
    decisionContext: input.decisionContext.trim(),
    optionsConsidered: input.optionsConsidered,
    decision: input.decision.trim(),
    consequences: input.consequences,
    supersedesAdrIds: input.supersedesAdrIds ?? [],
    status: 'draft',
    author: input.author,
    createdAt: now(),
    updatedAt: now(),
  };

  mutateGenesisStore((store) => ({
    ...store,
    adrs: [...store.adrs, adr],
  }));

  return adr;
}

export function createAdrFromProposal(
  proposalId: string,
  input: Omit<Parameters<typeof createGenesisAdr>[0], 'proposalId'>
): GenesisAdr | undefined {
  const proposal = getGenesisProposal(proposalId);
  if (!proposal || proposal.status === 'rejected') return undefined;

  return createGenesisAdr({
    ...input,
    proposalId,
  });
}

export function acceptGenesisAdr(adrId: string): GenesisAdr | undefined {
  let updated: GenesisAdr | undefined;

  mutateGenesisStore((store) => {
    const idx = store.adrs.findIndex((a) => a.adrId === adrId);
    if (idx < 0) return store;

    updated = {
      ...store.adrs[idx],
      status: 'accepted',
      updatedAt: now(),
    };

    const adrs = [...store.adrs];
    adrs[idx] = updated;

    const objects = store.objects.map((obj) =>
      obj.objectId === updated!.objectId
        ? { ...obj, status: 'approved' as const, pipelineStage: 'adr' as const, updatedAt: now() }
        : obj
    );

    return { ...store, adrs, objects };
  });

  return updated;
}

export function supersedeGenesisAdr(adrId: string, successorAdrId: string): GenesisAdr | undefined {
  let updated: GenesisAdr | undefined;

  mutateGenesisStore((store) => {
    const idx = store.adrs.findIndex((a) => a.adrId === adrId);
    if (idx < 0) return store;

    updated = {
      ...store.adrs[idx],
      status: 'superseded',
      updatedAt: now(),
    };

    const adrs = [...store.adrs];
    adrs[idx] = updated;
    return { ...store, adrs };
  });

  if (updated) {
    mutateGenesisStore((store) => ({
      ...store,
      adrs: store.adrs.map((a) =>
        a.adrId === successorAdrId
          ? { ...a, supersedesAdrIds: [...a.supersedesAdrIds, adrId], updatedAt: now() }
          : a
      ),
    }));
  }

  return updated;
}
