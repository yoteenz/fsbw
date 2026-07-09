import { XELAB_SUBSYSTEM_VERSION } from '../constants';

export function buildExperienceLabSeedStore() {
  return {
    version: XELAB_SUBSYSTEM_VERSION,
    seededAt: new Date().toISOString(),
  };
}
