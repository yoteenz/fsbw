import { ensureOrganizationDiscoveryBlueprint } from '../business-discovery-blueprint/store';
import { getOrganizationExecutiveCouncilProfile } from '../executive-council/org-store';
import { ensureOrganizationArchitectureProfile } from '../industry-architecture/store';
import { getOrganizationGenomeProfile } from '../organization-genome/store';
import { getOrganizationInaugurationProfile } from '../organization-inauguration/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { getOrganizationTrustFrameworkProfile } from '../professional-trust-framework/store';
import { getOrganizationShadowModeProfile } from '../shadow-mode/store';
import { getOrganizationStudioInstituteProfile } from '../studio-institute/org-store';
import { MANUAL_DOCUMENT_LABELS, MANUAL_DOCUMENT_TYPES } from './constants';
import type { ManualDocumentSection, ManualDocumentType } from './types';

function now(): string {
  return new Date().toISOString();
}

function doc(
  organizationId: string,
  type: ManualDocumentType,
  summary: string,
  content: string,
  sourceModule: string
): ManualDocumentSection {
  return {
    id: `${organizationId}-${type}`,
    type,
    label: MANUAL_DOCUMENT_LABELS[type],
    summary,
    content,
    sourceModule,
    lastSyncedAt: now(),
    current: true,
    searchable: true,
  };
}

