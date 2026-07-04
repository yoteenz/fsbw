/**
 * studio os Distribution Network — multi-channel publishing platform types.
 */

export type DistributionChannelActivation = 'ACTIVE' | 'COMING_SOON' | 'FUTURE';

export type DistributionApprovalStatus = 'pending' | 'approved' | 'rejected' | 'revision';

export type DistributionDeliveryStatus = 'scheduled' | 'published' | 'failed' | 'draft';

export type DistributionChannelId =
  | 'website'
  | 'instagram'
  | 'tiktok'
  | 'pinterest'
  | 'email'
  | 'push'
  | 'youtube'
  | 'membership'
  | 'podcast'
  | 'sms';

export type DistributionChannel = {
  id: DistributionChannelId;
  label: string;
  activation: DistributionChannelActivation;
  accentHex: string;
  description: string;
};

export type DistributionPack = {
  id: string;
  title: string;
  channelId: DistributionChannelId;
  status: DistributionDeliveryStatus;
  scheduledAt?: string;
};

export type DistributionCampaign = {
  id: string;
  title: string;
  objective: string;
  channels: DistributionChannelId[];
  status: DistributionApprovalStatus;
};

export type DistributionCalendarView = 'daily' | 'weekly' | 'monthly' | 'campaign' | 'launch' | 'season';
