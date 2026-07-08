import { PRODUCTION_CHECKLIST_TEMPLATES, PRODUCTION_QUALITY_GATE_STAGES } from './constants';
import { inferProductionFeatureScope, scopeMentionsDepartment } from './scope-inference';
import type {
  ProductionChecklistItem,
  ProductionCompletionChecklist,
  ProductionCompletionScopeInput,
  ProductionFeatureScope,
  ProductionQualityGateStage,
  QualityGateEvaluation,
} from './types';

function nextGate(stage: ProductionQualityGateStage): ProductionQualityGateStage | null {
  const idx = PRODUCTION_QUALITY_GATE_STAGES.indexOf(stage);
  if (idx < 0 || idx >= PRODUCTION_QUALITY_GATE_STAGES.length - 1) return null;
  return PRODUCTION_QUALITY_GATE_STAGES[idx + 1]!;
}

function itemsForGate(items: ProductionChecklistItem[], gate: ProductionQualityGateStage): ProductionChecklistItem[] {
  return items.filter((item) => item.applicable && item.gateStage === gate);
}

export function buildChecklistItems(
  scope: ProductionFeatureScope,
  intentText: string,
  existingPassed?: Record<string, boolean>
): ProductionChecklistItem[] {
  const includeDepartment = scopeMentionsDepartment(scope, intentText);

  return PRODUCTION_CHECKLIST_TEMPLATES.filter((template) => {
    if (template.id === 'department-registered') return includeDepartment;
    return template.applies(scope);
  }).map((template) => ({
    id: template.id,
    category: template.category,
    label: template.label,
    gateStage: template.gateStage,
    required: template.required,
    applicable: true,
    passed: existingPassed?.[template.id] ?? false,
  }));
}

export function buildProductionCompletionChecklist(
  input: ProductionCompletionScopeInput,
  options?: {
    currentGate?: ProductionQualityGateStage;
    existingPassed?: Record<string, boolean>;
    approvedBy?: string | null;
    completionTimestamp?: string | null;
    readyForReview?: boolean;
  }
): ProductionCompletionChecklist {
  const scope = inferProductionFeatureScope({
    founderIntent: input.founderIntent,
    architectureOutput: input.architectureOutput,
    requiresAssets: input.requiresAssets,
    requiresMotion: input.requiresMotion,
    scopeOverrides: input.scopeOverrides,
  });

  const items = buildChecklistItems(scope, input.founderIntent, options?.existingPassed);
  const currentGate = options?.currentGate ?? 'architecture';

  const applicable = items.filter((i) => i.applicable);
  const requiredApplicable = applicable.filter((i) => i.required);
  const requiredPassed = requiredApplicable.filter((i) => i.passed).length;
  const completionPct =
    requiredApplicable.length === 0
      ? 0
      : Math.round((requiredPassed / requiredApplicable.length) * 100);

  const gateEval = evaluateQualityGate(items, currentGate);

  return {
    items,
    completionPct,
    currentGate,
    nextGate: gateEval.gateComplete ? nextGate(currentGate) : nextGate(currentGate),
    gateBlocked: !gateEval.gateComplete,
    blockingLabels: gateEval.blockingLabels,
    readyForReview: options?.readyForReview ?? (gateEval.gateComplete && currentGate === 'quality-assurance'),
    owner: input.owner ?? 'Founder',
    assignedModel: input.assignedModel ?? 'composer-2.5',
    approvedBy: options?.approvedBy ?? null,
    completionTimestamp: options?.completionTimestamp ?? null,
  };
}

export function evaluateQualityGate(
  items: ProductionChecklistItem[],
  gate: ProductionQualityGateStage
): QualityGateEvaluation {
  const gateItems = itemsForGate(items, gate);
  const required = gateItems.filter((i) => i.required);
  const requiredPassed = required.filter((i) => i.passed);
  const blocking = required.filter((i) => !i.passed);

  return {
    canAdvance: blocking.length === 0,
    gateComplete: blocking.length === 0,
    blockingLabels: blocking.map((i) => i.label),
    requiredRemaining: blocking.length,
    requiredTotal: required.length,
    requiredPassed: requiredPassed.length,
  };
}

