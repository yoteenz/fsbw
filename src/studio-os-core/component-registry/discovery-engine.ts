import { getAllRegisteredComponents } from './registration';
import type { ComponentDiscoveryHit } from './types';

const SEMANTIC_CLUSTERS: Record<string, string[]> = {
  card: ['executive-hero-card', 'executive-secondary-card', 'executive-department-card'],
  panel: ['executive-page-shell', 'executive-focus-panel', 'admin-studio-stage-shell'],
  chart: ['executive-health-ring', 'executive-pipeline-viz', 'executive-trend-sparkline'],
  mission: ['mission-control-panel', 'mission-control-documentation-registry'],
  glass: ['perspective-panel', 'perspective-panel-host'],
  button: ['eia-action-button'],
};

/** Discover reusable components — search by name, category, variant, or usage. */
export function queryComponentRegistry(query: string, limit = 12): ComponentDiscoveryHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const terms = q.split(/\s+/).filter(Boolean);
  const components = getAllRegisteredComponents();
  const hits: ComponentDiscoveryHit[] = [];

  for (const [cluster, ids] of Object.entries(SEMANTIC_CLUSTERS)) {
    if (q.includes(cluster) || terms.includes(cluster)) {
      for (const id of ids) {
        const entry = components.find((c) => c.componentId === id);
        if (entry) hits.push({ entry, score: 20, matchReason: `semantic:${cluster}` });
      }
    }
  }

  for (const entry of components) {
    const blob = `${entry.officialName} ${entry.description} ${entry.category} ${entry.variants.join(' ')} ${entry.usageSurfaces.join(' ')}`.toLowerCase();
    let score = 0;
    let reason = 'keyword';
    for (const term of terms) {
      if (entry.componentId.includes(term)) score += 12;
      if (entry.officialName.toLowerCase().includes(term)) score += 10;
      if (blob.includes(term)) score += 6;
      if (entry.category.includes(term)) {
        score += 8;
        reason = 'category';
      }
    }
    if (score > 0 && !hits.some((h) => h.entry.componentId === entry.componentId)) {
      hits.push({ entry, score, matchReason: reason });
    }
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function explainComponent(componentId: string): string | null {
  const entry = getAllRegisteredComponents().find((e) => e.componentId === componentId);
  if (!entry) return null;
  return `${entry.officialName} (${entry.category}) — ${entry.description} Variants: ${entry.variants.join(', ')}. Reuse score: ${entry.reuseScore}%. Used on: ${entry.usageSurfaces.slice(0, 3).join(', ')}.`;
}

export function listComponentsUsedOn(surface: string): ReturnType<typeof getAllRegisteredComponents> {
  return getAllRegisteredComponents().filter((c) => c.usageSurfaces.some((s) => s.includes(surface)));
}
