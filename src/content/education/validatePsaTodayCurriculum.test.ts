import { describe, expect, it } from 'vitest';
import { validatePsaTodayCurriculum } from './validatePsaTodayCurriculum';
import { PSA_CARE_EPISODE_01 } from '../psa-today/episode-care-01-intro-to-your-unit';
import type { PSATodayEpisode } from '../../components/lounge/psa-today/types';

describe('validatePsaTodayCurriculum', () => {
  it('passes for approved Care Episode 01 structure', () => {
    const issues = validatePsaTodayCurriculum([PSA_CARE_EPISODE_01]);
    expect(issues).toEqual([]);
  });

  it('flags unknown unit references', () => {
    const bad: PSATodayEpisode = {
      ...PSA_CARE_EPISODE_01,
      chapters: [
        {
          id: 'bad-ch',
          label: 'BAD',
          type: 'camera-b' as const,
          unitSpecificModules: { 'fake-unit': {} } as NonNullable<
            NonNullable<PSATodayEpisode['chapters']>[number]['unitSpecificModules']
          >,
          sharedModule: { posterUrl: '/x.png' },
        },
      ],
    };
    const issues = validatePsaTodayCurriculum([bad]);
    expect(issues.some((i: { kind: string }) => i.kind === 'invalid-signature-unit-ref')).toBe(true);
  });
});
