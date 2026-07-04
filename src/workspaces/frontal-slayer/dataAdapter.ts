/**
 * Frontal Slayer Workspace data adapter.
 * Bridges existing Studio demo seeds into the Workspace data layer.
 * studio os Core never imports these directly — only via workspace loader.
 */

import type { WorkspaceDataAdapter } from '../../studio-os-core/workspace/data-adapter';
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

export const frontalSlayerDataAdapter: WorkspaceDataAdapter = {
  shows: frontalSlayerShows,
  contentPacks: frontalSlayerContentPacks,
  studioHub: frontalSlayerStudioHub,
};
