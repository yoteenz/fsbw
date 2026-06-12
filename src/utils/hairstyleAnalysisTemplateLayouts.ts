import type { AnalysisTier, TemplateFieldDef, TextSlot } from '../types/hairstyleAnalysis';
import blueprint from '../data/hairstyleAnalysisCardBlueprint.json';

function normalizeTier(tier: AnalysisTier): Exclude<AnalysisTier, 'black'> {
  return tier === 'black' ? 'twelve_month' : tier;
}

type BlueprintField = {
  id: string;
  kind: 'text' | 'image';
  rect: { left: string; top: string; width: string; height: string };
};

/** Synced from api/_lib/hairstyleAnalysisCardBlueprint.ts via src/data/hairstyleAnalysisCardBlueprint.json */
export function getTemplateFields(tier: AnalysisTier): TemplateFieldDef[] {
  const key = normalizeTier(tier);
  const fields = (blueprint.tiers as Record<string, { fields: BlueprintField[] }>)[key]?.fields ?? [];
  return fields.map((field) => ({
    id: field.id,
    label: field.id,
    kind: field.kind,
    slot: field.rect as TextSlot,
  }));
}