export function generateManualDocuments(organizationId: string, companyName: string): ManualDocumentSection[] {
  const inauguration = getOrganizationInaugurationProfile(organizationId);
  const genome = getOrganizationGenomeProfile(organizationId);
  const blueprint = ensureOrganizationDiscoveryBlueprint(organizationId);
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const arch = ensureOrganizationArchitectureProfile(organizationId);
  const trust = getOrganizationTrustFrameworkProfile(organizationId);
  const shadow = getOrganizationShadowModeProfile(organizationId);
  const institute = getOrganizationStudioInstituteProfile(organizationId);
  const council = getOrganizationExecutiveCouncilProfile(organizationId);

  const charter = inauguration?.charter;
  const mission = charter?.mission ?? genome?.identityCore.mission ?? `${companyName} serves its customers with excellence.`;
  const vision = charter?.vision ?? genome?.identityCore.vision ?? `Lead ${companyName}'s industry with preserved expertise and lasting legacy.`;
  const coreValues =
    charter?.coreValues ??
    genome?.identityCore.coreValues.join(' · ') ??
    'Integrity · Excellence · Customer Focus · Continuous Learning';

  const brainSummaries =
    brain?.brains.map((b) => `${b.label} (${b.maturityPct}% maturity) — institutional expertise preserved.`).join('\n') ??
    'Profession Brains™ will populate as organizational expertise is captured.';

  const departments =
    arch.headquartersDepartments.map((d) => d.label).join(' · ') ||
    charter?.primaryDepartments.join(' · ') ||
    'Core operational departments';

  const approvalStyle = genome?.decisionDna.approvalPreferences ?? 'executive-review';
  const servicePromise = genome?.customerStandards.servicePromise ?? 'Every customer receives professional, consistent service.';

  const documents: ManualDocumentSection[] = [
    doc(
      organizationId,
      'organization-charter',
      'Permanent founding document — organizational identity and purpose.',
      charter
        ? `${charter.organizationName} established ${charter.dateEstablished}. Founder: ${charter.founder}. Growth: ${charter.growthObjectives}`
        : `Organization charter generated from Blueprint and Genome for ${companyName}.`,
      'organization-inauguration'
    ),
    doc(organizationId, 'mission', 'Why the organization exists.', mission, 'organization-genome'),
    doc(organizationId, 'vision', 'Where the organization is going.', vision, 'organization-genome'),
    doc(organizationId, 'core-values', 'Values that guide every decision.', coreValues, 'organization-genome'),
    doc(
      organizationId,
      'business-discovery-blueprint',
      `Living organizational memory — ${blueprint.overallProgressPct}% complete.`,
      `Blueprint captures identity, services, people, customers, and growth. Current chapter: ${blueprint.currentChapterId}. Auto-syncs with living discovery.`,
      'business-discovery-blueprint'
    ),
    doc(
      organizationId,
      'organization-genome',
      `Identity DNA — ${genome?.genomeCompletenessPct ?? 0}% complete.`,
      genome
        ? `Brand personality: ${genome.brandVoice.brandPersonality.slice(0, 120)}… Decision principles: ${genome.decisionDna.decisionPrinciples.slice(0, 2).join(' · ')}`
        : 'Genome syncs from Blueprint and Charter — every AI interaction consults organizational identity.',
      'organization-genome'
    ),
    doc(
      organizationId,
      'profession-brain-summaries',
      `${brain?.brains.length ?? 0} Profession Brains™ documented.`,
      brainSummaries,
      'profession-brain'
    ),
    doc(
      organizationId,
      'department-guides',
      'Guides for every installed department pack.',
      `Active departments: ${departments}. Each department guide reflects current pack configuration and Digital Staff assignments.`,
      'industry-architecture'
    ),
    doc(
      organizationId,
      'employee-handbook',
      'Onboarding, expectations, and organizational culture.',
      `Welcome to ${companyName}. Mission: ${mission.slice(0, 80)}… Values: ${coreValues.slice(0, 80)}… Refer to SOPs and approval workflows for daily operations.`,
      'organization-genome'
    ),
    doc(
      organizationId,
      'leadership-principles',
      'How leaders make decisions and lead teams.',
      genome?.decisionDna.leadershipPhilosophy ??
        'Lead with clarity, preserve expertise, delegate operational work, protect strategic time.',
      'organization-genome'
    ),
    doc(
      organizationId,
      'customer-experience-standards',
      'Standards for every customer interaction.',
      `${servicePromise} Experience standards: ${genome?.customerStandards.experienceStandards.slice(0, 3).join(' · ') ?? 'Professional · Responsive · Knowledgeable'}`,
      'organization-genome'
    ),
    doc(
      organizationId,
      'approval-workflows',
      'How approvals flow through the organization.',
      `Approval preference: ${approvalStyle}. ${genome?.decisionDna.approvalNotes ?? 'Executive review for strategic decisions; department leads for operational approvals.'}`,
      'organization-genome'
    ),
    doc(
      organizationId,
      'standard-operating-procedures',
      'Step-by-step procedures for core operations.',
      `SOPs auto-generated from Profession Brain™ workflows and Blueprint services chapter. ${brain?.humanKnowledge.length ?? 0} operational guides synced.`,
      'profession-brain'
    ),
    doc(
      organizationId,
      'automation-documentation',
      'What Digital Concierges automate and observe-first rules.',
      shadow
        ? `Shadow Mode — ${shadow.conciergesInShadow} concierges observing. Trust score ${shadow.overallTrustScore}%. ${shadow.conciergesReadyToAutomate} ready to automate when confidence thresholds met.`
        : 'Automation documentation syncs from Shadow Mode — observe first, automate later.',
      'shadow-mode'
    ),
    doc(
      organizationId,
      'knowledge-articles',
      'Searchable knowledge base articles.',
      `${brain?.humanKnowledge.length ?? 0} knowledge artifacts · ${brain?.memoryGraph.nodes.length ?? 0} memory graph nodes — continuously updated from Profession Brain™.`,
      'profession-brain'
    ),
    doc(
      organizationId,
      'training-paths',
      'Role-based learning paths from Studio Institute™.',
      institute
        ? `${institute.artifacts.length} learning artifacts · ${institute.certifications.length} certifications · ${institute.rolePaths.length} role paths — auto-synced when Profession Brain evolves.`
        : 'Training paths generate automatically from Profession Brain™ via Studio Institute™.',
      'studio-institute'
    ),
    doc(
      organizationId,
      'command-dock-reference',
      'How to use Studio OS Command Dock effectively.',
      'Ask naturally — approvals, strategy, documentation, council meetings. Command Dock routes to the right intelligence layer automatically.',
      'command-dock'
    ),
    doc(
      organizationId,
      'executive-council-procedures',
      'How collaborative executive meetings work.',
      council
        ? `Executive Council™ conducts collaborative meetings — ${council.decisionHistory.length} decisions recorded. Chief Concierge synthesizes executive briefings.`
        : 'Convene Executive Council for strategic questions — multiple executives contribute, one briefing delivered.',
      'executive-council'
    ),
    doc(
      organizationId,
      'emergency-procedures',
      'Critical response procedures.',
      'Escalate immediately via Command Dock. Contact founder for crisis decisions. Preserve customer continuity per Succession Mode protocols.',
      'succession-mode'
    ),
    doc(
      organizationId,
      'glossary',
      'Organization-specific terminology.',
      genome?.brandVoice.internalTerminology.join(' · ') ??
        genome?.brandVoice.brandVocabulary.slice(0, 8).join(' · ') ??
        `${companyName} · Headquarters · Profession Brain · Digital Concierge · Command Dock`,
      'organization-genome'
    ),
    doc(
      organizationId,
      'policy-library',
      'Professional scope and trust policies.',
      trust
        ? `${trust.brainDeclarations.length} brain trust declarations documented · regulated industry guidance active · professional review recommended where required.`
        : 'Policy library syncs from Professional Trust Framework™ — guide responsibly, preserve professional trust.',
      'professional-trust-framework'
    ),
  ];

  return MANUAL_DOCUMENT_TYPES.map(
    (type) => documents.find((d) => d.type === type) ?? doc(organizationId, type, 'Pending sync.', 'Document will populate when source module syncs.', 'studio-os')
  );
}

export function summarizeManualDocuments(documents: ManualDocumentSection[]): string {
  const current = documents.filter((d) => d.current).length;
  return `${documents.length} manual sections · ${current} current · auto-generated from intelligence stack — no duplicate documentation.`;
}
