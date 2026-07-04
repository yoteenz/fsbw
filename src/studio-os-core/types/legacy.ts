/**
 * StudioOS Legacy System — institutional memory platform types.
 */

export type LegacyArchiveRecord = {
  id: string;
  title: string;
  category: string;
  year: string;
  summary: string;
  thumbnailSrc?: string;
};

export type LegacyHallOfFameEntry = {
  id: string;
  name: string;
  role: string;
  achievement: string;
  year: string;
};

export type LegacyTimelineEvent = {
  id: string;
  title: string;
  date: string;
  description: string;
  category: string;
};

export type LegacyShowHistory = {
  id: string;
  showName: string;
  seasons: number;
  episodes: number;
  highlight: string;
};

export type LegacyCampaignHistory = {
  id: string;
  campaignName: string;
  year: string;
  outcome: string;
};

export type LegacySearchResult = {
  id: string;
  title: string;
  category: string;
  snippet: string;
  route?: string;
};
