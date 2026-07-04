/** Marketplace v1.0 — constants. */

import type { DealStage, ParticipantType, PricingModel, VerificationType } from './types';

export const MARKETPLACE_STORAGE_KEY = 'studioOsMarketplace_v1';
export const MARKETPLACE_VERSION = '1.0.0';

export const PARTICIPANT_TYPES: ParticipantType[] = [
  'brand',
  'creator',
  'agency',
  'photographer',
  'videographer',
  'editor',
  'graphic-designer',
  'developer',
  'ugc-creator',
  'voice-actor',
  'model',
  'lawyer',
  'accountant',
  'manufacturer',
  'fulfillment',
  'marketing-agency',
  'virtual-assistant',
  'consultant',
  'custom',
];

export const PARTICIPANT_TYPE_LABELS: Record<ParticipantType, string> = {
  brand: 'BRAND',
  creator: 'CREATOR',
  agency: 'AGENCY',
  photographer: 'PHOTOGRAPHER',
  videographer: 'VIDEOGRAPHER',
  editor: 'EDITOR',
  'graphic-designer': 'GRAPHIC DESIGNER',
  developer: 'DEVELOPER',
  'ugc-creator': 'UGC CREATOR',
  'voice-actor': 'VOICE ACTOR',
  model: 'MODEL',
  lawyer: 'LAWYER',
  accountant: 'ACCOUNTANT',
  manufacturer: 'MANUFACTURER',
  fulfillment: 'FULFILLMENT',
  'marketing-agency': 'MARKETING AGENCY',
  'virtual-assistant': 'VIRTUAL ASSISTANT',
  consultant: 'CONSULTANT',
  custom: 'CUSTOM',
};

export const DEAL_STAGES: DealStage[] = [
  'discovery',
  'introduction',
  'meeting',
  'proposal',
  'negotiation',
  'contract',
  'production',
  'approval',
  'delivery',
  'invoice',
  'payment',
  'renewal',
  'completed',
];

export const DEAL_STAGE_LABELS: Record<DealStage, string> = {
  discovery: 'DISCOVERY',
  introduction: 'INTRODUCTION',
  meeting: 'MEETING',
  proposal: 'PROPOSAL',
  negotiation: 'NEGOTIATION',
  contract: 'CONTRACT',
  production: 'PRODUCTION',
  approval: 'APPROVAL',
  delivery: 'DELIVERY',
  invoice: 'INVOICE',
  payment: 'PAYMENT',
  renewal: 'RENEWAL',
  completed: 'COMPLETED',
};

export const PRICING_MODELS: PricingModel[] = [
  'hourly',
  'fixed-price',
  'retainer',
  'commission',
  'royalty',
  'licensing',
  'revenue-share',
  'custom',
];

export const PRICING_MODEL_LABELS: Record<PricingModel, string> = {
  hourly: 'HOURLY',
  'fixed-price': 'FIXED PRICE',
  retainer: 'RETAINER',
  commission: 'COMMISSION',
  royalty: 'ROYALTY',
  licensing: 'LICENSING',
  'revenue-share': 'REVENUE SHARE',
  custom: 'CUSTOM',
};

export const VERIFICATION_TYPES: VerificationType[] = [
  'identity',
  'business',
  'brand',
  'portfolio',
  'workspace',
];

export const VERIFICATION_TYPE_LABELS: Record<VerificationType, string> = {
  identity: 'IDENTITY',
  business: 'BUSINESS',
  brand: 'BRAND',
  portfolio: 'PORTFOLIO',
  workspace: 'WORKSPACE',
};
