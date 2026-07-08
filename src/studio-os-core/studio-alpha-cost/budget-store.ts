/**
 * Studio Alpha™ creative budget — internal monthly spend cap for founder production HUD.
 */

import { readStudioOsJson, writeStudioOsJson } from '../../utils/studioOsBrowserStorage';
import type { CreativeBudgetConfig } from './types';
import { STUDIO_ALPHA_COST_UPDATED_EVENT } from './receipt-store';

export const STUDIO_ALPHA_BUDGET_STORAGE_KEY = 'studioOsStudioAlphaCreativeBudget_v1';

const DEFAULT_BUDGET: CreativeBudgetConfig = {
  monthlyBudgetUsd: 250,
  updatedAt: '2026-07-08T00:00:00.000Z',
};

export function readCreativeBudgetConfig(): CreativeBudgetConfig {
  const raw = readStudioOsJson(STUDIO_ALPHA_BUDGET_STORAGE_KEY, () => DEFAULT_BUDGET);
  if (!raw || typeof raw.monthlyBudgetUsd !== 'number') return DEFAULT_BUDGET;
  return {
    monthlyBudgetUsd: raw.monthlyBudgetUsd,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : DEFAULT_BUDGET.updatedAt,
  };
}

export function writeCreativeBudgetConfig(config: CreativeBudgetConfig): void {
  writeStudioOsJson(STUDIO_ALPHA_BUDGET_STORAGE_KEY, config);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_ALPHA_COST_UPDATED_EVENT));
  }
}
