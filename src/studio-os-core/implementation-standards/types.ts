/**
 * Implementation Standards™ — engineering patterns that evolve continuously.
 * Subordinate to Constitutional Law and Foundational Physics.
 */

export type ImplementationStandardId =
  | 'world-graph-compile-gate'
  | 'w-id-registry'
  | 'route-registry-pattern'
  | 'scene-stack-prompt-version'
  | 'era-evaluation-gate'
  | 'motherboard-sync-contract'
  | 'one-deploy-per-task';

export type ImplementationStandard = {
  id: ImplementationStandardId;
  title: string;
  summary: string;
  docPaths: string[];
  codePaths?: string[];
  /** Canon laws this standard implements */
  implementsLaws: string[];
};
