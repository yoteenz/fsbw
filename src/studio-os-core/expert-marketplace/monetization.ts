import { REVENUE_CHANNEL_TYPES } from './constants';
import type { ExpertProfile, RevenueOffering } from './types';

export function generateRevenueOfferings(profile: ExpertProfile): RevenueOffering[] {
  return REVENUE_CHANNEL_TYPES.slice(0, 6).map((channel) => ({
    id: `revenue-${profile.id}-${channel}`,
    expertProfileId: profile.id,
    channel,
    label: channel.replace(/-/g, ' ').toUpperCase(),
    description: `${profile.organizationName} monetizes ${profile.expertName} expertise via ${channel.replace(/-/g, ' ')}.`,
  }));
}

export function summarizeRevenueChannels(offerings: RevenueOffering[]): string {
  return offerings.map((o) => o.label).join(' · ');
}
