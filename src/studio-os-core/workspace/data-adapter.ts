/**
 * Workspace data adapter contract — workspace layer implements; core consumes.
 */

import type { WorkspaceContentPackRecord } from '../types/content-pack';
import type { WorkspaceShowRecord } from '../types/production';
import type { WorkspaceStudioHubData } from '../types/mission-control';

export interface WorkspaceDataAdapter {
  shows: {
    listDefaults: () => WorkspaceShowRecord[];
    getById: (id: string) => WorkspaceShowRecord | undefined;
  };
  contentPacks: {
    listDefaults: () => WorkspaceContentPackRecord[];
    getById: (id: string) => WorkspaceContentPackRecord | undefined;
  };
  studioHub: WorkspaceStudioHubData;
}
