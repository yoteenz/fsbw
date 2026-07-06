import { buildExpansionInstallPlan } from './install-engine';
import { getPackDefinition } from './pack-registry';
import type { DockExpansionRecommendation } from './types';

const DOCK_EXPANSION_TRIGGERS: Array<{
  patterns: RegExp[];
  packId: string;
  response: string;
}> = [
  {
    patterns: [/post(ing)?\s+(video|content|educational)/i, /start\s+(making|creating)\s+videos/i, /creator\s+studio/i],
    packId: 'creator-studio',
    response:
      'I recommend expanding Headquarters with Creator Studio — Production Wing, Publishing Wing, Media Library, Distribution Center, and Research Lab. Nothing else in your organization changes.',
  },
  {
    patterns: [/sales\s+crm/i, /pipeline/i, /follow\s*up\s+leads/i],
    packId: 'sales-crm',
    response:
      'Your sales team is manually following up with leads. Sales CRM permanently adds Pipeline, Sequences, and Proposals — then you can activate Lead Concierge from Digital Payroll.',
  },
  {
    patterns: [/warehouse/i, /fulfillment/i, /inventory/i],
    packId: 'warehouse',
    response:
      'Warehouse permanently expands Headquarters with Receiving, Inventory Center, Shipping, Materials, and Storage wings.',
  },
  {
    patterns: [/accounting/i, /books/i, /month\s*end/i],
    packId: 'accounting',
    response:
      'Accounting adds Finance Wing, Payroll, Forecasting, and Reporting — a permanent department, not a software subscription.',
  },
  {
    patterns: [/hiring/i, /recruit/i, /onboarding/i],
    packId: 'hiring-suite',
    response: 'Hiring Suite adds Recruiting and Onboarding wings — your organization grows its HR department permanently.',
  },
  {
    patterns: [/automation/i, /workflow/i],
    packId: 'automation-engine',
    response: 'Automation Engine connects departments with cross-department rules — Headquarters intelligence, not a feature toggle.',
  },
];

export function resolveDockExpansionRecommendation(input: string): DockExpansionRecommendation | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  for (const trigger of DOCK_EXPANSION_TRIGGERS) {
    if (!trigger.patterns.some((p) => p.test(trimmed))) continue;
    const pack = getPackDefinition(trigger.packId);
    const plan = buildExpansionInstallPlan(trigger.packId);
    if (!pack || !plan) continue;
    return {
      triggerPhrase: trimmed,
      recommendedPackId: trigger.packId,
      response: trigger.response,
      previewDepartments: plan.previewDepartments,
    };
  }

  return null;
}

export function listDockExpansionSuggestions(industryId: string): string[] {
  if (industryId === 'painting' || industryId === 'contractor') {
    return [
      'I want to start posting educational painting videos.',
      'Show me open estimates needing follow-up.',
      'What marketing campaigns should I run this week?',
    ];
  }
  if (industryId === 'creator') {
    return [
      'What should I publish today?',
      'Show publishing bottlenecks.',
      'Launch an experiment on hooks.',
    ];
  }
  return [
    'What departments can I add to Headquarters?',
    'Recommend an expansion pack for my industry.',
    'Summarize installed capabilities.',
  ];
}
