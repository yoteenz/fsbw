import type { ManualModule } from './types';

type ManualModuleReader = () => ManualModule[];

let readCompiledModules: ManualModuleReader | null = null;

/** Called once from registry after module graph is fully linked. */
export function bindManualModuleReader(reader: ManualModuleReader): void {
  readCompiledModules = reader;
}

export function readCompiledManualModules(): ManualModule[] {
  return readCompiledModules?.() ?? [];
}
