import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import {
  ADMIN_STUDIO_NDXBOOK_SUBTITLE,
  NDXBOOK_INHERITANCE_CHAIN,
} from '../../../utils/adminStudioNdxbookDemo';
import { readNdxbookStore } from '../../../studio-os-core/ndxbook/store';
import { NDXBOOK_WORKSPACE_ID } from '../../../studio-os-core/ndxbook/constants';

export type NdxbookSnapshot = {
  workspaceId: string;
  store: ReturnType<typeof readNdxbookStore>;
  inheritanceChain: readonly string[];
};

export const ndxbookStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<NdxbookSnapshot>>;
} = {
  id: 'ndxbook',
  label: 'NDXBOOK',
  phase: 2,
  enabled: false,
  description:
    'PUBLIC MEDIA BRAND — INDEXED PAGES · VOLUMES · CHAPTERS · PROGRAMMING · LABS · SOCIAL PLACEHOLDERS',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('NDXBook requires browser localStorage context.');
    }
    return {
      ok: true,
      data: {
        workspaceId: NDXBOOK_WORKSPACE_ID,
        store: readNdxbookStore(),
        inheritanceChain: NDXBOOK_INHERITANCE_CHAIN,
      },
    };
  },
};

export { ADMIN_STUDIO_NDXBOOK_SUBTITLE, NDXBOOK_INHERITANCE_CHAIN };

export type NdxbookStudioService = typeof ndxbookStudioService;
