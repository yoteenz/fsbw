/**
 * Business Model Engine — AI Media workspace demo seeds & bootstrap.
 */

import { AI_MEDIA_WORKSPACE_ID } from '../../../studio-os-core/ai-media-network/constants';
import {
  bootstrapBusinessModelEngineStore,
  mergeBusinessModelEnginePatch,
  readBusinessModelEngineStore,
} from '../../../studio-os-core/business-model-engine/store';
import type { BusinessModelEngineStore } from '../../../studio-os-core/business-model-engine/types';

const WS = AI_MEDIA_WORKSPACE_ID;

export function buildBusinessModelEngineStorePatch(): Partial<BusinessModelEngineStore> {
  return {
    workspaceBilling: [
      {
        id: 'bill-ai-media',
        workspaceId: WS,
        tier: 'business',
        billingOwner: 'AI Media Network · Founder',
        teamBilling: true,
        creditsRemaining: 4200,
        renewalDate: '2026-08-01',
        paymentMethodLabel: 'Visa ···· 4242 (architecture only)',
        upgradeHistory: [
          { date: '2026-03-01', from: 'creator', to: 'professional' },
          { date: '2026-05-15', from: 'professional', to: 'business' },
        ],
        invoiceIds: ['inv-2026-06', 'inv-2026-05'],
      },
    ],
    usageMetrics: [
      { id: 'use-ai', workspaceId: WS, category: 'ai-generations', used: 842, limit: 5000, unit: 'generations', period: '2026-07' },
      { id: 'use-video', workspaceId: WS, category: 'video-rendering', used: 124, limit: 500, unit: 'renders', period: '2026-07' },
      { id: 'use-voice', workspaceId: WS, category: 'voice-generation', used: 96, limit: 300, unit: 'minutes', period: '2026-07' },
      { id: 'use-storage', workspaceId: WS, category: 'storage', used: 48, limit: 200, unit: 'GB', period: '2026-07' },
      { id: 'use-api', workspaceId: WS, category: 'api-requests', used: 12400, limit: 100000, unit: 'requests', period: '2026-07' },
      { id: 'use-auto', workspaceId: WS, category: 'automation-executions', used: 89, limit: 250, unit: 'runs', period: '2026-07' },
    ],
    platformFees: [
      { id: 'fee-brand', channel: 'brand-partnerships', model: 'percentage', rateLabel: '12% platform fee', percentage: 12, notes: 'Configurable — not hardcoded in production logic' },
      { id: 'fee-service', channel: 'service-marketplace', model: 'hybrid', rateLabel: '8% + $2 flat', percentage: 8, flatFee: 2, notes: 'Hybrid model for service marketplace deals' },
      { id: 'fee-talent', channel: 'talent-marketplace', model: 'percentage', rateLabel: '10% talent marketplace', percentage: 10, notes: 'Talent Network → Marketplace bridge' },
      { id: 'fee-referral', channel: 'business-referrals', model: 'flat-fee', rateLabel: '$50 per qualified referral', flatFee: 50, notes: 'Growth Network referral fee' },
      { id: 'fee-affiliate', channel: 'affiliate-referrals', model: 'percentage', rateLabel: '15% affiliate commission', percentage: 15, notes: 'Workspace affiliate programs' },
      { id: 'fee-enterprise', channel: 'transactions', model: 'enterprise-custom', rateLabel: 'Custom enterprise pricing', notes: 'Negotiated per org — Enterprise Plus' },
    ],
    payments: [
      { id: 'pay-sub', workspaceId: WS, type: 'subscription', amount: 299, status: 'completed', label: 'Business tier · monthly', providerReady: false, note: 'Stripe-ready architecture — not connected' },
      { id: 'pay-royalty', workspaceId: WS, type: 'royalty', amount: 420, status: 'scheduled', label: 'Creative DNA royalty pool · June', providerReady: false, note: 'Recurring royalty payout' },
      { id: 'pay-escrow', workspaceId: WS, type: 'escrow', amount: 10500, status: 'pending', label: 'Marketplace deal escrow · LearnFlow', providerReady: false, note: 'Linked to Marketplace deal center' },
      { id: 'pay-milestone', workspaceId: WS, type: 'milestone', amount: 800, status: 'completed', label: 'Editor retainer milestone', providerReady: false, note: 'Milestone payment architecture' },
      { id: 'pay-split', workspaceId: WS, type: 'split', amount: 2400, status: 'scheduled', label: 'Split · platform fee + creator payout', providerReady: false, note: 'Split payment between platform and participant wallets' },
    ],
    wallets: [
      { id: 'wal-maya', participantId: 'talent-maya-chen', workspaceId: WS, displayName: 'Maya Chen', earnings: 12400, pendingPayouts: 2400, availableBalance: 8200, credits: 200, affiliateEarnings: 890, royalties: 420, commissions: 0, bonuses: 100 },
      { id: 'wal-casey', participantId: 'mp-casey-editor', workspaceId: WS, displayName: 'Casey Lee', earnings: 9600, pendingPayouts: 800, availableBalance: 7200, credits: 0, affiliateEarnings: 0, royalties: 0, commissions: 9600, bonuses: 0 },
      { id: 'wal-platform', participantId: 'platform', workspaceId: WS, displayName: 'Studio OS Platform', earnings: 42800, pendingPayouts: 0, availableBalance: 38400, credits: 0, affiliateEarnings: 1800, royalties: 3200, commissions: 8600, bonuses: 0 },
    ],
    affiliatePrograms: [
      {
        id: 'aff-ai-media',
        workspaceId: WS,
        name: 'AI Media Affiliate Program',
        commissionRate: '15%',
        links: 48,
        clicks: 8420,
        conversions: 340,
        topAffiliates: [
          { name: 'Riley Park', conversions: 89, commission: 1240 },
          { name: 'Finance Creator Hub', conversions: 62, commission: 890 },
        ],
        totalPaid: 4200,
      },
    ],
    royalties: [
      { id: 'roy-cdna', workspaceId: WS, assetType: 'creative-dna', assetName: 'AI Media Creative DNA v2.4', creatorId: 'platform', royaltyRate: '8% per license', lifetimeEarnings: 12400, monthlyEarnings: 820, licenseCount: 42 },
      { id: 'roy-blueprint', workspaceId: WS, assetType: 'blueprint', assetName: 'Digital Media Network Blueprint', creatorId: 'platform', royaltyRate: '12% per launch', lifetimeEarnings: 8600, monthlyEarnings: 1200, licenseCount: 18 },
      { id: 'roy-exec', workspaceId: WS, assetType: 'executive-ai', assetName: 'CMO · Growth Strategist Executive', creatorId: 'platform', royaltyRate: '$49/mo subscription share', lifetimeEarnings: 3200, monthlyEarnings: 480, licenseCount: 24 },
      { id: 'roy-prompt', workspaceId: WS, assetType: 'prompt-library', assetName: 'Money Monday Hook Library', creatorId: 'talent-maya-chen', royaltyRate: '5% per reuse', lifetimeEarnings: 2100, monthlyEarnings: 340, licenseCount: 67 },
    ],
    assetListings: [
      { id: 'list-bp-media', workspaceId: WS, marketplace: 'blueprint', title: 'Digital Media Network Company Blueprint', author: 'Studio OS Labs', price: '$499 launch · 12% royalty', rating: 4.9, licenseCount: 18, version: '2.1', tags: ['media', 'network', 'ai-media'] },
      { id: 'list-bp-newsletter', workspaceId: WS, marketplace: 'blueprint', title: 'Newsletter Company Blueprint', author: 'Studio OS', price: '$299', rating: 4.7, licenseCount: 31, version: '1.4', tags: ['newsletter', 'creator'] },
      { id: 'list-creative-dna', workspaceId: WS, marketplace: 'creative', title: 'Short-Form Thumbnail System', author: 'Sam Ortiz', price: '$149 license', rating: 4.8, licenseCount: 52, version: '1.2', tags: ['thumbnail', 'photography'] },
      { id: 'list-writing', workspaceId: WS, marketplace: 'writing', title: 'Finance Myth-Busting Writing Bible', author: 'Maya Chen', price: '$99', rating: 4.9, licenseCount: 44, version: '2.0', tags: ['finance', 'hooks', 'scripts'] },
      { id: 'list-auto', workspaceId: WS, marketplace: 'automation', title: 'Publish → Labs Experiment Pipeline', author: 'Studio OS Labs', price: '$199', rating: 4.8, licenseCount: 28, version: '1.0', tags: ['automation', 'labs'] },
      { id: 'list-exec-cmo', workspaceId: WS, marketplace: 'ai-executive', title: 'Chief Marketing Officer · Growth', author: 'Studio OS', price: '$49/mo subscribe', rating: 4.6, licenseCount: 24, version: '1.3', tags: ['cmo', 'growth', 'executive'] },
      { id: 'list-exec-legal', workspaceId: WS, marketplace: 'ai-executive', title: 'Legal Advisor · Contract Intel', author: 'Studio OS', price: '$39/mo subscribe', rating: 4.5, licenseCount: 12, version: '1.0', tags: ['legal', 'contracts'] },
    ],
    appEcosystem: [
      { id: 'app-future-1', type: 'plugin', name: 'Custom Distribution Connector', developer: 'Third-party · planned', status: 'planned', description: 'Extend Distribution Network with custom channel routing.' },
      { id: 'app-future-2', type: 'integration', name: 'Stripe Payout Bridge', developer: 'Studio OS · beta', status: 'beta', description: 'Payment provider integration for wallet payouts.' },
      { id: 'app-future-3', type: 'widget', name: 'Revenue Snapshot Widget', developer: 'Studio OS', status: 'live', description: 'Embeddable MRR/ARR widget for Mission Control.' },
    ],
    certifications: [
      { id: 'cert-1', type: 'blueprint-architect', holderName: 'Studio OS Pilot Team', issuedAt: '2026-06-01', badgeLabel: 'CERTIFIED BLUEPRINT ARCHITECT' },
      { id: 'cert-2', type: 'automation-specialist', holderName: 'Casey Lee', issuedAt: '2026-05-15', badgeLabel: 'CERTIFIED AUTOMATION SPECIALIST' },
      { id: 'cert-3', type: 'creative-dna-designer', holderName: 'Sam Ortiz', issuedAt: '2026-04-20', badgeLabel: 'CERTIFIED CREATIVE DNA DESIGNER' },
      { id: 'cert-4', type: 'ai-director', holderName: 'AI Media Network', issuedAt: '2026-06-28', badgeLabel: 'CERTIFIED AI DIRECTOR' },
    ],
    enterpriseLicenses: [
      {
        id: 'ent-demo',
        organizationName: 'Frontal Slayer Holdings (demo)',
        workspaceCount: 12,
        features: ['Multiple workspaces', 'Department management', 'Custom branding', 'SSO readiness', 'Advanced reporting', 'Private marketplace'],
        ssoReady: true,
        customBranding: true,
        privateMarketplace: true,
        annualValue: 48000,
      },
    ],
    pricingScenarios: [
      {
        id: 'sim-1',
        label: 'Raise Business tier +$50/mo',
        subscriptionChange: 'Business $299 → $349',
        commissionChange: 'No change',
        royaltyChange: 'No change',
        marketplaceFeeChange: 'No change',
        enterprisePlanChange: 'No change',
        estimatedRevenueImpact: 4200,
        notes: 'Simulated MRR impact across 84 Business workspaces',
      },
      {
        id: 'sim-2',
        label: 'Reduce talent marketplace fee 10% → 8%',
        subscriptionChange: 'No change',
        commissionChange: 'Talent fee 10% → 8%',
        royaltyChange: 'No change',
        marketplaceFeeChange: '-2% talent channel',
        enterprisePlanChange: 'No change',
        estimatedRevenueImpact: -1200,
        notes: 'May increase marketplace liquidity — ecosystem health tradeoff',
      },
      {
        id: 'sim-3',
        label: 'Enterprise Plus launch @ $2,499/mo',
        subscriptionChange: 'New tier',
        commissionChange: 'Custom fees',
        royaltyChange: 'No change',
        marketplaceFeeChange: 'Enterprise custom',
        enterprisePlanChange: 'Enterprise Plus · unlimited workspaces',
        estimatedRevenueImpact: 14994,
        notes: '6 projected Enterprise Plus conversions in Q3',
      },
    ],
  };
}

export function bootstrapAiMediaBusinessModelEngine(): void {
  bootstrapBusinessModelEngineStore();
  const store = readBusinessModelEngineStore();
  if (store.workspaceBilling.length > 0) return;
  mergeBusinessModelEnginePatch(buildBusinessModelEngineStorePatch());
}
