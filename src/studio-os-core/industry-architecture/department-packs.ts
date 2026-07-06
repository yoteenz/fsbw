import { UNIVERSAL_MARKETING_PACK_ID } from './constants';
import { listIndustryDefinitions } from './industries';
import type { DepartmentPackDefinition, IndustryId } from './types';

function dept(
  id: string,
  label: string,
  description: string,
  opts?: { moduleId?: string; wingLabel?: string; icon?: string; kpiLabel?: string; kpiValue?: string }
) {
  return { id, label, description, ...opts };
}

function concierge(id: string, name: string, role: string, departmentId: string, focus: string) {
  return { id, name, role, departmentId, focus };
}

export const DEPARTMENT_PACKS: DepartmentPackDefinition[] = [
  {
    id: 'creator-pack',
    kind: 'department-pack',
    name: 'CREATOR PACK',
    tagline: 'Research · writing · production · publishing · distribution',
    description: 'Complete AI media operating center for educational and entertainment creators.',
    defaultForIndustries: ['creator'],
    recommendedForIndustries: ['creator', 'agency', 'education'],
    featured: true,
    installPreview: 'Adds Production Wing, Publishing Wing, Media Library, Distribution Center, and Creator Analytics.',
    outcome: {
      departmentsAdded: [
        dept('production-wing', 'PRODUCTION', 'Screening Room · Render Queue · Production Studio', { wingLabel: 'PRODUCTION WING', moduleId: 'production-studio', icon: '🎬' }),
        dept('research', 'RESEARCH', 'Topic intelligence · audience gaps · trend signals', { moduleId: 'content-brain', icon: '🔬' }),
        dept('writing', 'WRITING', 'Scripts · captions · editorial standards', { moduleId: 'writing-bible', icon: '✍️' }),
        dept('publishing', 'PUBLISHING', 'Approval flow · scheduling · publishing queue', { moduleId: 'publishing-queue', icon: '📅' }),
        dept('distribution', 'DISTRIBUTION', 'Multi-platform distribution network', { moduleId: 'distribution-network', icon: '🚀' }),
        dept('media-library', 'MEDIA LIBRARY', 'Asset library · versions · reuse', { moduleId: 'asset-library', icon: '📚' }),
        dept('creator-analytics', 'CREATOR ANALYTICS', 'Performance · retention · experiments', { moduleId: 'analytics', icon: '📊' }),
        dept('knowledge', 'KNOWLEDGE', 'Institutional memory · knowledge graph', { moduleId: 'knowledge-hub', icon: '🧠' }),
        dept('experiments', 'EXPERIMENTS', 'Labs · A/B · hook testing', { moduleId: 'labs', icon: '🧪' }),
      ],
      conciergesAdded: [
        concierge('cc-production', 'Production Concierge', 'PRODUCTION CONCIERGE', 'production-wing', 'Scene readiness · render queue · approvals'),
        concierge('cc-research', 'Research Concierge', 'RESEARCH CONCIERGE', 'research', 'Topic gaps · competitive scan'),
        concierge('cc-publishing', 'Publishing Concierge', 'PUBLISHING CONCIERGE', 'publishing', 'Schedule · approval gates'),
        concierge('cc-distribution', 'Distribution Concierge', 'DISTRIBUTION CONCIERGE', 'distribution', 'Platform packaging · post timing'),
      ],
      navModuleIds: ['production-studio', 'render-queue', 'screening-room', 'publishing-queue', 'distribution-network', 'asset-library', 'analytics', 'knowledge-hub', 'labs', 'content-brain'],
      kpiLabels: ['PAGES IN PRODUCTION', 'PUBLISHING TODAY', 'DISTRIBUTION REACH', 'EXPERIMENTS ACTIVE'],
      commandDockCapabilities: ['publishing', 'production', 'distribution', 'experiments'],
      automationRules: ['Auto-route approved assets to publishing queue', 'Flag thumbnail bottlenecks > 24h'],
    },
  },
  {
    id: 'beauty-pack',
    kind: 'department-pack',
    name: 'BEAUTY PACK',
    tagline: 'Orders · bookings · memberships · customer experience',
    description: 'Luxury commerce headquarters for beauty brands and premium retail.',
    defaultForIndustries: ['beauty', 'ecommerce', 'fitness'],
    recommendedForIndustries: ['beauty', 'ecommerce', 'fitness'],
    featured: true,
    installPreview: 'Adds Orders, Inventory, Bookings, Memberships, Rewards, CRM, and Customer Experience wings.',
    outcome: {
      departmentsAdded: [
        dept('orders', 'ORDERS', 'Active · past · fulfillment tracking', { kpiLabel: 'ACTIVE ORDERS', kpiValue: '—', icon: '📦' }),
        dept('inventory', 'INVENTORY', 'Units · stock · replenishment', { icon: '🏷️' }),
        dept('bookings', 'BOOKINGS', 'Consults · installs · calendar', { icon: '📅' }),
        dept('memberships', 'MEMBERSHIPS', 'Tiers · subscriptions · renewals', { icon: '💎' }),
        dept('rewards', 'REWARDS', 'Loyalty · slay challenge · vouchers', { icon: '🎁' }),
        dept('crm', 'CRM', 'Client profiles · lifecycle · alerts', { icon: '🤝' }),
        dept('customer-experience', 'CUSTOMER EXPERIENCE', 'Concierge · support · delight', { icon: '✨' }),
        dept('finance', 'FINANCE', 'Revenue · payouts · forecasting', { moduleId: 'revenue', icon: '💰' }),
      ],
      conciergesAdded: [
        concierge('bc-orders', 'Orders Concierge', 'ORDERS CONCIERGE', 'orders', 'Fulfillment · exceptions · VIP routing'),
        concierge('bc-bookings', 'Bookings Concierge', 'BOOKINGS CONCIERGE', 'bookings', 'Install scheduling · consult prep'),
        concierge('bc-membership', 'Membership Concierge', 'MEMBERSHIP CONCIERGE', 'memberships', 'Tier upgrades · retention'),
      ],
      navModuleIds: ['revenue', 'audience-brain', 'relationship-engine'],
      kpiLabels: ['ORDERS TODAY', 'BOOKINGS THIS WEEK', 'MEMBERSHIP RETENTION', 'REVENUE MTD'],
      commandDockCapabilities: ['revenue', 'scheduling', 'campaigns'],
      automationRules: ['Alert on sold-out units', 'Membership renewal nudges at 14 days'],
    },
  },
  {
    id: 'contractor-pack',
    kind: 'department-pack',
    name: 'CONTRACTOR PACK',
    tagline: 'Leads · estimates · crews · invoices · operations',
    description: 'Field service headquarters for contractors, painters, and construction trades.',
    defaultForIndustries: ['contractor', 'construction', 'painting', 'landscaping', 'manufacturing', 'automotive'],
    recommendedForIndustries: ['contractor', 'construction', 'painting', 'landscaping'],
    featured: true,
    installPreview: 'Adds Lead Pipeline, Today\'s Jobs, Estimates, Crew Scheduling, and Operations wings.',
    outcome: {
      departmentsAdded: [
        dept('lead-pipeline', 'LEAD PIPELINE', 'Inbound · outbound · qualification', { kpiLabel: 'OPEN LEADS', kpiValue: '—', icon: '📥' }),
        dept('todays-jobs', "TODAY'S JOBS", 'Active routes · job status · check-ins', { icon: '🛠️' }),
        dept('estimates', 'PENDING ESTIMATES', 'Quotes · follow-up · win rate', { icon: '📋' }),
        dept('scheduling', 'CREW SCHEDULING', 'Crews · vehicles · dispatch', { icon: '🗓️' }),
        dept('crews', 'CREWS', 'Roster · skills · availability', { icon: '👷' }),
        dept('materials', 'MATERIALS', 'Inventory · orders · job costing', { icon: '🧱' }),
        dept('invoices', 'INVOICES', 'Billing · collections · AR', { icon: '🧾' }),
        dept('reviews', 'GOOGLE REVIEWS', 'Reputation · responses · campaigns', { icon: '⭐' }),
        dept('operations', 'OPERATIONS', 'Throughput · SLA · bottlenecks', { icon: '⚙️' }),
      ],
      conciergesAdded: [
        concierge('fc-leads', 'Lead Concierge', 'LEAD CONCIERGE', 'lead-pipeline', 'Speed-to-lead · qualification scripts'),
        concierge('fc-scheduling', 'Dispatch Concierge', 'DISPATCH CONCIERGE', 'scheduling', 'Route optimization · crew alerts'),
        concierge('fc-reviews', 'Reviews Concierge', 'REVIEWS CONCIERGE', 'reviews', 'Review requests · response drafts'),
      ],
      navModuleIds: ['work-orchestration', 'campaign-engine'],
      kpiLabels: ['JOBS TODAY', 'OPEN ESTIMATES', 'CREW UTILIZATION', 'REVENUE THIS WEEK'],
      commandDockCapabilities: ['scheduling', 'revenue', 'campaigns'],
      automationRules: ['Follow up estimates idle > 48h', 'Request reviews after job complete'],
    },
  },
  {
    id: 'restaurant-pack',
    kind: 'department-pack',
    name: 'RESTAURANT PACK',
    tagline: 'Reservations · kitchen · staff · loyalty',
    description: 'Service rhythm headquarters for restaurants and hospitality.',
    defaultForIndustries: ['restaurant', 'hospitality'],
    recommendedForIndustries: ['restaurant', 'hospitality'],
    installPreview: 'Adds Reservations, Kitchen, Inventory, Staff, Delivery, and Loyalty wings.',
    outcome: {
      departmentsAdded: [
        dept('reservations', 'RESERVATIONS', 'Covers · waitlist · pacing', { icon: '🍽️' }),
        dept('kitchen', 'KITCHEN', 'Tickets · prep · expo', { icon: '👨‍🍳' }),
        dept('inventory', 'INVENTORY', 'Par levels · waste · vendors', { icon: '📦' }),
        dept('staff', 'STAFF', 'Shifts · roles · coverage', { icon: '👥' }),
        dept('delivery', 'DELIVERY', 'Drivers · zones · timing', { icon: '🚗' }),
        dept('loyalty', 'LOYALTY', 'Rewards · visits · campaigns', { icon: '🎫' }),
        dept('reviews', 'REVIEWS', 'Ratings · responses · trends', { icon: '⭐' }),
        dept('payroll', 'PAYROLL', 'Tips · labor · compliance', { icon: '💵' }),
      ],
      conciergesAdded: [
        concierge('rc-service', 'Service Concierge', 'SERVICE CONCIERGE', 'reservations', 'Pacing · VIP tables · events'),
        concierge('rc-kitchen', 'Kitchen Concierge', 'KITCHEN CONCIERGE', 'kitchen', 'Ticket flow · 86 alerts'),
      ],
      navModuleIds: ['work-orchestration', 'campaign-engine'],
      kpiLabels: ['COVERS TONIGHT', 'LABOR %', 'DELIVERY ON-TIME', 'LOYALTY REDEMPTIONS'],
      commandDockCapabilities: ['scheduling', 'campaigns', 'revenue'],
      automationRules: ['Alert when labor exceeds target on slow nights'],
    },
  },
  {
    id: 'medical-pack',
    kind: 'department-pack',
    name: 'MEDICAL PACK',
    tagline: 'Patients · scheduling · billing · compliance',
    description: 'Clinical operations headquarters for medical and dental practices.',
    defaultForIndustries: ['medical', 'dental'],
    recommendedForIndustries: ['medical', 'dental'],
    installPreview: 'Adds Patients, Scheduling, Billing, Insurance, Records, and Compliance wings.',
    outcome: {
      departmentsAdded: [
        dept('patients', 'PATIENTS', 'Charts · recalls · intake', { icon: '🏥' }),
        dept('scheduling', 'SCHEDULING', 'Appointments · providers · rooms', { icon: '📅' }),
        dept('billing', 'BILLING', 'Claims · payments · AR', { icon: '💳' }),
        dept('insurance', 'INSURANCE', 'Verification · authorizations', { icon: '📄' }),
        dept('records', 'MEDICAL RECORDS', 'Documentation · imaging · notes', { icon: '📁' }),
        dept('crm', 'CRM', 'Outreach · recalls · satisfaction', { icon: '🤝' }),
        dept('compliance', 'COMPLIANCE', 'Policies · audits · training', { icon: '✅' }),
      ],
      conciergesAdded: [
        concierge('mc-scheduling', 'Scheduling Concierge', 'SCHEDULING CONCIERGE', 'scheduling', 'Recall campaigns · no-show recovery'),
        concierge('mc-billing', 'Billing Concierge', 'BILLING CONCIERGE', 'billing', 'Claim follow-up · patient balances'),
      ],
      navModuleIds: ['work-orchestration', 'governance'],
      kpiLabels: ['APPOINTMENTS TODAY', 'CLAIMS PENDING', 'RECALL DUE', 'COLLECTION RATE'],
      commandDockCapabilities: ['scheduling', 'compliance'],
      automationRules: ['Recall patients overdue > 6 months'],
    },
  },
  {
    id: 'agency-pack',
    kind: 'department-pack',
    name: 'AGENCY PACK',
    tagline: 'Clients · projects · creative · reporting',
    description: 'Client delivery headquarters for agencies and professional services.',
    defaultForIndustries: ['agency', 'law-firm', 'real-estate', 'insurance', 'financial-services', 'nonprofit', 'education'],
    recommendedForIndustries: ['agency', 'law-firm', 'real-estate'],
    installPreview: 'Adds Clients, Projects, Approvals, Creative, Publishing, and Reporting wings.',
    outcome: {
      departmentsAdded: [
        dept('clients', 'CLIENTS', 'Accounts · health · renewals', { icon: '🤝' }),
        dept('projects', 'PROJECTS', 'Scopes · timelines · deliverables', { icon: '📁' }),
        dept('approvals', 'APPROVALS', 'Review gates · sign-off chains', { icon: '✅' }),
        dept('creative', 'CREATIVE', 'Concepts · assets · revisions', { moduleId: 'creative-director', icon: '🎨' }),
        dept('publishing', 'PUBLISHING', 'Deliverables · client portals', { icon: '📤' }),
        dept('reporting', 'REPORTING', 'Dashboards · ROI · retrospectives', { moduleId: 'analytics', icon: '📊' }),
        dept('invoices', 'INVOICES', 'Billing · utilization · margins', { icon: '🧾' }),
        dept('crm', 'CRM', 'Pipeline · outreach · nurture', { icon: '📈' }),
      ],
      conciergesAdded: [
        concierge('ac-clients', 'Client Concierge', 'CLIENT CONCIERGE', 'clients', 'Account health · renewal risk'),
        concierge('ac-creative', 'Creative Concierge', 'CREATIVE CONCIERGE', 'creative', 'Brief clarity · revision routing'),
      ],
      navModuleIds: ['creative-director', 'campaign-engine', 'work-orchestration', 'analytics'],
      kpiLabels: ['ACTIVE PROJECTS', 'APPROVALS PENDING', 'UTILIZATION', 'REVENUE PIPELINE'],
      commandDockCapabilities: ['campaigns', 'scheduling', 'strategy'],
      automationRules: ['Escalate approvals idle > 72h'],
    },
  },
  {
    id: UNIVERSAL_MARKETING_PACK_ID,
    kind: 'department-pack',
    name: 'MARKETING DEPARTMENT',
    tagline: 'Universal · industry-aware · always on',
    description: 'Every organization receives Marketing — automatically adapted to your business model.',
    defaultForIndustries: [] as IndustryId[],
    recommendedForIndustries: listIndustryDefinitions().map((i) => i.id),
    installPreview: 'Google Ads · Meta · TikTok · SEO · email · SMS · offers · audience intelligence — adapted to your industry.',
    outcome: {
      departmentsAdded: [
        dept('marketing', 'MARKETING', 'Campaigns · ads · SEO · offers · audience intelligence', { moduleId: 'campaign-engine', icon: '📣', kpiLabel: 'CAMPAIGNS ACTIVE', kpiValue: '—' }),
      ],
      conciergesAdded: [
        concierge('mc-marketing', 'Marketing Concierge', 'MARKETING CONCIERGE', 'marketing', 'Channel mix · seasonal campaigns · local demand signals'),
      ],
      navModuleIds: ['campaign-engine', 'audience-brain', 'growth-architect'],
      kpiLabels: ['CAMPAIGN ROI', 'AD SPEND MTD', 'LOCAL DEMAND SIGNAL', 'REFERRAL RATE'],
      commandDockCapabilities: ['campaigns', 'analytics', 'strategy'],
      automationRules: ['Surface seasonal demand shifts', 'Recommend offer timing from industry benchmarks'],
    },
  },
];

export function isUniversalMarketingPack(packId: string): boolean {
  return packId === UNIVERSAL_MARKETING_PACK_ID;
}
