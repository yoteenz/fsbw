import type { ManualSearchEntry } from './types';
import { getAllManualModules } from './registry';
import { STUDIO_MANUAL_WHATS_NEW } from './whatsNew';
import { searchKnowledgeGraph } from './knowledge-graph/queries';

export function buildManualSearchIndex(): ManualSearchEntry[] {
  const entries: ManualSearchEntry[] = [];
  for (const mod of getAllManualModules()) {
    for (const step of mod.steps) {
      entries.push({
        id: `${mod.id}:${step.id}`,
        query: step.title,
        keywords: [
          step.title.toLowerCase(),
          step.body.toLowerCase(),
          mod.customerName.toLowerCase(),
          mod.id,
          ...(step.sectionId ? [step.sectionId] : []),
          ...(step.widgetId ? [step.widgetId] : []),
        ],
        moduleId: mod.id,
        stepId: step.id,
        label: `${mod.customerName} · ${step.title}`,
        snippet: step.body.slice(0, 140),
      });
    }
  }

  entries.push(
    {
      id: 'search-approvals',
      query: 'How do approvals work?',
      keywords: ['approvals', 'approve', 'how do approvals work', 'asset approval'],
      moduleId: 'asset-factory',
      stepId: 'asset-approval',
      label: 'ASSET APPROVAL',
      snippet: 'Approved outputs auto-populate Asset Director — never skip human review.',
    },
    {
      id: 'search-exports',
      query: 'How do exports work?',
      keywords: ['exports', 'export templates', 'how do exports work'],
      moduleId: 'asset-director',
      stepId: 'workflows',
      label: 'EXPORT WORKFLOW',
      snippet: 'Master hero → crops → media kit → export templates → publishing.',
    },
    {
      id: 'search-asset-factory',
      query: 'How does Asset Factory work?',
      keywords: ['asset factory', 'how does asset factory work', 'factory floor'],
      moduleId: 'asset-factory',
      stepId: 'overview',
      label: 'ASSET FACTORY OVERVIEW',
      snippet: 'Manufacturing department — blueprint to approved assets.',
    },
    {
      id: 'search-variants',
      query: 'How do variants inherit?',
      keywords: ['variants inherit', 'variant inheritance', 'photography bible'],
      moduleId: 'brand-assets',
      stepId: 'variants-inherit',
      label: 'VARIANT INHERITANCE',
      snippet: 'Child SKUs inherit master hero rules from the Photography Bible.',
    },
    {
      id: 'search-templates',
      query: 'How do templates update?',
      keywords: ['templates update', 'blueprint', 'template factory'],
      moduleId: 'blueprint-manager',
      stepId: 'overview',
      label: 'BLUEPRINT MANAGER',
      snippet: 'Edit specs in Blueprint Manager — factory reads APPROVED blueprints only.',
    },
    {
      id: 'search-creative-dna',
      query: 'What is Creative DNA?',
      keywords: ['creative dna', 'what is creative dna', 'approved prompt'],
      moduleId: 'photography-bible',
      stepId: 'overview',
      label: 'CREATIVE DNA',
      snippet: 'Locked photography rules — prompt, bust, editorial reference.',
    },
    {
      id: 'search-cart-images',
      query: 'Where do cart images come from?',
      keywords: ['cart images', 'where do cart images come from', 'smart asset'],
      moduleId: 'brand-assets-asset-factory',
      stepId: 'overview',
      label: 'SMART ASSET REGISTRY',
      snippet: 'Context-aware images from approved masters via Asset Factory.',
    },
    {
      id: 'search-fallback',
      query: 'What does FALLBACK_USED mean?',
      keywords: ['fallback_used', 'what does fallback_used mean'],
      moduleId: 'brand-assets-asset-factory',
      label: 'FALLBACK_USED',
      snippet: 'Variant missing — registry shows safe fallback; check pipeline.',
    },
    {
      id: 'search-baw-orders',
      query: 'How does Build-A-Wig connect to orders?',
      keywords: ['build-a-wig connect to orders', 'baw snapshot', 'variant lookup'],
      moduleId: 'brand-assets-asset-factory',
      label: 'BAW VISUAL SNAPSHOT',
      snippet: 'Configuration → Smart Asset Registry → cart → checkout → order.',
    },
    {
      id: 'search-vouchers-admin',
      query: 'How do vouchers work?',
      keywords: ['how do vouchers work', 'voucher history'],
      moduleId: 'tutorial-os',
      label: 'CUSTOMER VOUCHERS (ONBOARDING TUTORIAL)',
      snippet: 'Customer-facing — see Onboarding Tutorial Mansion Tour.',
    },
  );

  for (const w of STUDIO_MANUAL_WHATS_NEW) {
    entries.push({
      id: `whats-new-${w.id}`,
      query: w.title,
      keywords: [w.title.toLowerCase(), w.summary.toLowerCase(), 'whats new', w.moduleId],
      moduleId: w.moduleId,
      stepId: w.highlightStepId,
      label: `NEW · ${w.title}`,
      snippet: w.summary,
    });
  }

  return entries;
}

export function searchManualIndex(query: string, limit = 10): ManualSearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const index = buildManualSearchIndex();
  const stepScored = index
    .map((entry) => {
      let score = 0;
      if (entry.query.toLowerCase().includes(q)) score += 10;
      if (entry.label.toLowerCase().includes(q)) score += 8;
      for (const kw of entry.keywords) {
        if (kw.includes(q)) score += 4;
        if (q.split(/\s+/).every((w) => kw.includes(w))) score += 6;
      }
      return { entry, score };
    })
    .filter((x) => x.score > 0);

  const graphScored = searchKnowledgeGraph(q, limit).map((g) => ({
    entry: {
      id: g.id,
      query: g.label,
      keywords: [],
      moduleId: g.moduleId ?? g.nodeId,
      stepId: undefined,
      label: g.label,
      snippet: g.snippet,
    } satisfies ManualSearchEntry,
    score: g.score,
  }));

  return [...stepScored, ...graphScored]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.entry);
}

export function getSuggestedNextModule(completedModuleIds: string[]): string | undefined {
  const order = ['mission-control', 'asset-factory', 'asset-director', 'brand-assets', 'blueprint-manager'];
  return order.find((id) => !completedModuleIds.includes(id));
}
