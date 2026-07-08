/**
 * Behavioral Constitutional Laws™ — governance of what Studio World may do.
 * Distinct from World Physics™ (what is possible) and the eight Foundational Laws (flagship governance).
 */

export type BehavioralConstitutionalLawId =
  | 'documentation-first'
  | 'no-orphan-objects'
  | 'canon-promotion'
  | 'immutability-of-history'
  | 'agent-memory'
  | 'scene-assembly';

export type BehavioralConstitutionalLaw = {
  id: BehavioralConstitutionalLawId;
  number: number;
  title: string;
  summary: string;
  enforcement: string;
  /** Physics laws this constitutional rule implements or respects */
  physicsBasis: string[];
};

export const BEHAVIORAL_CONSTITUTIONAL_LAWS: BehavioralConstitutionalLaw[] = [
  {
    id: 'documentation-first',
    number: 1,
    title: 'Documentation First™',
    summary: 'Graph-first, then prose. Canon and architecture are registered before implementation ships.',
    enforcement: 'No feature claiming canon without World Graph nodes, edges, and ingestion adapter.',
    physicsBasis: ['world-memory', 'knowledge-conservation'],
  },
  {
    id: 'no-orphan-objects',
    number: 2,
    title: 'No Orphan Objects™',
    summary: 'Every object must belong somewhere — flagship, wing, room, graph parent, or projection source.',
    enforcement: 'Build fails on dangling edges; Architecture Auditor flags missing physical place.',
    physicsBasis: ['physical-place-law', 'relationship-gravity'],
  },
  {
    id: 'canon-promotion',
    number: 3,
    title: 'Canon Promotion™',
    summary: 'Working artifacts graduate through lifecycle — Spark to Approved to Live — never skip to canon.',
    enforcement: 'Lifecycle transitions require provenance; projections cannot self-promote to truth.',
    physicsBasis: ['knowledge-conservation', 'identity-persistence', 'temporal-continuity'],
  },
  {
    id: 'immutability-of-history',
    number: 4,
    title: 'Immutability of History™',
    summary: 'Historical and legacy nodes are read-only canon. History is never rewritten.',
    enforcement: 'Validator rejects hard deletes; only transition to historical or legacy lifecycle.',
    physicsBasis: ['knowledge-conservation', 'temporal-continuity'],
  },
  {
    id: 'agent-memory',
    number: 5,
    title: 'Agent Memory™',
    summary: 'Motherboard and agent memory sync summaries into the graph — they do not define canon.',
    enforcement: 'MEMORY.md append-only; graph ingestion is authoritative for civilization memory.',
    physicsBasis: ['world-memory', 'knowledge-conservation'],
  },
  {
    id: 'scene-assembly',
    number: 6,
    title: 'Scene Assembly™',
    summary:
      'Scene Assembly composes approved layers at runtime. Approved layers never re-enter generative models.',
    enforcement: 'Scene Stack reference enforcement; single shell ref max; quality guard on export.',
    physicsBasis: ['scene-integrity', 'asset-conservation', 'blueprint-determinism'],
  },
];
