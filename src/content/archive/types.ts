export type ArchiveCampaignStatus = 'restored' | 'restoring' | 'sealed';

export type ArchiveCampaign = {
  id: string;
  year: number;
  title?: string;
  thumbnail?: string;
  status: ArchiveCampaignStatus;
  campaignType?: string;
  duration?: string;
  contentPackId?: string;
  restoredAt?: string;
  description?: string;
};

export type ArchiveRestorationSummary = {
  restoredCount: number;
  totalCount: number;
  inProgress: boolean;
};
