import { MONITORING_CATEGORIES } from './constants';
import { computeCategoryRelevance, getIndustryFilterProfile, shouldSurfaceSignal } from './org-filter';
import type { MonitoringCategory, WorldKnowledgeSignal } from './types';

function signalId(category: string, suffix: string): string {
  return `wke-${category}-${suffix}`;
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

type SignalTemplate = {
  category: MonitoringCategory;
  headline: string;
  summary: string;
  whyItMatters: (company: string, industry: string) => string;
  impact: WorldKnowledgeSignal['impact'];
  industries?: string[];
};

const SIGNAL_TEMPLATES: SignalTemplate[] = [
  {
    category: 'legislation',
    headline: 'New regulatory framework announced for professional services',
    summary: 'Federal and state agencies published updated compliance requirements affecting licensed professionals.',
    whyItMatters: (_, industry) =>
      `Legislative updates directly affect ${industry.replace(/-/g, ' ')} operations — review before next client cycle.`,
    impact: 'risk',
    industries: ['law-firm', 'medical', 'dental', 'financial-services', 'insurance'],
  },
  {
    category: 'government-regulations',
    headline: 'Contractor licensing requirements updated in key markets',
    summary: 'Several states revised contractor credential and insurance minimums effective this quarter.',
    whyItMatters: () => 'Non-compliance risks project delays and penalties — verify your licenses and bonds.',
    impact: 'risk',
    industries: ['painting', 'contractor', 'construction', 'landscaping'],
  },
  {
    category: 'market-trends',
    headline: 'Material pricing index shifted — supply chain normalization continues',
    summary: 'Construction and manufacturing input costs show regional variation; housing starts influence demand.',
    whyItMatters: () => 'Quote accuracy and margin protection depend on current material pricing — adjust estimates.',
    impact: 'neutral',
    industries: ['painting', 'contractor', 'construction', 'manufacturing'],
  },
  {
    category: 'consumer-behavior',
    headline: 'Beauty and personal care spending patterns shift toward premium experiences',
    summary: 'Consumers prioritize authenticity, sustainability claims, and social proof in purchase decisions.',
    whyItMatters: (company) => `${company} can align campaigns with emerging purchase drivers before competitors.`,
    impact: 'opportunity',
    industries: ['beauty', 'creator', 'ecommerce'],
  },
  {
    category: 'social-trends',
    headline: 'Short-form video formats driving discovery in beauty and lifestyle categories',
    summary: 'Platform algorithms favor authentic creator content; engagement peaks on tutorial and transformation formats.',
    whyItMatters: (company) => `Content strategy for ${company} should reflect where your audience discovers brands today.`,
    impact: 'opportunity',
    industries: ['beauty', 'creator', 'agency'],
  },
  {
    category: 'competitor-activity',
    headline: 'Regional competitor launched bundled service offering',
    summary: 'A competitor in your market announced a similar service package with promotional pricing.',
    whyItMatters: (company) => `${company} should evaluate differentiation before the campaign gains traction.`,
    impact: 'risk',
  },
  {
    category: 'artificial-intelligence',
    headline: 'New AI workflow could automate document preparation in your industry',
    summary: 'Emerging tools reduce manual preparation time for reports, proposals, and client communications.',
    whyItMatters: () => 'Evaluate automation against your Profession Brain™ — preserve judgment, automate routine work.',
    impact: 'opportunity',
  },
  {
    category: 'technology-advances',
    headline: 'Legal technology platform releases matter-management integration',
    summary: 'Major legal tech vendor shipped AI-assisted research connected to case management systems.',
    whyItMatters: () => 'Legal technology advances can reduce research hours — assess fit with your workflows.',
    impact: 'opportunity',
    industries: ['law-firm'],
  },
  {
    category: 'platform-updates',
    headline: 'Social platform policy update affects business account reach',
    summary: 'Algorithm and advertising policy changes impact organic reach and promoted content requirements.',
    whyItMatters: (company) => `${company} marketing should adapt before next campaign launch.`,
    impact: 'neutral',
    industries: ['creator', 'beauty', 'ecommerce', 'agency'],
  },
  {
    category: 'economic-indicators',
    headline: 'Consumer confidence and housing indicators mixed by region',
    summary: 'Economic data suggests uneven demand across markets — monitor your primary service areas.',
    whyItMatters: () => 'Pipeline forecasting should reflect regional economic conditions, not national averages alone.',
    impact: 'neutral',
  },
  {
    category: 'professional-certifications',
    headline: 'Continuing education requirements updated for licensed professionals',
    summary: 'Professional boards published revised CE hour requirements and approved course lists.',
    whyItMatters: () => 'Maintain certifications proactively — compliance gaps create operational risk.',
    impact: 'risk',
    industries: ['law-firm', 'medical', 'dental', 'financial-services'],
  },
  {
    category: 'software-updates',
    headline: 'Critical security patch released for widely used business software',
    summary: 'Vendor issued urgent update addressing authentication vulnerability in enterprise deployments.',
    whyItMatters: () => 'Apply security patches promptly — unpatched systems are common breach vectors.',
    impact: 'risk',
  },
  {
    category: 'security-risks',
    headline: 'Industry-targeted phishing campaign reported this week',
    summary: 'Security researchers identified credential-harvesting emails mimicking professional service vendors.',
    whyItMatters: () => 'Brief your team — one compromised account can affect client data and reputation.',
    impact: 'risk',
  },
  {
    category: 'industry-news',
    headline: 'Trade association publishes annual industry outlook',
    summary: 'Sector leaders summarize growth projections, headwinds, and investment priorities for the year ahead.',
    whyItMatters: (company) => `Strategic planning for ${company} should reference the latest industry outlook.`,
    impact: 'neutral',
  },
];

export function buildMonitoredSignals(
  organizationId: string,
  companyName: string,
  industryId: string
): WorldKnowledgeSignal[] {
  const filter = getIndustryFilterProfile(industryId);
  const signals: WorldKnowledgeSignal[] = [];

  SIGNAL_TEMPLATES.forEach((template, i) => {
    if (template.industries && !template.industries.includes(industryId)) return;

    const relevancePct = Math.min(
      99,
      computeCategoryRelevance(template.category, industryId) + (template.industries?.includes(industryId) ? 12 : 0)
    );

    signals.push({
      id: signalId(template.category, `${organizationId}-${i}`),
      category: template.category,
      headline: template.headline,
      summary: template.summary,
      whyItMatters: template.whyItMatters(companyName, industryId),
      relevancePct,
      publishedAt: daysAgo(i % 3),
      sourceLabel: 'World Knowledge Engine™ Monitor',
      impact: template.impact,
      industrySpecific: Boolean(template.industries?.includes(industryId)),
    });
  });

  MONITORING_CATEGORIES.forEach((category, i) => {
    if (signals.some((s) => s.category === category)) return;
    const relevancePct = computeCategoryRelevance(category, industryId);
    if (!shouldSurfaceSignal(relevancePct)) return;

    signals.push({
      id: signalId(category, `${organizationId}-fill-${i}`),
      category,
      headline: `${filter.exampleFocus[0] ?? 'Industry'} update — ${category.replace(/-/g, ' ')}`,
      summary: `Continuous monitoring detected developments in ${category.replace(/-/g, ' ')} relevant to ${industryId.replace(/-/g, ' ')} organizations.`,
      whyItMatters: `Filtered for ${companyName} — only intelligence that affects your organization is surfaced.`,
      relevancePct,
      publishedAt: daysAgo(i + 1),
      sourceLabel: 'World Knowledge Engine™ Monitor',
      impact: 'neutral',
      industrySpecific: filter.priorityCategories.includes(category),
    });
  });

  return signals.sort((a, b) => b.relevancePct - a.relevancePct);
}

export function filterSignalsForOrganization(signals: WorldKnowledgeSignal[]): WorldKnowledgeSignal[] {
  return signals.filter((s) => shouldSurfaceSignal(s.relevancePct));
}

export function summarizeFilteredSignals(signals: WorldKnowledgeSignal[]): string {
  if (signals.length === 0) return 'Monitoring the outside world — relevant intelligence will surface as context accumulates.';
  const top = signals[0];
  return `${signals.length} relevant signal(s) · Top: ${top.headline} (${top.relevancePct}% relevance).`;
}
