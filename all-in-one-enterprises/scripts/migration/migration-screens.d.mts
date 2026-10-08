/** Types for migration-screens.mjs (shared by the gallery, the responsive QA and the flow prototype). */
export type MigrationScreenEntry = {
  key: string;
  branch: 'existing' | 'activation' | 'new' | 'batch';
  name: string;
  authority: string;
  route: string;
  actor: 'staff' | 'client';
  seed: string;
  rep?: boolean;
  local?: string[];
};
export const SCREENS: MigrationScreenEntry[];
export function SEED(scenario: string): void;
