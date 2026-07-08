export const STUDIO_WORLD_ROUTE_ROOT = '/admin/studio';
export const STUDIO_COMPANIES_BASE = `${STUDIO_WORLD_ROUTE_ROOT}/companies`;
export const DEFAULT_COMPANY_SLUG = 'frontal-slayer';

export const GLOBAL_STUDIO_ROUTES = {
  commandCenter: `${STUDIO_WORLD_ROUTE_ROOT}/command-center`,
  archives: `${STUDIO_WORLD_ROUTE_ROOT}/archives`,
  archivesWarehouse: `${STUDIO_WORLD_ROUTE_ROOT}/archives/warehouse`,
  archivesMuseum: `${STUDIO_WORLD_ROUTE_ROOT}/archives/museum`,
  archivesHallOfInnovation: `${STUDIO_WORLD_ROUTE_ROOT}/archives/hall-of-innovation`,
  archivesBlueprints: `${STUDIO_WORLD_ROUTE_ROOT}/archives/blueprints`,
  archivesMarketplace: `${STUDIO_WORLD_ROUTE_ROOT}/archives/marketplace`,
  expeditions: `${STUDIO_WORLD_ROUTE_ROOT}/expeditions`,
  missionControl: `${STUDIO_WORLD_ROUTE_ROOT}/mission-control`,
  atlas: `${STUDIO_WORLD_ROUTE_ROOT}/atlas`,
} as const;

export const COMPANY_DEPARTMENT_IDS = [
  'marketing',
  'finance',
  'operations',
  'product',
  'customer-experience',
  'intelligence',
  'distribution',
  'hiring',
  'legal',
] as const;
