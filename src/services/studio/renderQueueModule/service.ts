import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import { readRenderQueueStore } from '../../../studio-os-core/render-queue/store';

export type RenderQueueModuleSnapshot = ReturnType<typeof readRenderQueueStore>;

export const RENDER_QUEUE_CHAIN = [
  'QUEUED',
  'SCRIPT',
  'VOICE',
  'VISUALS',
  'MOTION',
  'CAPTIONS',
  'THUMBNAIL',
  'RENDER',
  'OPTIMIZE',
  'EXPORT',
  'REVIEW',
] as const;

export const renderQueueModuleService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<RenderQueueModuleSnapshot>>;
} = {
  id: 'render-queue',
  label: 'RENDER QUEUE',
  phase: 2,
  enabled: false,
  description: 'CENTRALIZED PRODUCTION FLOOR · VISIBLE PIPELINE · LIVE PROGRESS · V1.0',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Render Queue requires browser context.');
    }
    return { ok: true, data: readRenderQueueStore() };
  },
};
