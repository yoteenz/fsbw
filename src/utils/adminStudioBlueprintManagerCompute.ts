import type { BlueprintDefinition, ChecklistItemStatus } from './adminStudioBlueprintManagerDemo';

export type FactoryReadinessDimension = {
  id: string;
  label: string;
  score: number;
  complete: boolean;
};

export function computeFactoryReadiness(bp: BlueprintDefinition): {
  dimensions: FactoryReadinessDimension[];
  overall: number;
  eligible: boolean;
} {
  const checklistReady = bp.checklist.filter((c) => c.status === 'ready').length;
  const checklistTotal = bp.checklist.length || 1;
  const checklistScore = Math.round((checklistReady / checklistTotal) * 100);

  const promptComplete = bp.promptStack.length >= 4;
  const depsComplete = bp.dependencies.length >= 2;
  const workspaceRules = Boolean(bp.metadata.owner || bp.identity.workspace);
  const brandRules = bp.promptStack.some((p) => p.label.includes('BRAND'));
  const validationReady = bp.validationRules.length >= 5;
  const blueprintComplete = checklistScore >= 80;

  const dimensions: FactoryReadinessDimension[] = [
    { id: 'bp', label: 'BLUEPRINT COMPLETE', score: checklistScore, complete: blueprintComplete },
    { id: 'prompt', label: 'PROMPT COMPLETE', score: promptComplete ? 100 : Math.round((bp.promptStack.length / 6) * 100), complete: promptComplete },
    { id: 'deps', label: 'DEPENDENCIES COMPLETE', score: depsComplete ? 100 : 50, complete: depsComplete },
    { id: 'ws', label: 'WORKSPACE RULES COMPLETE', score: workspaceRules ? 100 : 0, complete: workspaceRules },
    { id: 'brand', label: 'BRAND RULES COMPLETE', score: brandRules ? 100 : 40, complete: brandRules },
    { id: 'val', label: 'VALIDATION READY', score: validationReady ? 100 : Math.round((bp.validationRules.length / 7) * 100), complete: validationReady },
  ];

  const overall = Math.round(dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length);
  const eligible = bp.status === 'approved' && overall >= 75;

  return { dimensions, overall, eligible };
}

export function checklistStatusColor(status: ChecklistItemStatus): string {
  if (status === 'ready') return '#16A34A';
  if (status === 'incomplete') return '#EB1C24';
  return '#9CA3AF';
}
