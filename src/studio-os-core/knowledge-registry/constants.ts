/** Milestone 126 — Studio OS Knowledge Registry™ (formerly Documentation Registry™) */

export const KNOWLEDGE_REGISTRY_STORAGE_KEY = 'studioOsKnowledgeRegistry_v1';
/** @deprecated migrated on read */
export const LEGACY_DOCUMENTATION_REGISTRY_STORAGE_KEY = 'studioOsDocumentationRegistry_v1';
export const KNOWLEDGE_REGISTRY_VERSION = '2.0.0';
export const STUDIO_OS_KNOWLEDGE_REGISTRY_UPDATED = 'studio-os-knowledge-registry-updated';
/** @deprecated */
export const STUDIO_OS_DOCUMENTATION_REGISTRY_UPDATED = STUDIO_OS_KNOWLEDGE_REGISTRY_UPDATED;

export const KNOWLEDGE_REGISTRY_ACCENT = '#0891B2';

/** @deprecated Use KNOWLEDGE_REGISTRY_ACCENT */
export const DOCUMENTATION_REGISTRY_ACCENT = KNOWLEDGE_REGISTRY_ACCENT;

export const KNOWLEDGE_REGISTRY_PHILOSOPHY = [
  'The Master Specification is the single source of truth — Volumes, milestones, and design revisions exist exactly once.',
  'Studio OS Knowledge Registry™ is the architectural brain — Constitution, Volumes, milestones, systems, dependencies, and implementation status.',
  'One registration, infinite consumers — search, walkthrough, Academy, Command Dock, System Registry, and Studio Intelligence™.',
  'The codebase consumes the specification in docs/ — it does not own it.',
] as const;

/** @deprecated Use KNOWLEDGE_REGISTRY_PHILOSOPHY */
export const DOCUMENTATION_REGISTRY_PHILOSOPHY = KNOWLEDGE_REGISTRY_PHILOSOPHY;

/** Surfaces auto-synchronized from registry */
export const AUTO_SYNC_SURFACES = [
  'studio-manual',
  'getting-started',
  'walkthrough',
  'academy',
  'help-center',
  'search-index',
  'tooltips',
  'faq',
  'developer-docs',
  'architecture-docs',
  'command-dock',
  'release-notes',
  'feature-registry',
  'version-history',
  'roadmap',
  'engineering-dashboard',
] as const;

export const REGISTRY_CATEGORIES = [
  'constitution',
  'volume',
  'chapter',
  'foundation',
  'intelligence',
  'operations',
  'legacy',
  'commerce',
  'executive',
  'platform',
  'design-revision',
  'roadmap',
  'philosophy',
] as const;

import { IMPLEMENTATION_STATUS_LABELS as MANIFEST_STATUS_LABELS } from '../manifest-reconciliation/constants';

export const IMPLEMENTATION_STATUS_LABELS = MANIFEST_STATUS_LABELS;

/** Engineering-facing surfaces show canonical milestone IDs */
export const ENGINEERING_SURFACES = [
  'knowledge-registry',
  'system-registry',
  'engineering-excellence-dashboard',
  'documentation-governance',
  'roadmap',
  'qa-headquarters',
] as const;
