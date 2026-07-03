/** Studio Analytics — per-show demo metrics (no backend). */

export type AdminStudioShowAnalytics = {
  showId: string;
  showName: string;
  accentHex: string;
  views: string;
  watchTime: string;
  completionRate: string;
  ctr: string;
  emailOpens: string;
  membershipConversions: string;
  productsPurchased: string;
  topEpisodes: Array<{ title: string; metric: string }>;
  trendingTopics: string[];
  mostPopularContent: Array<{ title: string; format: string; metric: string }>;
};

export const ADMIN_STUDIO_DEFAULT_ANALYTICS: AdminStudioShowAnalytics[] = [
  {
    showId: 'the-slay-report',
    showName: 'THE SLAY REPORT',
    accentHex: '#EB1C24',
    views: '24,812',
    watchTime: '1,204 HRS',
    completionRate: '68%',
    ctr: '4.2%',
    emailOpens: '41%',
    membershipConversions: '127',
    productsPurchased: 'NOIR × 89 · SOFT WAVE × 54',
    topEpisodes: [
      { title: 'CHERRY RED FORECAST', metric: '8.2K VIEWS' },
      { title: 'SUMMER TEXTURE RADAR', metric: '6.1K VIEWS' },
      { title: 'MEMBER SPOTLIGHT — JADE', metric: '5.4K VIEWS' },
    ],
    trendingTopics: ['CHERRY RED', 'UNDERTONE MATCHING', 'LOUNGE PREMIERES'],
    mostPopularContent: [
      { title: 'CHERRY RED FORECAST PACK', format: 'BOTH', metric: '92% COMPLETE' },
      { title: 'FRIDAY BRIEFING EMAIL', format: 'EMAIL', metric: '41% OPEN' },
    ],
  },
  {
    showId: 'slay-lab',
    showName: 'SLAY LAB',
    accentHex: '#C41E3A',
    views: '11,430',
    watchTime: '412 HRS',
    completionRate: '74%',
    ctr: '3.8%',
    emailOpens: '28%',
    membershipConversions: '43',
    productsPurchased: 'LACE KIT × 31',
    topEpisodes: [
      { title: 'LACE GLUE TEST — LAB 12', metric: '3.1K VIEWS' },
      { title: 'MACRO TRIM TECHNIQUE', metric: '2.8K VIEWS' },
    ],
    trendingTopics: ['LACE GLUE', 'MACRO INSTALL', 'TOOL TESTS'],
    mostPopularContent: [
      { title: 'LAB 12 FULL EPISODE', format: 'WATCH', metric: '74% COMPLETE' },
    ],
  },
  {
    showId: 'psa-analyzes',
    showName: 'PSA ANALYZES',
    accentHex: '#EB1C24',
    views: '8,902',
    watchTime: '318 HRS',
    completionRate: '81%',
    ctr: '5.1%',
    emailOpens: '—',
    membershipConversions: '68',
    productsPurchased: 'CONSULT BOOKINGS × 22',
    topEpisodes: [
      { title: 'UNDERTONE DEEP DIVE', metric: '2.4K VIEWS' },
      { title: 'NOIR VS BLANCO — PSA PICK', metric: '2.1K VIEWS' },
    ],
    trendingTopics: ['PSA QUEUE', 'UNDERTONE', 'UNIT MATCHING'],
    mostPopularContent: [
      { title: 'PSA REPLY SESSION', format: 'WATCH', metric: '81% COMPLETE' },
    ],
  },
  {
    showId: 'build-studio',
    showName: 'BUILD STUDIO',
    accentHex: '#8B0000',
    views: '15,220',
    watchTime: '556 HRS',
    completionRate: '62%',
    ctr: '6.4%',
    emailOpens: '22%',
    membershipConversions: '91',
    productsPurchased: 'NOIR BUILDS × 112',
    topEpisodes: [
      { title: 'NOIR CUSTOM WALKTHROUGH', metric: '4.8K VIEWS' },
      { title: 'SOFT WAVE BUILD PREVIEW', metric: '3.9K VIEWS' },
    ],
    trendingTopics: ['BUILD-A-WIG', 'NOIR', 'SWATCH MORPH'],
    mostPopularContent: [
      { title: 'NOIR BUILD EPISODE', format: 'WATCH', metric: '6.4% CTR' },
    ],
  },
  {
    showId: 'the-vault',
    showName: 'THE VAULT',
    accentHex: '#1A1A1A',
    views: '6,104',
    watchTime: '890 HRS',
    completionRate: '88%',
    ctr: '2.9%',
    emailOpens: '35%',
    membershipConversions: '34',
    productsPurchased: 'SLAY TICKETS × 78',
    topEpisodes: [
      { title: 'FOUNDER MASTERCLASS — LACE', metric: '1.9K VIEWS' },
    ],
    trendingTopics: ['VAULT DROP', 'ARCHIVE', 'LIMITED TIME'],
    mostPopularContent: [
      { title: 'VAULT MASTERCLASS', format: 'WATCH', metric: '88% COMPLETE' },
    ],
  },
  {
    showId: 'slay-academy',
    showName: 'SLAY ACADEMY',
    accentHex: '#EB1C24',
    views: '19,440',
    watchTime: '1,022 HRS',
    completionRate: '71%',
    ctr: '3.5%',
    emailOpens: '38%',
    membershipConversions: '156',
    productsPurchased: 'LACE SCISSORS × 44',
    topEpisodes: [
      { title: 'CUTTING YOUR LACE', metric: '7.2K VIEWS' },
      { title: 'HAIRLINE MAPPING 101', metric: '5.8K VIEWS' },
    ],
    trendingTopics: ['LACE MASTERY', 'LESSON SERIES', 'SLAY CREDIT'],
    mostPopularContent: [
      { title: 'CUTTING YOUR LACE PACK', format: 'BOTH', metric: '71% COMPLETE' },
    ],
  },
  {
    showId: 'campaigns',
    showName: 'CAMPAIGNS',
    accentHex: '#EB1C24',
    views: '32,100',
    watchTime: '445 HRS',
    completionRate: '54%',
    ctr: '7.8%',
    emailOpens: '29%',
    membershipConversions: '201',
    productsPurchased: 'SOFT WAVE × 67 · BLANCO × 41',
    topEpisodes: [
      { title: 'SOFT WAVE REVEAL', metric: '12.4K VIEWS' },
      { title: 'SUMMER SLAY FILM', metric: '9.8K VIEWS' },
    ],
    trendingTopics: ['SOFT WAVE', 'CAMPAIGN FILM', 'SHOP THE LOOK'],
    mostPopularContent: [
      { title: 'SOFT WAVE REVEAL', format: 'WATCH', metric: '7.8% CTR' },
    ],
  },
  {
    showId: 'the-lounge',
    showName: 'THE LOUNGE',
    accentHex: '#0A0A0A',
    views: '41,200',
    watchTime: '2,104 HRS',
    completionRate: '59%',
    ctr: '4.0%',
    emailOpens: '33%',
    membershipConversions: '312',
    productsPurchased: 'MIXED CATALOG × 189',
    topEpisodes: [
      { title: 'FEATURED ROW — NEW THIS WEEK', metric: '14.1K VIEWS' },
      { title: 'LEARN — LACE MASTERY PATH', metric: '11.2K VIEWS' },
    ],
    trendingTopics: ['LOUNGE TV', 'FEATURED', 'LIBRARY SAVES'],
    mostPopularContent: [
      { title: 'WEEKLY CONTENT PACK SYNC', format: 'BOTH', metric: '59% COMPLETE' },
    ],
  },
];

export function getAdminStudioAnalyticsByShowId(showId: string): AdminStudioShowAnalytics | undefined {
  return ADMIN_STUDIO_DEFAULT_ANALYTICS.find((a) => a.showId === showId);
}
