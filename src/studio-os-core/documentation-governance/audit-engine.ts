import { getAllRegistryEntries, validateRegistryEntry } from '../knowledge-registry/registration';
import type { KnowledgeRegistryEntry } from '../knowledge-registry/types';
import type { DocumentationAuditFinding } from './types';

const STALE_DAYS = 90;

function daysSince(isoDate: string): number {
  const then = new Date(isoDate).getTime();
  if (Number.isNaN(then)) return STALE_DAYS + 1;
  return Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24));
}

function auditEntry(entry: KnowledgeRegistryEntry, now: string): DocumentationAuditFinding[] {
  const findings: DocumentationAuditFinding[] = [];
  const base = { featureId: entry.internalId, featureName: entry.officialName, detectedAt: now };

  if (daysSince(entry.lastUpdated) > STALE_DAYS) {
    findings.push({
      ...base,
      id: `outdated-${entry.internalId}`,
      issueType: 'outdated',
      severity: 'warning',
      message: `${entry.officialName} documentation last updated ${entry.lastUpdated}.`,
      recommendation: `Refresh registry metadata and re-sync surfaces for ${entry.officialName}.`,
    });
  }

  if (!entry.purpose || entry.purpose.length < 40) {
    findings.push({
      ...base,
      id: `incomplete-${entry.internalId}`,
      issueType: 'incomplete-description',
      severity: 'warning',
      message: `${entry.officialName} has an incomplete feature description.`,
      recommendation: 'Expand purpose and overview in Documentation Registry™.',
    });
  }

  if (entry.walkthroughReferences.length === 0) {
    findings.push({
      ...base,
      id: `walkthrough-${entry.internalId}`,
      issueType: 'missing-walkthrough',
      severity: entry.status === 'live' ? 'warning' : 'info',
      surface: 'walkthrough',
      message: `${entry.officialName} has no walkthrough reference.`,
      recommendation: 'Add walkthroughReferences in registry — onboarding updates automatically.',
    });
  }

  if (entry.academyLessons.length === 0) {
    findings.push({
      ...base,
      id: `academy-${entry.internalId}`,
      issueType: 'missing-academy',
      severity: entry.status === 'live' ? 'warning' : 'info',
      surface: 'academy',
      message: `${entry.officialName} has no Academy lesson.`,
      recommendation: 'Register academyLessons — Studio Institute™ generates content automatically.',
    });
  }

  if (entry.keywords.length < 2 && entry.searchSynonyms.length < 2) {
    findings.push({
      ...base,
      id: `search-${entry.internalId}`,
      issueType: 'missing-search-keywords',
      severity: 'info',
      surface: 'search',
      message: `${entry.officialName} has sparse search keywords.`,
      recommendation: 'Add keywords and searchSynonyms for smart search discoverability.',
    });
  }

  if (entry.tutorialReferences.length === 0 && entry.status === 'live') {
    findings.push({
      ...base,
      id: `tutorial-${entry.internalId}`,
      issueType: 'missing-tutorial',
      severity: 'info',
      message: `${entry.officialName} has no tutorial reference.`,
      recommendation: 'Add tutorialReferences for Help Center and Academy coverage.',
    });
  }

  const validationIssues = validateRegistryEntry(entry);
  if (validationIssues.length > 0) {
    findings.push({
      ...base,
      id: `broken-${entry.internalId}`,
      issueType: 'broken-reference',
      severity: 'critical',
      message: validationIssues.join('; '),
      recommendation: 'Fix broken relatedSystems or missing required fields in registry.',
    });
  }

  if (entry.relatedSystems.length === 0 && entry.category !== 'platform') {
    findings.push({
      ...base,
      id: `orphaned-${entry.internalId}`,
      issueType: 'orphaned',
      severity: 'info',
      message: `${entry.officialName} has no relatedSystems links.`,
      recommendation: 'Connect to related features in Knowledge Graph and contextual help.',
    });
  }

  return findings;
}

/** Continuous documentation audits — actionable recommendations for every issue. */
export function runDocumentationAudits(): DocumentationAuditFinding[] {
  const now = new Date().toISOString();
  const entries = getAllRegistryEntries();
  const findings = entries.flatMap((e) => auditEntry(e, now));

  const names = entries.map((e) => e.officialName.toLowerCase());
  const duplicates = names.filter((n, i) => names.indexOf(n) !== i);
  for (const dup of [...new Set(duplicates)]) {
    findings.push({
      id: `duplicate-${dup.replace(/\s+/g, '-')}`,
      issueType: 'duplicate',
      severity: 'warning',
      featureId: 'platform',
      featureName: 'Platform',
      message: `Potential duplicate documentation label: "${dup}".`,
      recommendation: 'Consolidate or differentiate official names in Documentation Registry™.',
      detectedAt: now,
    });
  }

  const unused = entries.filter(
    (e) => e.status === 'deprecated' && e.walkthroughReferences.length > 0
  );
  for (const entry of unused) {
    findings.push({
      id: `unused-${entry.internalId}`,
      issueType: 'unused',
      severity: 'info',
      featureId: entry.internalId,
      featureName: entry.officialName,
      message: `Deprecated feature ${entry.officialName} still linked in walkthrough.`,
      recommendation: 'Remove walkthrough references for deprecated features.',
      detectedAt: now,
    });
  }

  return findings.sort((a, b) => {
    const rank = { critical: 0, warning: 1, info: 2 };
    return rank[a.severity] - rank[b.severity];
  });
}

export function summarizeDocumentationAudits(findings: DocumentationAuditFinding[]): string {
  const critical = findings.filter((f) => f.severity === 'critical').length;
  const warning = findings.filter((f) => f.severity === 'warning').length;
  return `${findings.length} audit findings — ${critical} critical · ${warning} warning · ${findings.length - critical - warning} info.`;
}
