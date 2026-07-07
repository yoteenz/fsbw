import { NDXBOOK_MISSION_CONTROL_STORAGE_KEY } from '../ndxbook/mission-control/constants';
import { NDXBOOK_STORAGE_KEY } from '../ndxbook/constants';
import { NDXBOOK_NEWSROOM_STORAGE_KEY } from '../ndxbook/newsroom/constants';
import { FOUNDER_PILOT_DEFAULT_ORGANIZATIONS } from './constants';
import { buildPilotMissionControlSeed } from './seeds/mission-control-pilot';
import { buildPilotNdxbookStorePatch } from './seeds/ndxbook-pilot';
import { enableFounderPilotMode, isFounderPilotModeActive } from './store';
import { bootstrapNdxbookMissionControlStore } from '../ndxbook/mission-control/store';
import { bootstrapNdxbookNewsroomStore } from '../ndxbook/newsroom/store';
import { writeNdxbookStore, readNdxbookStore } from '../ndxbook/store';
import { removeStudioOsStorageValue } from '../../utils/studioOsBrowserStorage';

function clearLegacyStorageKey(key: string): void {
  removeStudioOsStorageValue(key);
}

/** Reset demo seeds and apply pilot bootstrap for an organization. */
export function applyFounderPilotBootstrap(organizationId: string): void {
  enableFounderPilotMode(organizationId);

  clearLegacyStorageKey(NDXBOOK_MISSION_CONTROL_STORAGE_KEY);
  clearLegacyStorageKey(NDXBOOK_STORAGE_KEY);
  clearLegacyStorageKey(NDXBOOK_NEWSROOM_STORAGE_KEY);

  bootstrapNdxbookMissionControlStore(buildPilotMissionControlSeed(), { force: true });
  writeNdxbookStore({ ...readNdxbookStore(), ...buildPilotNdxbookStorePatch() });
  bootstrapNdxbookNewsroomStore(undefined, { force: true });
}

export function ensureFounderPilotForOrganization(organizationId: string): boolean {
  const shouldPilot =
    FOUNDER_PILOT_DEFAULT_ORGANIZATIONS.includes(organizationId as (typeof FOUNDER_PILOT_DEFAULT_ORGANIZATIONS)[number]) ||
    isFounderPilotModeActive(organizationId);

  if (!shouldPilot) return false;

  if (!isFounderPilotModeActive(organizationId)) {
    const existingPages = readNdxbookStore().pages;
    if (existingPages.length > 0) {
      enableFounderPilotMode(organizationId);
      return true;
    }
    applyFounderPilotBootstrap(organizationId);
    return true;
  }

  bootstrapNdxbookMissionControlStore(buildPilotMissionControlSeed(), { force: false });
  const ndx = readNdxbookStore();
  if (ndx.pages.length > 0 && ndx.pages.some((p) => p.pageNumber > 3)) {
    applyFounderPilotBootstrap(organizationId);
  }
  return true;
}

export function shouldUseFounderPilotSeed(organizationId: string): boolean {
  return (
    FOUNDER_PILOT_DEFAULT_ORGANIZATIONS.includes(organizationId as (typeof FOUNDER_PILOT_DEFAULT_ORGANIZATIONS)[number]) ||
    isFounderPilotModeActive(organizationId)
  );
}
