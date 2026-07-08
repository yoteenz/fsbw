export type ImplementationStandardId =
  | 'world-graph-compile-gate'
  | 'w-id-registry'
  | 'route-registry-pattern'
  | 'repository-structure'
  | 'naming-conventions'
  | 'scene-graph-contract'
  | 'scene-stack-prompt-version'
  | 'generation-api-contract'
  | 'era-evaluation-gate'
  | 'design-review-filter'
  | 'motherboard-sync-contract'
  | 'one-deploy-per-task'
  | 'ci-validation-gate'
  | 'migration-strategy';

export type ImplementationStandard = {
  id: ImplementationStandardId;
  title: string;
  summary: string;
  docPaths: string[];
  codePaths?: string[];
  /** Canon laws this standard implements */
  implementsLaws: string[];
};
