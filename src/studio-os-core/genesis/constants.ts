/** Genesis.md — Foundation Framework™ runtime constants */

export const GENESIS_FRAMEWORK_NAME = 'Genesis Foundation Framework™';
export const GENESIS_FRAMEWORK_VERSION = '1.0.0';
export const GENESIS_STORAGE_KEY = 'genesis_v1';
export const GENESIS_UPDATED_EVENT = 'genesis-updated';

/** Root Genesis.md charter reference */
export const GENESIS_CHARTER_PATH = 'Genesis.md';

/** Ordered lifecycle — Proposal → Review → Prototype → ADR → Genesis → Implementation → Verification → Canonical */
export const GENESIS_PIPELINE_STAGES = [
  'proposal',
  'review',
  'prototype',
  'adr',
  'genesis',
  'implementation',
  'verification',
  'canonical',
] as const;

export const GENESIS_COMPILE_TARGETS = [
  'constitution',
  'architects-brain',
  'master-specification',
  'world-bible',
  'developer-docs',
  'sdk-docs',
  'api-docs',
  'codex',
  'institute-of-knowledge',
] as const;
