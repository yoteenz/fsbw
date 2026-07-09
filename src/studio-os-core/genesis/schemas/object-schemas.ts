import type { GenesisObjectType } from '../types';

/** Object-specific schema metadata — infrastructure only, no content seeds. */
export const GENESIS_OBJECT_SCHEMA_REGISTRY: Record<
  GenesisObjectType,
  { label: string; description: string; requiredPayloadFields: string[] }
> = {
  system: {
    label: 'System',
    description: 'Operational capability or platform subsystem.',
    requiredPayloadFields: ['category', 'capabilities'],
  },
  institution: {
    label: 'Institution',
    description: 'Permanent organization with authority or stewardship.',
    requiredPayloadFields: ['authority', 'charter'],
  },
  principle: {
    label: 'Principle',
    description: 'Foundational belief or constitutional law.',
    requiredPayloadFields: ['doctrine', 'constitutionalWeight'],
  },
  article: {
    label: 'Article',
    description: 'Atomic canonical truth unit.',
    requiredPayloadFields: ['thesis', 'guidingPrinciples'],
  },
  profession: {
    label: 'Profession',
    description: 'Career domain with knowledge and progression.',
    requiredPayloadFields: ['industry'],
  },
  department: {
    label: 'Department',
    description: 'Organizational or spatial unit.',
    requiredPayloadFields: ['mandate'],
  },
  workflow: {
    label: 'Workflow',
    description: 'Repeatable operational sequence.',
    requiredPayloadFields: ['trigger', 'steps'],
  },
  capability: {
    label: 'Capability',
    description: 'Discrete reusable function.',
    requiredPayloadFields: ['inputs', 'outputs'],
  },
  'world-entity': {
    label: 'World Entity',
    description: 'Canonical person, place, organization, or world construct.',
    requiredPayloadFields: ['entityKind'],
  },
  'ui-component': {
    label: 'UI Component',
    description: 'Reusable interface component.',
    requiredPayloadFields: ['componentKind'],
  },
  event: {
    label: 'Event',
    description: 'Historical or operational timeline event.',
    requiredPayloadFields: ['eventKind', 'occurredAt'],
  },
  registry: {
    label: 'Registry',
    description: 'Canonical directory of objects or systems.',
    requiredPayloadFields: ['registeredType'],
  },
  policy: {
    label: 'Policy',
    description: 'Rule with enforcement expectations.',
    requiredPayloadFields: ['policyLevel', 'rule'],
  },
  mission: {
    label: 'Mission',
    description: 'Goal, objective, or company directive.',
    requiredPayloadFields: ['objective'],
  },
  'hero-object': {
    label: 'Hero Object',
    description: 'High-symbolism object with narrative or operational power.',
    requiredPayloadFields: ['symbolicMeaning'],
  },
  'expansion-pack': {
    label: 'Expansion Pack',
    description: 'Additive domain package extending a collection.',
    requiredPayloadFields: ['extendsCollectionId'],
  },
  'research-paper': {
    label: 'Research Paper',
    description: 'Institute-governed knowledge artifact.',
    requiredPayloadFields: ['abstract', 'researchQuestion'],
  },
  specification: {
    label: 'Specification',
    description: 'Engineering, API, SDK, or design contract.',
    requiredPayloadFields: ['specKind', 'normativeStatements'],
  },
  implementation: {
    label: 'Implementation',
    description: 'Code, UI, API, or runtime realization.',
    requiredPayloadFields: ['implements', 'codePaths'],
  },
  adr: {
    label: 'ADR',
    description: 'Architecture Decision Record.',
    requiredPayloadFields: ['decisionContext', 'decision', 'consequences'],
  },
  proposal: {
    label: 'Proposal',
    description: 'Pre-canonical candidate change.',
    requiredPayloadFields: ['problem', 'proposedChange'],
  },
  amendment: {
    label: 'Amendment',
    description: 'Formal change to constitutional or kernel-level truth.',
    requiredPayloadFields: ['amendmentClass', 'before', 'after'],
  },
  'compilation-target': {
    label: 'Compilation Target',
    description: 'Output generated from Genesis.',
    requiredPayloadFields: ['targetId'],
  },
  collection: {
    label: 'Collection',
    description: 'Top-level expandable knowledge domain.',
    requiredPayloadFields: ['purpose'],
  },
  book: {
    label: 'Book',
    description: 'Permanent body of knowledge inside a collection.',
    requiredPayloadFields: ['collectionId'],
  },
  volume: {
    label: 'Volume',
    description: 'Durable subject area within a book.',
    requiredPayloadFields: ['bookId'],
  },
  chapter: {
    label: 'Chapter',
    description: 'Operational grouping of articles.',
    requiredPayloadFields: ['volumeId'],
  },
};

export function listGenesisObjectSchemaTypes(): GenesisObjectType[] {
  return Object.keys(GENESIS_OBJECT_SCHEMA_REGISTRY) as GenesisObjectType[];
}

export function getGenesisObjectSchemaMeta(type: GenesisObjectType) {
  return GENESIS_OBJECT_SCHEMA_REGISTRY[type];
}
