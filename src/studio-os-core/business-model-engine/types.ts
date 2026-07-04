/**
 * Business Model Engine v1.0 — economic engine for the Studio OS ecosystem.
 */

export type MembershipTier =
  | 'free'
  | 'creator'
  | 'professional'
  | 'business'
  | 'agency'
  | 'enterprise'
  | 'enterprise-plus';

export type MembershipCapabilities = {
  workspaceLimit: number;
  aiGenerationsPerMonth: number;
  automationLimit: number;
  storageGb: number;
  marketplaceParticipation: boolean;
  analyticsDepth: 'basic' | 'standard' | 'advanced' | 'enterprise';
  executiveAiTeamSize: number;
  approvalWorkflows: boolean;
  teamSeats: number;
  apiAccess: boolean;
  customBranding: boolean;
  prioritySupport: boolean;
  enterprisePermissions: boolean;
};

export type WorkspaceBillingRecord = {
  id: string;
  workspaceId: string;
  tier: MembershipTier;
  billingOwner: string;
  teamBilling: boolean;
  creditsRemaining: number;
  renewalDate: string;
  paymentMethodLabel: string;
  upgradeHistory: Array<{ date: string; from: MembershipTier; to: MembershipTier }>;
  invoiceIds: string[];
};

export type UsageMetric = {
  id: string;
  workspaceId: string;
  category: 'ai-generations' | 'video-rendering' | 'voice-generation' | 'storage' | 'bandwidth' | 'api-requests' | 'automation-executions';
  used: number;
  limit: number;
  unit: string;
  period: string;
};

export type PlatformFeeConfig = {
  id: string;
  channel: 'brand-partnerships' | 'service-marketplace' | 'talent-marketplace' | 'business-referrals' | 'affiliate-referrals' | 'transactions';
  model: 'percentage' | 'flat-fee' | 'hybrid' | 'subscription-discount' | 'enterprise-custom';
  rateLabel: string;
  percentage?: number;
  flatFee?: number;
  notes: string;
};

export type PaymentArchitectureType =
  | 'subscription'
  | 'one-time'
  | 'recurring'
  | 'commission'
  | 'royalty'
  | 'escrow'
  | 'milestone'
  | 'split'
  | 'payout'
  | 'refund'
  | 'credit';

export type PaymentArchitectureRecord = {
  id: string;
  workspaceId: string;
  type: PaymentArchitectureType;
  amount: number;
  status: 'pending' | 'scheduled' | 'completed' | 'refunded';
  label: string;
  providerReady: boolean;
  note: string;
};

export type ParticipantWallet = {
  id: string;
  participantId: string;
  workspaceId: string;
  displayName: string;
  earnings: number;
  pendingPayouts: number;
  availableBalance: number;
  credits: number;
  affiliateEarnings: number;
  royalties: number;
  commissions: number;
  bonuses: number;
};

export type AffiliateProgram = {
  id: string;
  workspaceId: string;
  name: string;
  commissionRate: string;
  links: number;
  clicks: number;
  conversions: number;
  topAffiliates: Array<{ name: string; conversions: number; commission: number }>;
  totalPaid: number;
};

export type RoyaltyRecord = {
  id: string;
  workspaceId: string;
  assetType: 'blueprint' | 'creative-dna' | 'writing-bible' | 'automation-pack' | 'prompt-library' | 'executive-ai' | 'marketplace-asset';
  assetName: string;
  creatorId: string;
  royaltyRate: string;
  lifetimeEarnings: number;
  monthlyEarnings: number;
  licenseCount: number;
};

export type AssetMarketplaceListing = {
  id: string;
  workspaceId: string;
  marketplace: 'blueprint' | 'creative' | 'writing' | 'automation' | 'ai-executive';
  title: string;
  author: string;
  price: string;
  rating: number;
  licenseCount: number;
  version: string;
  tags: string[];
};

export type AppEcosystemEntry = {
  id: string;
  type: 'app' | 'plugin' | 'integration' | 'widget' | 'module';
  name: string;
  developer: string;
  status: 'planned' | 'beta' | 'live';
  description: string;
};

export type CertificationRecord = {
  id: string;
  type: 'consultant' | 'blueprint-architect' | 'automation-specialist' | 'creative-dna-designer' | 'ai-director' | 'custom';
  holderName: string;
  issuedAt: string;
  badgeLabel: string;
};

export type EnterpriseLicense = {
  id: string;
  organizationName: string;
  workspaceCount: number;
  features: string[];
  ssoReady: boolean;
  customBranding: boolean;
  privateMarketplace: boolean;
  annualValue: number;
};

export type EconomicSnapshot = {
  mrr: number;
  arr: number;
  arpu: number;
  marketplaceRevenue: number;
  subscriptionRevenue: number;
  royaltyRevenue: number;
  affiliateRevenue: number;
  platformFees: number;
  enterpriseRevenue: number;
  totalWalletBalances: number;
  payoutsPending: number;
  growthForecastPct: number;
};

export type PricingSimulatorScenario = {
  id: string;
  label: string;
  subscriptionChange: string;
  commissionChange: string;
  royaltyChange: string;
  marketplaceFeeChange: string;
  enterprisePlanChange: string;
  estimatedRevenueImpact: number;
  notes: string;
};

export type EcosystemHealthMetrics = {
  creatorSuccessScore: number;
  brandSuccessScore: number;
  marketplaceLiquidity: number;
  averageEarnings: number;
  customerLifetimeValue: number;
  retentionPct: number;
  churnPct: number;
  workspaceGrowthPct: number;
  networkGrowthPct: number;
};

export type BusinessModelEngineStore = {
  workspaceBilling: WorkspaceBillingRecord[];
  usageMetrics: UsageMetric[];
  platformFees: PlatformFeeConfig[];
  payments: PaymentArchitectureRecord[];
  wallets: ParticipantWallet[];
  affiliatePrograms: AffiliateProgram[];
  royalties: RoyaltyRecord[];
  assetListings: AssetMarketplaceListing[];
  appEcosystem: AppEcosystemEntry[];
  certifications: CertificationRecord[];
  enterpriseLicenses: EnterpriseLicense[];
  economics: EconomicSnapshot;
  pricingScenarios: PricingSimulatorScenario[];
  ecosystemHealth: EcosystemHealthMetrics;
  version: string;
};
