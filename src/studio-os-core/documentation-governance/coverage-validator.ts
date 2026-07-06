import { COVERAGE_SURFACES, COVERAGE_STANDARD_PCT } from './constants';
import type { CoverageSurface, FeatureCoverageResult } from './types';
import { getAllRegistryEntries } from '../documentation-registry/registration';
import type { DocumentationRegistryEntry } from '../documentation-registry/types';

function surfaceCovered(entry: DocumentationRegistryEntry, surface: CoverageSurface): { covered: boolean; detail: string } {
  switch (surface) {
    case 'studio-manual':
      return { covered: Boolean(entry.docPath && entry.documentationLinks.length > 0), detail: entry.docPath || 'No doc path' };
    case 'academy':
      return { covered: entry.academyLessons.length > 0, detail: `${entry.academyLessons.length} lessons` };
    case 'walkthrough':
      return { covered: entry.walkthroughReferences.length > 0, detail: `${entry.walkthroughReferences.length} refs` };
    case 'help-center':
      return { covered: entry.faqReferences.length > 0 || entry.documentationLinks.length > 0, detail: 'FAQ or doc links' };
    case 'search':
      return { covered: entry.keywords.length >= 2 || entry.searchSynonyms.length >= 2, detail: `${entry.keywords.length} keywords` };
    case 'command-dock':
      return { covered: entry.commandDockReferences.length > 0, detail: `${entry.commandDockReferences.length} dock refs` };
    case 'tooltips':
      return { covered: entry.tooltips.length > 0, detail: `${entry.tooltips.length} tooltips` };
    case 'developer-docs':
      return { covered: entry.developerDocumentation.length > 0, detail: entry.developerDocumentation[0] ?? 'Missing' };
    case 'architecture-docs':
      return { covered: entry.architectureDocumentation.length > 0, detail: entry.architectureDocumentation[0] ?? 'Missing' };
    case 'release-notes':
      return { covered: entry.releaseNotes.length > 0, detail: `${entry.releaseNotes.length} notes` };
    case 'faq':
      return { covered: entry.faqReferences.length > 0, detail: `${entry.faqReferences.length} FAQ refs` };
    case 'examples':
      return { covered: entry.exampleWorkflows.length > 0, detail: `${entry.exampleWorkflows.length} workflows` };
    case 'screenshots':
      return { covered: entry.relatedScreens.length > 0, detail: `${entry.relatedScreens.length} screens` };
    case 'video-tutorials':
      return { covered: entry.tutorialReferences.some((t) => t.includes('video')), detail: 'Future surface — optional' };
    default:
      return { covered: false, detail: 'Unknown surface' };
  }
}

export function validateFeatureCoverage(entry: DocumentationRegistryEntry): FeatureCoverageResult {
  const surfaces = COVERAGE_SURFACES.map((surface) => {
    const { covered, detail } = surfaceCovered(entry, surface);
    return { surface, covered, detail };
  });

  const required = surfaces.filter((s) => s.surface !== 'video-tutorials' && s.surface !== 'screenshots');
  const coveredCount = required.filter((s) => s.covered).length;
  const coveragePct = Math.round((coveredCount / required.length) * 100);
  const gaps = surfaces.filter((s) => !s.covered && s.surface !== 'video-tutorials').map((s) => s.surface);

  return {
    featureId: entry.internalId,
    featureName: entry.officialName,
    coveragePct,
    complete: coveragePct >= COVERAGE_STANDARD_PCT,
    surfaces,
    gaps,
  };
}

export function validateAllFeatureCoverage(): FeatureCoverageResult[] {
  return getAllRegistryEntries()
    .map(validateFeatureCoverage)
    .sort((a, b) => a.coveragePct - b.coveragePct);
}

export function computeOverallCoveragePct(results: FeatureCoverageResult[]): number {
  if (results.length === 0) return 0;
  return Math.round(results.reduce((s, r) => s + r.coveragePct, 0) / results.length);
}

export function countFeaturesBelowStandard(results: FeatureCoverageResult[]): number {
  return results.filter((r) => !r.complete).length;
}
