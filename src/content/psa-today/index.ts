import type { PSATodayEpisode } from '../../components/lounge/psa-today/types';
import { PSA_TODAY_EPISODE_01 } from './episode-01-pluck-frontal';
import { PSA_CARE_EPISODE_01 } from './episode-care-01-intro-to-your-unit';

/** All PSA Today episodes — add Episode 02+ here without changing player components. */
export const PSA_TODAY_EPISODES: PSATodayEpisode[] = [
  PSA_TODAY_EPISODE_01,
  PSA_CARE_EPISODE_01,
];

export { PSA_TODAY_EPISODE_01, PSA_CARE_EPISODE_01 };
