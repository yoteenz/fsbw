import { LIVING_PRESENCE_PHILOSOPHY } from './constants';
import { bootstrapLivingPresenceStore } from './store';

export function bootstrapLivingHeadquartersPresencePlatform(): void {
  bootstrapLivingPresenceStore({ philosophy: [...LIVING_PRESENCE_PHILOSOPHY] });
}
