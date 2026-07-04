import { type StudioServiceResult, type StudioServiceStub } from '../types';
import { buildContextPackage, MEMORY_BIBLE_V1_0 } from '../../../studio-os/memory-bible';
import type { ContextBuilderInput, ContextPackage } from '../../../studio-os/memory-bible';
import { searchMemoryBible } from '../../../utils/adminStudioMemoryBibleDemo';

export type MemoryBibleBuildInput = ContextBuilderInput;

export type MemoryBibleBuildOutput = {
  package: ContextPackage;
};

export const memoryBibleStudioService: StudioServiceStub & {
  buildContext(input: MemoryBibleBuildInput): Promise<StudioServiceResult<MemoryBibleBuildOutput>>;
  search(query: string): Promise<StudioServiceResult<{ hits: string[] }>>;
  getSnapshot(): Promise<StudioServiceResult<{ version: string }>>;
} = {
  id: 'memory-bible',
  label: 'MEMORY BIBLE',
  phase: 2,
  enabled: true,
  description: 'INSTITUTIONAL KNOWLEDGE · NAMING · DECISIONS · AI CONTEXT BUILDER',
  async buildContext(input) {
    return { ok: true, data: { package: buildContextPackage(input, MEMORY_BIBLE_V1_0) } };
  },
  async search(query) {
    return { ok: true, data: { hits: searchMemoryBible(query) } };
  },
  async getSnapshot() {
    return { ok: true, data: { version: MEMORY_BIBLE_V1_0.version } };
  },
};
