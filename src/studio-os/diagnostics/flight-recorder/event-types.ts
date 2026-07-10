export { type FlightEventType } from '../types';

/** Known window CustomEvent names mapped to flight event types. */
export const WINDOW_EVENT_MAP: Record<string, import('../types').FlightEventType> = {
  'genesis-updated': 'STORE_UPDATED',
  'studio-os-scene-stack-hydrated': 'SCENE_STACK_UPDATED',
  'studio-os-experience-engine-updated': 'STORE_UPDATED',
  'studio-bootstrap-start-failed': 'ERROR_BOUNDARY',
  'signInStateChanged': 'AUTH_COMPLETED',
  'studio-os-storage-guard': 'STORAGE_WRITE',
  'studio-os-business-company-genome-updated': 'REGISTRY_LOADED',
  'studio-os-documentation-registry-updated': 'REGISTRY_LOADED',
  'studio-os-documentation-sync-updated': 'REGISTRY_LOADED',
};

/** Boot kernel event — detail carries module id. */
export const STUDIO_BOOT_EVENT = 'studio-boot-live-state';
