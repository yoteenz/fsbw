/**
 * Behavioral Constitutional Laws™ — Layer 3 governance.
 * What Studio World may do. Subordinate to Design Principles™ and World Physics™.
 */

export type BehavioralConstitutionalLawId =
  | 'documentation-first'
  | 'canon-promotion'
  | 'no-orphan-objects'
  | 'agent-memory-subordination'
  | 'immutability-of-history'
  | 'scene-assembly-rules'
  | 'knowledge-review'
  | 'repository-governance'
  | 'approval-workflow'
  | 'progressive-presence'
  | 'architecture-decision-records'
  | 'studio-world-knowledge-core';

export type BehavioralConstitutionalLaw = {
  id: BehavioralConstitutionalLawId;
  number: number;
  title: string;
  summary: string;
  enforcement: string;
  physicsBasis: string[];
  principleBasis: string[];
};

export const BEHAVIORAL_CONSTITUTIONAL_LAWS: BehavioralConstitutionalLaw[] = [
  {
    id: 'documentation-first',
    number: 1,
    title: 'Documentation First™',
    summary: 'Graph-first, then prose. Canon and architecture are registered before implementation ships.',
    enforcement: 'No feature claiming canon without World Graph nodes, edges, and ingestion adapter.',
    physicsBasis: ['world-memory', 'knowledge-conservation'],
    principleBasis: ['memory-before-intelligence', 'everything-has-a-home'],
  },
  {
    id: 'canon-promotion',
    number: 2,
    title: 'Canon Promotion™',
    summary: 'Working artifacts graduate through lifecycle — Spark to Approved to Live — never skip to canon.',
    enforcement: 'Lifecycle transitions require provenance; projections cannot self-promote to truth.',
    physicsBasis: ['knowledge-conservation', 'identity-persistence', 'temporal-continuity'],
    principleBasis: ['memory-before-intelligence', 'progressive-disclosure'],
  },
  {
    id: 'no-orphan-objects',
    number: 3,
    title: 'No Orphan Objects™',
    summary: 'Every object must belong somewhere — flagship, wing, room, graph parent, or projection source.',
    enforcement: 'Build fails on dangling edges; Architecture Auditor flags missing physical place.',
    physicsBasis: ['physical-place-law', 'relationship-gravity'],
    principleBasis: ['everything-has-a-home', 'world-first'],
  },
  {
    id: 'agent-memory-subordination',
    number: 4,
    title: 'Agent Memory Subordination™',
    summary: 'Motherboard and agent memory sync summaries into the graph — they do not define canon.',
    enforcement: 'MEMORY.md append-only; graph ingestion is authoritative for civilization memory.',
    physicsBasis: ['world-memory', 'knowledge-conservation'],
    principleBasis: ['memory-before-intelligence'],
  },
  {
    id: 'immutability-of-history',
    number: 5,
    title: 'Immutability of History™',
    summary: 'Historical and legacy nodes are read-only canon. History is never rewritten.',
    enforcement: 'Validator rejects hard deletes; only transition to historical or legacy lifecycle.',
    physicsBasis: ['knowledge-conservation', 'temporal-continuity'],
    principleBasis: ['memory-before-intelligence'],
  },
  {
    id: 'scene-assembly-rules',
    number: 6,
    title: 'Scene Assembly Rules™',
    summary:
      'Scene Assembly composes approved layers at runtime. Approved layers never re-enter generative models.',
    enforcement: 'Scene Stack reference enforcement; single shell ref max; quality guard on export.',
    physicsBasis: ['scene-integrity', 'asset-conservation', 'blueprint-determinism'],
    principleBasis: ['reuse-before-regeneration', 'beauty-through-function'],
  },
  {
    id: 'knowledge-review',
    number: 7,
    title: 'Knowledge Review™',
    summary:
      'Major canon changes pass knowledge review — alignment with graph, physics, and constitution before merge.',
    enforcement: 'Design Review Filter™ + Constitution Review™ for flagship proposals.',
    physicsBasis: ['world-memory', 'relationship-gravity'],
    principleBasis: ['memory-before-intelligence', 'founders-build-worlds'],
  },
  {
    id: 'repository-governance',
    number: 8,
    title: 'Repository Governance™',
    summary:
      'Repository structure, branch policy, and deploy discipline follow Implementation Standards — master-only, one deploy per task.',
    enforcement: 'agent-commit.sh gate; motherboard MEMORY in same commit as code.',
    physicsBasis: ['knowledge-conservation', 'temporal-continuity'],
    principleBasis: ['memory-before-intelligence'],
  },
  {
    id: 'approval-workflow',
    number: 9,
    title: 'Approval Workflow™',
    summary: 'Founder retains final authority. AI recommends, explains, simulates — never auto-approves canon.',
    enforcement: 'Founder Creative Director law; Concierge Approval Flow; no silent canon promotion.',
    physicsBasis: ['identity-persistence', 'temporal-continuity'],
    principleBasis: ['founders-build-worlds', 'progressive-disclosure'],
  },
  {
    id: 'progressive-presence',
    number: 10,
    title: 'Progressive Presence™',
    summary:
      'Article K18 — information earns visibility through founder intent. Architecture first, knowledge second, UI last. The Progressive Presence Engine™ governs all surfaces.',
    enforcement:
      'Every UI element registers Presence Level™, Priority™, and Required Intent™. Components consult the engine — they do not self-decide visibility. Max three Level 1 ambient elements per room.',
    physicsBasis: ['scene-integrity', 'spatial-continuity'],
    principleBasis: ['progressive-disclosure', 'immersion-over-pages', 'beauty-through-function'],
  },
  {
    id: 'architecture-decision-records',
    number: 11,
    title: 'Architecture Decision Records™',
    summary:
      'Article K21 — major architectural decisions preserve why they exist, what alternatives were rejected, and how they shaped Studio World.',
    enforcement:
      'Flagship decisions generate ADR drafts, accepted ADRs become Constitution Hall™ exhibits, and previous ADRs are never deleted.',
    physicsBasis: ['world-memory', 'knowledge-conservation', 'temporal-continuity'],
    principleBasis: ['memory-before-intelligence', 'everything-has-a-home', 'founders-build-worlds'],
  },
  {
    id: 'studio-world-knowledge-core',
    number: 12,
    title: 'Studio World Knowledge Core™',
    summary:
      'Article K22 — Studio World becomes its own memory through canonical domains, statuses, prompt memory, Architect’s Memory™, and searchable knowledge entries.',
    enforcement:
      'Only Canon knowledge may influence future architecture automatically. Every major prompt creates a Knowledge Entry. History is versioned, never overwritten.',
    physicsBasis: ['world-memory', 'knowledge-conservation', 'temporal-continuity', 'relationship-gravity'],
    principleBasis: ['memory-before-intelligence', 'everything-has-a-home', 'world-first'],
  },
];
