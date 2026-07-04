/**
 * Empty workspace data adapter — placeholders with no brand production data.
 */

import type { WorkspaceDataAdapter } from './data-adapter';

export const emptyWorkspaceDataAdapter: WorkspaceDataAdapter = {
  shows: {
    listDefaults: () => [],
    getById: () => undefined,
  },
  contentPacks: {
    listDefaults: () => [],
    getById: () => undefined,
  },
  studioHub: {
    cards: [],
    dashboardItems: [],
    dashboardMetric: 0,
  },
};
