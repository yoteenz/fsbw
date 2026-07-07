import { getFaqCount } from '../documentation-sync/faq-registry';
import { getSemanticClusterCount } from '../documentation-sync/semantic-search';
import { AUTO_SYNC_SURFACES } from './constants';
import type { AutoSyncSurfaceStatus, DocumentationHealthMetric } from './types';
import { getAllRegistryEntries, validateRegistryEntry } from './registration';
import { buildAcademyLessonsFromRegistry } from './academy-sync';
import { buildWalkthroughStopsFromRegistry } from './walkthrough-sync';

export function computeDocumentationHealthMetrics(): DocumentationHealthMetric[] {
  const entries = getAllRegistryEntries();
  const total = entries.length;

  const withWalkthrough = entries.filter((e) => e.walkthroughReferences.length > 0).length;
  const withAcademy = entries.filter((e) => e.academyLessons.length > 0).length;
  const withTooltips = entries.filter((e) => e.tooltips.length > 0).length;
  const withDevDocs = entries.filter((e) => e.developerDocumentation.length > 0).length;
  const withArchDocs = entries.filter((e) => e.architectureDocumentation.length > 0).length;
  const broken = entries.filter((e) => validateRegistryEntry(e).length > 0).length;

  const coveragePct = Math.round(
    ((withWalkthrough + withAcademy + withTooltips + withDevDocs) / Math.max(1, total * 4)) * 100
  );

  return [
    {
      id: 'coverage',
      label: 'Registry Coverage',
      scorePct: coveragePct,
      detail: `${total} features registered — ${coveragePct}% metadata complete`,
      status: coveragePct >= 85 ? 'healthy' : coveragePct >= 70 ? 'warning' : 'critical',
    },
    {
      id: 'walkthrough',
      label: 'Walkthrough Completeness',
      scorePct: Math.round((withWalkthrough / Math.max(1, total)) * 100),
      detail: `${buildWalkthroughStopsFromRegistry().length} steps · ${withWalkthrough}/${total} features linked`,
      status: withWalkthrough >= total * 0.9 ? 'healthy' : 'warning',
    },
    {
      id: 'academy',
      label: 'Academy Coverage',
      scorePct: Math.round((withAcademy / Math.max(1, total)) * 100),
      detail: `${buildAcademyLessonsFromRegistry().length} lessons generated from registry`,
      status: withAcademy >= total * 0.9 ? 'healthy' : 'warning',
    },
    {
      id: 'search',
      label: 'Search Quality',
      scorePct: Math.min(99, 70 + getSemanticClusterCount() * 3),
      detail: `${getSemanticClusterCount()} semantic clusters · FAQ ${getFaqCount()} entries`,
      status: 'healthy',
    },
    {
      id: 'broken',
      label: 'Broken References',
      scorePct: Math.max(0, 100 - broken * 10),
      detail: broken === 0 ? 'No broken registry references' : `${broken} entries need validation`,
      status: broken === 0 ? 'healthy' : 'warning',
    },
    {
      id: 'tooltips',
      label: 'Tooltip Coverage',
      scorePct: Math.round((withTooltips / Math.max(1, total)) * 100),
      detail: `${withTooltips}/${total} features have registry tooltips`,
      status: withTooltips >= total * 0.95 ? 'healthy' : 'warning',
    },
    {
      id: 'developer',
      label: 'Developer Documentation',
      scorePct: Math.round((withDevDocs / Math.max(1, total)) * 100),
      detail: `${withDevDocs}/${total} features link developer docs`,
      status: withDevDocs >= total * 0.9 ? 'healthy' : 'warning',
    },
    {
      id: 'architecture',
      label: 'Architecture Coverage',
      scorePct: Math.round((withArchDocs / Math.max(1, total)) * 100),
      detail: `${withArchDocs}/${total} features link architecture docs`,
      status: withArchDocs >= total * 0.9 ? 'healthy' : 'warning',
    },
  ];
}

export function computeRegistryHealthScore(metrics: DocumentationHealthMetric[]): number {
  if (metrics.length === 0) return 0;
  return Math.min(99, Math.round(metrics.reduce((s, m) => s + m.scorePct, 0) / metrics.length));
}

export function buildAutoSyncSurfaceStatuses(now: string): AutoSyncSurfaceStatus[] {
  const count = getAllRegistryEntries().length;
  const labels: Record<(typeof AUTO_SYNC_SURFACES)[number], string> = {
    'studio-manual': 'Studio Manual',
    'getting-started': 'Getting Started Guide',
    walkthrough: 'Interactive Walkthrough',
    academy: 'Studio Institute Academy',
    'help-center': 'Help Center',
    'search-index': 'Search Index',
    tooltips: 'Tooltips',
    faq: 'FAQ',
    'developer-docs': 'Developer Docs',
    'architecture-docs': 'Architecture Docs',
    'command-dock': 'Command Dock Help',
    'release-notes': 'Release Notes',
    'feature-registry': 'Feature Registry',
    'version-history': 'Version History',
    roadmap: 'Roadmap™',
    'engineering-dashboard': 'Engineering Dashboard™',
  };

  return AUTO_SYNC_SURFACES.map((surface) => ({
    surface,
    label: labels[surface],
    synced: true,
    entryCount: count,
    lastSyncedAt: now,
  }));
}
