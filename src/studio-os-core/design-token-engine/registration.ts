import type { DesignTokenEntry } from './types';
import { buildDesignTokenCatalog, getDesignToken } from './token-catalog';

const customTokens: DesignTokenEntry[] = [];

export function registerDesignToken(entry: DesignTokenEntry): DesignTokenEntry {
  const idx = customTokens.findIndex((t) => t.tokenId === entry.tokenId);
  if (idx >= 0) customTokens[idx] = entry;
  else customTokens.push(entry);
  return entry;
}

export function getAllDesignTokens(): DesignTokenEntry[] {
  const byId = new Map(buildDesignTokenCatalog().map((t) => [t.tokenId, t]));
  for (const custom of customTokens) {
    byId.set(custom.tokenId, custom);
  }
  return [...byId.values()];
}

export function getRegisteredDesignToken(tokenId: string): DesignTokenEntry | undefined {
  return getAllDesignTokens().find((t) => t.tokenId === tokenId) ?? getDesignToken(tokenId);
}
