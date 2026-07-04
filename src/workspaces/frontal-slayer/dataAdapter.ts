/**
 * Frontal Slayer Workspace data adapter.
 * Bridges existing Studio demo seeds into the Workspace data layer.
 * StudioOS Core never imports these directly — only via workspace loader.
 */

import {
  ADMIN_STUDIO_DEFAULT_SHOWS,
  getAdminStudioShowById,
} from '../../utils/adminStudioShowsDemo';
import {
  ADMIN_STUDIO_DEFAULT_CONTENT_PACKS,
  getAdminStudioContentPackById,
} from '../../utils/adminStudioContentPacksDemo';
import {
  ADMIN_STUDIO_HUB_CARDS,
  ADMIN_STUDIO_DASHBOARD_ITEMS,
  ADMIN_STUDIO_DASHBOARD_METRIC,
} from '../../utils/adminStudioDemo';

export const frontalSlayerShows = {
  listDefaults: () => ADMIN_STUDIO_DEFAULT_SHOWS,
  getById: getAdminStudioShowById,
};

export const frontalSlayerContentPacks = {
  listDefaults: () => ADMIN_STUDIO_DEFAULT_CONTENT_PACKS,
  getById: getAdminStudioContentPackById,
};

export const frontalSlayerStudioHub = {
  cards: ADMIN_STUDIO_HUB_CARDS,
  dashboardItems: ADMIN_STUDIO_DASHBOARD_ITEMS,
  dashboardMetric: ADMIN_STUDIO_DASHBOARD_METRIC,
};

/** Empty adapter for placeholder workspaces — no brand data. */
export const emptyWorkspaceDataAdapter = {
  shows: { listDefaults: () => [] as ReturnType<typeof frontalSlayerShows.listDefaults>, getById: () => undefined },
  contentPacks: {
    listDefaults: () => [] as ReturnType<typeof frontalSlayerContentPacks.listDefaults>,
    getById: () => undefined,
  },
  studioHub: { cards: [] as typeof ADMIN_STUDIO_HUB_CARDS, dashboardItems: [] as typeof ADMIN_STUDIO_DASHBOARD_ITEMS, dashboardMetric: 0 },
};

export const frontalSlayerDataAdapter = {
  shows: frontalSlayerShows,
  contentPacks: frontalSlayerContentPacks,
  studioHub: frontalSlayerStudioHub,
};

export type WorkspaceDataAdapter = typeof frontalSlayerDataAdapter;
