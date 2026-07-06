import type { OrganizationProfessionBrain, OrganizationProfessionBrainProfile } from '../profession-brain/types';
import type { KnowledgeProduct, KnowledgeProductType } from './types';
import type { LicenseModel, VisibilityLevel } from './types';

const PRODUCT_TEMPLATES: { match: RegExp; type: KnowledgeProductType; title: string; visibility: VisibilityLevel; license: LicenseModel; price: number }[] = [
  { match: /fuel|tax|ifta|mileage/i, type: 'checklist', title: 'Fuel Tax Audit Checklist', visibility: 'public-marketplace', license: 'single-purchase', price: 49 },
  { match: /fuel|tax|quarterly|filing/i, type: 'industry-toolkit', title: 'Quarterly Filing Toolkit', visibility: 'subscribers', license: 'monthly-subscription', price: 29 },
  { match: /bookkeep|receipt|reconcile/i, type: 'playbook', title: 'Bookkeeping Workflow Library', visibility: 'members', license: 'annual-subscription', price: 199 },
  { match: /hair|color|formulation/i, type: 'course', title: 'Hair Color Masterclass', visibility: 'public-marketplace', license: 'single-purchase', price: 149 },
  { match: /dispatch|crew|route/i, type: 'sop', title: 'Dispatch Operations Handbook', visibility: 'employees-only', license: 'organization-license', price: 0 },
  { match: /paint|estimate|surface/i, type: 'business-framework', title: 'Contractor Estimating System', visibility: 'customers', license: 'single-purchase', price: 79 },
  { match: /marketing|campaign|content/i, type: 'template', title: 'Marketing Template Pack', visibility: 'public-marketplace', license: 'single-purchase', price: 39 },
  { match: /permit|licens/i, type: 'checklist', title: 'Permit Preparation Guide', visibility: 'public-marketplace', license: 'single-purchase', price: 29 },
];

function defaultProductsForBrain(brain: OrganizationProfessionBrain, orgName: string, founder: string): KnowledgeProduct[] {
  const products: KnowledgeProduct[] = [];
  const now = new Date().toISOString();

  for (const tpl of PRODUCT_TEMPLATES) {
    const hits = brain.knowledgeEntries.some((e) => tpl.match.test(e.title) || tpl.match.test(e.what));
    if (!hits && brain.definitionId !== 'marketing' && brain.definitionId !== 'hair-color') continue;
    if (tpl.match.test(brain.label) || hits) {
      products.push({
        id: `kp-${brain.id}-${tpl.type}-${tpl.title.replace(/\s+/g, '-').toLowerCase()}`,
        brainId: brain.id,
        type: tpl.type,
        title: tpl.title.includes(brain.label.split(' ')[0]) ? tpl.title : `${brain.label.split(' ')[0]} · ${tpl.title}`,
        description: `Generated from ${brain.label} — organizational expertise as intellectual property.`,
        visibility: tpl.visibility,
        licenseModel: tpl.license,
        priceUsd: tpl.price,
        published: tpl.visibility === 'public-marketplace' && brain.maturityPct >= 50,
        sourceEntryIds: brain.knowledgeEntries.slice(0, 4).map((e) => e.id),
        version: '1.0.0',
        owner: founder,
        status: brain.maturityPct >= 50 ? 'published' : 'draft',
        audience: tpl.visibility,
        performanceScore: Math.min(100, brain.maturityPct + 15),
        revenueUsd: tpl.price * (brain.maturityPct >= 60 ? 12 : 3),
        usageCount: brain.knowledgeEntries.length * 4,
        rating: 4.2 + brain.maturityPct / 200,
        reviewCount: Math.floor(brain.maturityPct / 10),
        dependencies: [`brain-${brain.id}`],
        updatedAt: now,
      });
    }
  }

  products.push({
    id: `kp-${brain.id}-ai-expert`,
    brainId: brain.id,
    type: 'ai-expert-experience',
    title: `${brain.label.replace(' Brain', '')} Expert`,
    description: `AI Expert Experience powered by ${orgName} Profession Brain™ — not generic AI.`,
    visibility: 'public-marketplace',
    licenseModel: 'monthly-subscription',
    priceUsd: 19,
    published: brain.maturityPct >= 40,
    sourceEntryIds: brain.knowledgeEntries.map((e) => e.id),
    version: '1.0.0',
    owner: founder,
    status: 'published',
    audience: 'customers',
    performanceScore: brain.maturityPct,
    revenueUsd: brain.maturityPct * 8,
    usageCount: brain.knowledgeEntries.length * 10,
    rating: 4.5,
    reviewCount: 8,
    dependencies: [],
    updatedAt: now,
  });

  return products;
}

export function buildKnowledgeProductsFromProfile(
  profile: OrganizationProfessionBrainProfile,
  founder = 'Founder'
): KnowledgeProduct[] {
  return profile.brains.flatMap((brain) =>
    defaultProductsForBrain(brain, profile.companyName, founder)
  );
}
