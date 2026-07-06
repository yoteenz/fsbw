import { getAllRegistryEntries } from '../documentation-registry/registration';
import type { DependencyImpact } from './types';

const SURFACE_LABELS: Record<string, string> = {
  walkthrough: 'Interactive Walkthrough',
  academy: 'Studio Institute Academy',
  search: 'Search Index',
  faq: 'FAQ',
  architecture: 'Architecture Docs',
  developer: 'Developer Docs',
  tooltips: 'Tooltips',
  'release-notes': 'Release Notes',
  registry: 'Documentation Registry™',
  'command-dock': 'Command Dock',
};

/** When a feature changes, identify every document surface that references it. */
export function findDependencyImpacts(featureId?: string): DependencyImpact[] {
  const entries = featureId
    ? getAllRegistryEntries().filter((e) => e.internalId === featureId)
    : getAllRegistryEntries();

  return entries.map((entry) => {
    const affectedSurfaces = [
      { surface: 'walkthrough', referenceCount: entry.walkthroughReferences.length, updateRequired: entry.walkthroughReferences.length > 0 },
      { surface: 'academy', referenceCount: entry.academyLessons.length, updateRequired: entry.academyLessons.length > 0 },
      { surface: 'search', referenceCount: entry.keywords.length + entry.searchSynonyms.length, updateRequired: true },
      { surface: 'faq', referenceCount: entry.faqReferences.length, updateRequired: entry.faqReferences.length > 0 },
      { surface: 'architecture', referenceCount: entry.architectureDocumentation.length, updateRequired: entry.architectureDocumentation.length > 0 },
      { surface: 'developer', referenceCount: entry.developerDocumentation.length, updateRequired: entry.developerDocumentation.length > 0 },
      { surface: 'tooltips', referenceCount: entry.tooltips.length, updateRequired: entry.tooltips.length > 0 },
      { surface: 'release-notes', referenceCount: entry.releaseNotes.length, updateRequired: entry.releaseNotes.length > 0 },
      { surface: 'registry', referenceCount: 1, updateRequired: true },
      { surface: 'command-dock', referenceCount: entry.commandDockReferences.length, updateRequired: entry.commandDockReferences.length > 0 },
    ].filter((s) => s.referenceCount > 0 || s.surface === 'search' || s.surface === 'registry');

    const labels = affectedSurfaces.map((s) => SURFACE_LABELS[s.surface] ?? s.surface).join(', ');

    return {
      featureId: entry.internalId,
      featureName: entry.officialName,
      affectedSurfaces,
      prompt: `Before deploying changes to ${entry.officialName}, update: ${labels}.`,
    };
  });
}

export function getDependencyPromptForFeature(featureId: string): string | null {
  return findDependencyImpacts(featureId)[0]?.prompt ?? null;
}
