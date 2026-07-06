import { getOrganizationInnovationLabProfile } from '../innovation-lab/store';
import { getOrganizationOperatingManualProfile } from '../organization-operating-manual/store';
import { getOrganizationGenomeProfile } from '../organization-genome/store';
import { getOrganizationInaugurationProfile } from '../organization-inauguration/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { getOrganizationStudioInstituteProfile } from '../studio-institute/org-store';
import { SHAREABLE_ASSET_LABELS, SHAREABLE_ASSET_TYPES } from './constants';
import type { AssetAttribution, PublishableAsset, ShareableAssetType } from './types';

function orgSeed(organizationId: string, salt: string): number {
  let h = 0;
  const s = organizationId + salt;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 100;
}

function attribution(
  companyName: string,
  founderName: string,
  version: string,
  seed: number
): AssetAttribution {
  return {
    originalOrganization: companyName,
    founder: founderName,
    version,
    createdAt: new Date(Date.now() - seed * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    license: 'Legacy Network Contribution License — contributor retains IP',
    usageRights: 'Adopt · adapt · learn — attribution required · no automatic sharing',
    downloads: seed * 3 + 12,
    reviews: Math.floor(seed / 3) + 4,
    adoptions: Math.floor(seed / 5) + 2,
    averageRating: Math.min(5, 3.8 + (seed % 12) / 10),
  };
}

function asset(
  organizationId: string,
  type: ShareableAssetType,
  title: string,
  summary: string,
  companyName: string,
  founderName: string,
  published: boolean,
  tags: string[]
): PublishableAsset {
  const seed = orgSeed(organizationId, type + title);
  return {
    id: `asset-${organizationId}-${type}`,
    type,
    typeLabel: SHAREABLE_ASSET_LABELS[type],
    title,
    summary,
    published,
    permissionRequired: true,
    ipOwnershipRetained: true,
    attribution: attribution(companyName, founderName, '1.0.0', seed),
    discoveryTags: tags,
  };
}

export function buildPublishableAssets(
  organizationId: string,
  companyName: string,
  founderName: string,
  industryId: string
): PublishableAsset[] {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const genome = getOrganizationGenomeProfile(organizationId);
  const institute = getOrganizationStudioInstituteProfile(organizationId);
  const manual = getOrganizationOperatingManualProfile(organizationId);
  const innovation = getOrganizationInnovationLabProfile(organizationId);
  const inauguration = getOrganizationInaugurationProfile(organizationId);

  const primaryBrain = brain?.brains[0]?.label ?? 'Core Expertise';
  const seed = orgSeed(organizationId, 'publish');

  const candidates: PublishableAsset[] = [
    asset(
      organizationId,
      'profession-brain-modules',
      `${primaryBrain} Profession Brain™ Module`,
      `Institutional expertise module — ${brain?.brains.length ?? 0} brains documented. Optional publish; IP retained.`,
      companyName,
      founderName,
      false,
      [industryId, 'profession', 'knowledge-category']
    ),
    asset(
      organizationId,
      'department-packs',
      `${companyName} Operations Department Pack`,
      'Department pack framework — installable by peer organizations with attribution.',
      companyName,
      founderName,
      seed % 3 === 0,
      [industryId, 'department']
    ),
    asset(
      organizationId,
      'automation-blueprints',
      'Shadow Mode Automation Blueprint',
      'Observe-first automation workflow — never auto-shared; permission required.',
      companyName,
      founderName,
      false,
      ['automation', industryId]
    ),
    asset(
      organizationId,
      'templates',
      `${industryId.replace(/-/g, ' ')} Client Onboarding Template`,
      'Reusable client onboarding template from Operating Manual SOPs.',
      companyName,
      founderName,
      seed % 4 === 0,
      [industryId, 'problem', 'templates']
    ),
    asset(
      organizationId,
      'playbooks',
      `${primaryBrain} Operational Playbook`,
      'Step-by-step playbook derived from Profession Brain workflows.',
      companyName,
      founderName,
      false,
      [industryId, 'playbooks']
    ),
    asset(
      organizationId,
      'frameworks',
      `${companyName} Leadership Framework`,
      genome?.decisionDna.leadershipPhilosophy.slice(0, 120) ?? 'Leadership principles framework.',
      companyName,
      founderName,
      seed % 5 === 0,
      [industryId, 'frameworks']
    ),
    asset(
      organizationId,
      'studio-institute-courses',
      institute ? `${institute.artifacts[0]?.title ?? 'Foundational'} Course` : 'Studio Institute Course',
      `${institute?.artifacts.length ?? 0} learning artifacts available for optional community contribution.`,
      companyName,
      founderName,
      false,
      [industryId, 'teaching']
    ),
    asset(
      organizationId,
      'knowledge-products',
      `${primaryBrain} Knowledge Product Surface`,
      'Knowledge Commerce product — publishable with full IP ownership retained.',
      companyName,
      founderName,
      false,
      [industryId, 'knowledge-category']
    ),
    asset(
      organizationId,
      'innovation-frameworks',
      innovation?.ideas[0]?.title ?? 'Innovation Framework',
      `${innovation?.ideasGenerated ?? 0} ideas generated — optional framework contribution to Legacy Network.`,
      companyName,
      founderName,
      false,
      [industryId, 'innovation']
    ),
    asset(
      organizationId,
      'organization-genome-components',
      'Approved Genome Identity Components',
      `Brand voice and decision DNA components — ${genome?.genomeCompletenessPct ?? 0}% complete.`,
      companyName,
      founderName,
      false,
      [industryId, 'genome']
    ),
    asset(
      organizationId,
      'command-dock-workflows',
      'Executive Command Dock Workflow',
      'Command Dock routing patterns — shareable workflow, permission required.',
      companyName,
      founderName,
      false,
      ['command-dock', industryId]
    ),
    asset(
      organizationId,
      'executive-council-models',
      'Collaborative Council Meeting Model',
      'Executive Council collaborative briefing model for peer organizations.',
      companyName,
      founderName,
      seed % 6 === 0,
      [industryId, 'executive']
    ),
    asset(
      organizationId,
      'approval-systems',
      `${genome?.decisionDna.approvalPreferences ?? 'Executive'} Approval System`,
      manual?.documents.find((d) => d.type === 'approval-workflows')?.summary ?? 'Approval workflow blueprint.',
      companyName,
      founderName,
      false,
      [industryId, 'approvals']
    ),
    asset(
      organizationId,
      'operating-manual-sections',
      inauguration ? 'Employee Handbook Section' : 'Operating Manual Section',
      `${manual?.documentsGenerated ?? 0} manual sections — optional contribution; nothing shared automatically.`,
      companyName,
      founderName,
      seed % 7 === 0,
      [industryId, 'operating-manual']
    ),
  ];

  return SHAREABLE_ASSET_TYPES.map(
    (type) => candidates.find((c) => c.type === type) ?? asset(organizationId, type, type, 'Optional contribution.', companyName, founderName, false, [industryId])
  );
}

export function summarizePublishableAssets(assets: PublishableAsset[]): string {
  const published = assets.filter((a) => a.published).length;
  return `${assets.length} shareable asset types · ${published} published · ${assets.length - published} ready to publish · everything optional · IP retained.`;
}
