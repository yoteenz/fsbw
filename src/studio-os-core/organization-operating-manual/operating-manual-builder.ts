import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { generateManualDocuments, summarizeManualDocuments } from './documentation-generator';
import { buildLiveSyncEvents, summarizeLiveSynchronization } from './live-synchronization';
import { buildSearchableAnswers, summarizeSearchableOrganization } from './searchable-organization';
import type { OrganizationOperatingManualProfile } from './types';

export function computeManualCompletenessScore(
  documentsCurrent: number,
  documentsGenerated: number,
  searchableAnswers: number
): number {
  const docPct = documentsGenerated > 0 ? (documentsCurrent / documentsGenerated) * 100 : 0;
  return Math.min(99, Math.round(docPct * 0.6 + searchableAnswers * 3 + 10));
}

export function buildDockManualLine(profile: OrganizationOperatingManualProfile): string {
  const approvalSync = profile.syncEvents.find((e) => e.trigger === 'policies');
  const handbookSync = profile.documents.find((d) => d.type === 'employee-handbook');
  const regulationSync = profile.syncEvents.find((e) => e.trigger === 'policies');

  if (approvalSync && profile.recentSyncEvents >= 2) {
    return "I've updated the Operating Manual to reflect your new approval workflow.";
  }
  if (regulationSync && regulationSync.documentsUpdated.length >= 2) {
    return 'A new regulation required updates to three operating procedures.';
  }
  if (handbookSync?.current) {
    return 'The employee handbook has been synchronized — Operating Manual is current.';
  }
  return `${profile.documentsGenerated} sections auto-generated · ${profile.documentsCurrent} current · single source of operational truth.`;
}

export function buildOrganizationOperatingManualProfile(
  organizationId: string
): OrganizationOperatingManualProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const industryId = brain?.industryId ?? organizationId;

  const documents = generateManualDocuments(organizationId, companyName);
  const searchableQa = buildSearchableAnswers(organizationId, companyName, documents);
  const syncEvents = buildLiveSyncEvents(organizationId, documents.length);
  const documentsCurrent = documents.filter((d) => d.current).length;

  const profile: OrganizationOperatingManualProfile = {
    organizationId,
    companyName,
    industryId,
    updatedAt: new Date().toISOString(),
    manualCompletenessScore: 0,
    documentsGenerated: documents.length,
    documentsCurrent,
    searchableAnswers: searchableQa.length,
    recentSyncEvents: syncEvents.length,
    documents,
    searchableQa,
    syncEvents,
    dockManualLine: '',
    singleSourceOfTruth: true,
    syncedSources: [
      'organization-inauguration',
      'organization-genome',
      'business-discovery-blueprint',
      'profession-brain',
      'industry-architecture',
      'professional-trust-framework',
      'shadow-mode',
      'studio-institute',
      'executive-council',
      'innovation-lab',
      'command-dock',
    ],
  };

  profile.manualCompletenessScore = computeManualCompletenessScore(
    documentsCurrent,
    documents.length,
    searchableQa.length
  );
  profile.dockManualLine = buildDockManualLine(profile);
  return profile;
}

export function summarizeOperatingManualProfile(profile: OrganizationOperatingManualProfile): string {
  return [
    profile.dockManualLine,
    `Manual completeness ${profile.manualCompletenessScore}% · ${summarizeManualDocuments(profile.documents)}`,
    summarizeSearchableOrganization(profile.searchableQa),
    summarizeLiveSynchronization(profile.syncEvents),
    'One organization. One handbook. Always current — single source of operational truth.',
  ].join(' ');
}
