/**
 * Dynamic field slots — sourced from code-built card blueprint (not Supabase PNG calibration).
 */

import type { FalHairstyleAnalysis } from './hairstyleAnalysisFalPrompt.js';
import {
  getLayoutFieldsFromBlueprint,
  type LayoutFieldDef,
  type LayoutFieldKind,
} from './hairstyleAnalysisCardBlueprint.js';

export type { LayoutFieldDef, LayoutFieldKind };

export function getLayoutFieldsForAnalysis(analysis: FalHairstyleAnalysis): LayoutFieldDef[] {
  return getLayoutFieldsFromBlueprint(analysis);
}