export function evaluateFullCompletion(items: ProductionChecklistItem[]): {
  complete: boolean;
  completionPct: number;
  blockingLabels: string[];
} {
  const applicable = items.filter((i) => i.applicable);
  const required = applicable.filter((i) => i.required);
  const blocking = required.filter((i) => !i.passed);
  const completionPct =
    required.length === 0 ? 0 : Math.round(((required.length - blocking.length) / required.length) * 100);

  return {
    complete: blocking.length === 0,
    completionPct,
    blockingLabels: blocking.map((i) => i.label),
  };
}

export function toggleChecklistItemPassed(
  checklist: ProductionCompletionChecklist,
  itemId: string,
  passed: boolean
): ProductionCompletionChecklist {
  const items = checklist.items.map((item) =>
    item.id === itemId ? { ...item, passed } : item
  );
  const full = evaluateFullCompletion(items);
  const gateEval = evaluateQualityGate(items, checklist.currentGate);

  return {
    ...checklist,
    items,
    completionPct: full.completionPct,
    gateBlocked: !gateEval.gateComplete,
    blockingLabels: gateEval.blockingLabels,
    readyForReview: gateEval.gateComplete && checklist.currentGate === 'quality-assurance',
  };
}

export function advanceQualityGate(
  checklist: ProductionCompletionChecklist
): { checklist: ProductionCompletionChecklist; advanced: boolean; reason?: string } {
  const gateEval = evaluateQualityGate(checklist.items, checklist.currentGate);
  if (!gateEval.canAdvance) {
    return {
      checklist,
      advanced: false,
      reason: `Quality Gate™ blocked — ${gateEval.blockingLabels.slice(0, 3).join('; ')}`,
    };
  }

  const next = nextGate(checklist.currentGate);
  if (!next) {
    return { checklist, advanced: false, reason: 'Already at Complete.' };
  }

  const updated: ProductionCompletionChecklist = {
    ...checklist,
    currentGate: next,
    nextGate: nextGate(next),
    gateBlocked: false,
    blockingLabels: [],
    readyForReview: next === 'founder-review',
    completionTimestamp: next === 'complete' ? new Date().toISOString() : checklist.completionTimestamp,
  };

  const nextEval = evaluateQualityGate(updated.items, updated.currentGate);
  return {
    checklist: {
      ...updated,
      gateBlocked: !nextEval.gateComplete,
      blockingLabels: nextEval.blockingLabels,
    },
    advanced: true,
  };
}

export function mapOrchestratorStageToQualityGate(
  stage: string
): ProductionQualityGateStage {
  if (stage.startsWith('architecture') || stage === 'idea') return 'architecture';
  if (stage.startsWith('implementation') || stage === 'composer-running' || stage === 'implementation-ready') {
    return 'implementation';
  }
  if (stage === 'assets-needed' || stage === 'motion-needed') return 'integration';
  if (stage === 'review-needed') return 'quality-assurance';
  if (stage === 'approved') return 'founder-review';
  if (stage === 'archived') return 'complete';
  return 'architecture';
}

export function syncChecklistGateFromOrchestratorStage(
  checklist: ProductionCompletionChecklist,
  orchestratorStage: string
): ProductionCompletionChecklist {
  const mapped = mapOrchestratorStageToQualityGate(orchestratorStage);
  if (mapped === checklist.currentGate) return checklist;
  return {
    ...checklist,
    currentGate: mapped,
    nextGate: nextGate(mapped),
    gateBlocked: !evaluateQualityGate(checklist.items, mapped).gateComplete,
    blockingLabels: evaluateQualityGate(checklist.items, mapped).blockingLabels,
    readyForReview: mapped === 'quality-assurance' || mapped === 'founder-review',
  };
}

export function formatCompletionSummary(checklist: ProductionCompletionChecklist): string {
  const gate = checklist.currentGate.replace(/-/g, ' ');
  if (checklist.gateBlocked) {
    return `Quality Gate™ paused at ${gate} — ${checklist.blockingLabels.length} checkpoint${checklist.blockingLabels.length === 1 ? '' : 's'} remain.`;
  }
  return `Production Completion™ ${checklist.completionPct}% — ${gate} gate clear.`;
}
