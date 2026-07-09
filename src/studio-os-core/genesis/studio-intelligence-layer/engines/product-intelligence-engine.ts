import { getProductDna } from '../registries/intelligence-registries';
import type { XsilProductDnaRecord } from '../types';

/** Product Intelligence Engine™ */
export function buildProductBrief(companyId: string): string {
  const p = getProductDna(companyId);
  if (!p) return 'Product DNA not loaded';
  return `${p.productName}: ${p.emotionalPromise}. Lifecycle: ${p.lifecycle}. Launch: ${p.launchStrategy}`;
}

export function scoreProductAlignment(companyId: string, artifact: string): number {
  const p = getProductDna(companyId);
  if (!p) return 50;
  const lower = artifact.toLowerCase();
  let score = 70;
  if (lower.includes(p.productName.toLowerCase().slice(0, 8))) score += 10;
  if (lower.includes(p.emotionalPromise.toLowerCase().slice(0, 12))) score += 8;
  return Math.max(0, Math.min(100, score));
}

export function summarizeProduct(p: XsilProductDnaRecord): string {
  return `${p.productName} (${p.lifecycle}) · ${p.purpose}`;
}
