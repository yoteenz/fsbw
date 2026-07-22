import type { LoungeTvStreamSeries } from './loungeTvStreamingTypes';

export const LOUNGE_TV_STREAM_SERIES: LoungeTvStreamSeries[] = [
  {
    id: 'psa-academy-s1',
    title: 'PSA ACADEMY',
    host: 'PSA',
    season: 1,
    description:
      'SEASON ONE WALKS YOU FROM LACE CHOICE THROUGH INSTALL AND MAINTENANCE — HOSTED BY PSA.',
    difficulty: 'BEGINNER → INTERMEDIATE',
    episodes: [
      { episodeNumber: 1, episodeTitle: 'CHOOSING YOUR LACE', contentPackId: 'cutting-lace' },
      { episodeNumber: 2, episodeTitle: 'BLEACHING KNOTS', contentPackId: 'bleaching-knots' },
      { episodeNumber: 3, episodeTitle: 'TINTING LACE', contentPackId: 'tinting-lace' },
      { episodeNumber: 4, episodeTitle: 'MELTING LACE', contentPackId: 'melting-lace' },
      { episodeNumber: 5, episodeTitle: 'INSTALLATION', contentPackId: 'extending-install' },
      { episodeNumber: 6, episodeTitle: 'MAINTENANCE', contentPackId: 'cleaning-lace' },
    ],
    page: {
      description:
        'FRONTAL SLAYER ORIGINAL MASTERCLASS — EPISODIC LACE AND INSTALL CURRICULUM WITH PSA AS YOUR HOST.',
      host: 'PSA',
      difficulty: 'BEGINNER → INTERMEDIATE',
      estimatedCompletionMinutes: 42,
      episodeCount: 6,
      prerequisiteSeriesIds: [],
      relatedSeriesIds: ['luxury-hair-science'],
      studentsAlsoWatchedSeriesIds: ['luxury-hair-science'],
    },
    trailers: [
      {
        kind: 'official',
        title: 'PSA ACADEMY — OFFICIAL TRAILER',
        videoSrc:
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        runtime: '1 MIN',
      },
      {
        kind: 'season',
        title: 'SEASON 1 PREVIEW',
        videoSrc:
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        runtime: '45 SEC',
      },
    ],
  },
];
