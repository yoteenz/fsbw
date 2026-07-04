/**
 * studio os Content Pack — platform production bundle types.
 */

export type ContentPackTabId =
  | 'episode'
  | 'journal'
  | 'email'
  | 'instagram'
  | 'tiktok'
  | 'pinterest'
  | 'carousel'
  | 'push'
  | 'thumbnail'
  | 'products'
  | 'seo'
  | 'psa-knowledge'
  | 'metadata'
  | 'notes'
  | 'status';

export type ContentPackField = {
  key: string;
  label: string;
  value: string;
  multiline?: boolean;
};

export type ContentPackDistributionTarget = {
  id: string;
  label: string;
  activation: 'ACTIVE' | 'COMING_SOON' | 'FUTURE';
  enabled?: boolean;
  plannedNote?: string;
};

export type WorkspaceContentPackRecord = {
  id: string;
  title: string;
  subtitle: string;
  showId?: string;
  status: string;
  thumbnailSrc: string;
  accentHex: string;
  distributionTargets: ContentPackDistributionTarget[];
  tabs: Record<string, ContentPackField[]>;
};
