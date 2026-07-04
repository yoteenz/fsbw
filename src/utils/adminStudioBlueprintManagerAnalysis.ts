import type { BlueprintDefinition, BlueprintReviewSuggestion } from './adminStudioBlueprintManagerDemo';
import { BLUEPRINT_REVIEW_SUGGESTIONS } from './adminStudioBlueprintManagerDemo';
import { computeFactoryReadiness } from './adminStudioBlueprintManagerCompute';

/** Executive AI Director blueprint review — pre-generation quality gate. */
export function reviewBlueprintForGeneration(bp: BlueprintDefinition): BlueprintReviewSuggestion[] {
  const suggestions: BlueprintReviewSuggestion[] = [];
  const readiness = computeFactoryReadiness(bp);

  if (!readiness.dimensions.find((d) => d.id === 'prompt')?.complete) {
    suggestions.push(BLUEPRINT_REVIEW_SUGGESTIONS.find((s) => s.id === 'br-2')!);
  }
  if (bp.requiredImages.includes('HOLIDAY') && !bp.checklist.some((c) => c.label.includes('HOLIDAY'))) {
    suggestions.push(BLUEPRINT_REVIEW_SUGGESTIONS.find((s) => s.id === 'br-3')!);
  }
  if (bp.requiredLighting.length < bp.requiredImages.length / 2) {
    suggestions.push(BLUEPRINT_REVIEW_SUGGESTIONS.find((s) => s.id === 'br-1')!);
  }
  if (bp.requiredCameraPresets.length >= 5) {
    suggestions.push(BLUEPRINT_REVIEW_SUGGESTIONS.find((s) => s.id === 'br-4')!);
  }

  if (bp.status !== 'approved') {
    suggestions.push({
      id: 'br-status',
      severity: 'critical',
      title: 'BLUEPRINT NOT APPROVED',
      detail: `STATUS IS ${bp.status.toUpperCase()} — ONLY APPROVED BLUEPRINTS MAY ENTER ASSET FACTORY.`,
      source: 'config',
    });
  }

  return suggestions.length ? suggestions : [
    { id: 'br-ok', severity: 'info', title: 'BLUEPRINT STRUCTURE SOUND', detail: 'NO CRITICAL GAPS DETECTED — REVIEW CHECKLIST BEFORE GENERATION.', source: 'config' },
  ];
}
