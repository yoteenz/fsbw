/**
 * Studio World Physics™ — foundational natural law types.
 * Physics defines what is fundamentally possible. Constitution defines what is allowed.
 */

export type FoundationalPhysicsLawId =
  | 'physical-place-law'
  | 'relationship-gravity'
  | 'knowledge-conservation'
  | 'identity-persistence'
  | 'scene-integrity'
  | 'asset-conservation'
  | 'blueprint-determinism'
  | 'spatial-continuity'
  | 'temporal-continuity'
  | 'world-memory';

export type FoundationalPhysicsLaw = {
  id: FoundationalPhysicsLawId;
  number: number;
  title: string;
  summary: string;
  /** What becomes impossible if this law is violated */
  violation: string;
  examples: string[];
  /** Engines or modules that enforce this law in code */
  enforcementPaths?: string[];
};

export type CanonTier = 'foundational-physics' | 'constitutional-law' | 'implementation-standard';
