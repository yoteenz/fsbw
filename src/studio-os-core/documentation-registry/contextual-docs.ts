import { getPageKnowledgeForPath } from '../../utils/adminStudioKnowledgeHubDemo';
import { searchDocumentationFaq } from '../documentation-sync/faq-registry';
import type { DocumentationRegistryEntry } from './types';
import { getRegisteredFeature, getAllRegistryEntries } from './registration';
import { queryDocumentationRegistry } from './smart-search';
import { buildWalkthroughStopsFromRegistry } from './walkthrough-sync';
import { getAcademyLessonsForModule } from './academy-sync';
import { buildVersionHistory } from './version-history';

export type ContextualDocumentationBundle = {
  pathname: string;
  moduleId: string;
  officialName: string;
  purpose: string;
  registryEntry: DocumentationRegistryEntry;
  suggestedNextSteps: string[];
  relatedFeatures: DocumentationRegistryEntry[];
  faqMatches: Array<{ question: string; answer: string }>;
  walkthroughRef?: string;
  academyLessons: string[];
  versionHistory: string[];
  tooltip?: string;
};

export function resolveContextualDocumentation(pathname: string): ContextualDocumentationBundle | null {
  const guide = getPageKnowledgeForPath(pathname);
  const moduleId = guide?.moduleId;
  if (!moduleId) return null;

  const entry = getRegisteredFeature(moduleId);
  if (!entry) return null;

  const relatedFeatures = entry.relatedSystems
    .slice(0, 5)
    .map((id) => getRegisteredFeature(id))
    .filter(Boolean) as DocumentationRegistryEntry[];

  const faqMatches = searchDocumentationFaq(entry.officialName, 3).map((f) => ({
    question: f.question,
    answer: f.answer,
  }));

  const walkthrough = buildWalkthroughStopsFromRegistry().find((s) => s.routeSegment === moduleId);
  const academy = getAcademyLessonsForModule(moduleId);
  const versions = buildVersionHistory(entry.internalId);

  return {
    pathname,
    moduleId,
    officialName: entry.officialName,
    purpose: entry.purpose,
    registryEntry: entry,
    suggestedNextSteps: [
      ...entry.exampleWorkflows.slice(0, 2),
      walkthrough ? `Walkthrough: ${walkthrough.title}` : '',
      academy[0] ? `Academy: ${academy[0].title}` : '',
    ].filter(Boolean),
    relatedFeatures,
    faqMatches,
    walkthroughRef: walkthrough?.registryRef,
    academyLessons: academy.map((l) => l.title),
    versionHistory: versions.map((v) => `${v.version} — ${v.summary}`),
    tooltip: entry.tooltips[0],
  };
}

export function resolveDocumentationForCommand(query: string): string | null {
  const hits = queryDocumentationRegistry(query, 3);
  if (hits.length === 0) return null;
  return hits.map((h) => `${h.entry.officialName}: ${h.entry.purpose}`).join(' ');
}

export function getRegistryEntriesForRoute(pathname: string): DocumentationRegistryEntry[] {
  const normalized = pathname.replace(/\/$/, '');
  return getAllRegistryEntries().filter(
    (e) => e.route && (normalized === e.route || normalized.startsWith(`${e.route}/`))
  );
}
