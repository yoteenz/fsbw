import { buildPluginTypeCatalog } from './plugin-type-catalog';
import { buildMarketplaceTiers, buildInstalledPlugins } from './marketplace-engine';
import { buildSdkCapabilities } from './sdk-capabilities-engine';
import type { PluginSearchHit } from './types';

export function queryPluginSdk(query: string, organizationId: string, limit = 12): PluginSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const terms = q.split(/\s+/).filter(Boolean);
  const hits: PluginSearchHit[] = [];

  for (const t of buildPluginTypeCatalog()) {
    const blob = `${t.name} ${t.typeId} ${t.description}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (t.typeId.includes(term)) score += 10;
      if (t.name.toLowerCase().includes(term)) score += 8;
      if (blob.includes(term)) score += 5;
    }
    if (score > 0) hits.push({ type: 'plugin-type', id: t.typeId, label: t.name, score, matchReason: 'plugin type' });
  }

  for (const c of buildSdkCapabilities()) {
    const blob = `${c.label} ${c.capabilityId} ${c.description}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (c.capabilityId.includes(term)) score += 9;
      if (blob.includes(term)) score += 5;
    }
    if (score > 0) hits.push({ type: 'capability', id: c.capabilityId, label: c.label, score, matchReason: 'sdk capability' });
  }

  for (const p of buildInstalledPlugins(organizationId)) {
    const blob = `${p.name} ${p.pluginId} ${p.typeId}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (p.pluginId.includes(term)) score += 10;
      if (p.name.toLowerCase().includes(term)) score += 8;
      if (blob.includes(term)) score += 5;
    }
    if (score > 0) hits.push({ type: 'plugin', id: p.pluginId, label: p.name, score, matchReason: 'installed plugin' });
  }

  for (const m of buildMarketplaceTiers()) {
    const blob = `${m.label} ${m.tier} ${m.description}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (m.tier.includes(term)) score += 9;
      if (blob.includes(term)) score += 5;
    }
    if (score > 0) hits.push({ type: 'marketplace', id: m.tier, label: m.label, score, matchReason: 'marketplace tier' });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function explainPluginType(typeId: string): string | null {
  const t = buildPluginTypeCatalog().find((x) => x.typeId === typeId);
  if (!t) return null;
  return `${t.name} — ${t.description} Example: ${t.exampleUse}`;
}

export function explainSdkCapability(capabilityId: string): string | null {
  const c = buildSdkCapabilities().find((x) => x.capabilityId === capabilityId);
  if (!c) return null;
  return `${c.label} — ${c.description} ${c.registeredCount} registrations in demo catalog.`;
}
