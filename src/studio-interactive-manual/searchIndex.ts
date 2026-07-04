import type { ManualSearchEntry } from './types';
import { getAllManualModules } from './registry';
import { STUDIO_MANUAL_WHATS_NEW } from './whatsNew';

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
    }
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
  return index
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
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.entry);
}

export function getSuggestedNextModule(completedModuleIds: string[]): string | undefined {
  const order = ['mission-control', 'asset-factory', 'asset-director', 'brand-assets', 'blueprint-manager'];
  return order.find((id) => !completedModuleIds.includes(id));
}
