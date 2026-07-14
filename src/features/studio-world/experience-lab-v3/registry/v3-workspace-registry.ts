import experienceLabV2ViewportEnvironmentUrl from '../../../../assets/studio-world/experience-lab/experience-lab-v2-viewport-environment.png';
import type { V3CoreWorkspaceId, V3DesignVariantId, V3DesignVariantRecord } from '../experience-lab-v3.types';

export const V3_DESIGN_VARIANT_IDS: V3DesignVariantId[] = [
  'light-01',
  'light-02',
  'light-03',
  'dark-01',
  'dark-02',
  'dark-03',
];

export const V3_DESIGN_VARIANTS_SECTION_LABEL = 'DESIGN VARIANTS';

const PREVIEW_URL = experienceLabV2ViewportEnvironmentUrl;

export function buildV3DesignVariants(departmentId: string, revision: number): V3DesignVariantRecord[] {
  const names: Record<V3DesignVariantId, string> = {
    'light-01': 'LUMEN A',
    'light-02': 'LUMEN B',
    'light-03': 'LUMEN C',
    'dark-01': 'NOIR A',
    'dark-02': 'NOIR B',
    'dark-03': 'NOIR C',
  };

  return V3_DESIGN_VARIANT_IDS.map((id, index) => ({
    id,
    name: names[id],
    theme: id.startsWith('light') ? 'light' : 'dark',
    environmentPackageId: `pkg.${departmentId}.${id}.r${revision}`,
    previewEnvironmentUrl: PREVIEW_URL,
    thumbnailUrl: PREVIEW_URL,
    revision,
    cardStatus: index === 0 ? 'canonical' : index === 1 ? 'generating' : 'active',
  }));
}

export type V3WorkspaceDefinition = {
  id: V3CoreWorkspaceId;
  label: string;
  subtitle: string;
};

export const V3_CORE_WORKSPACES: V3WorkspaceDefinition[] = [
  { id: 'environment', label: 'ENVIRONMENT', subtitle: 'Creative design' },
  { id: 'production', label: 'PRODUCTION', subtitle: 'Mission control' },
  { id: 'review', label: 'REVIEW', subtitle: 'Founder decisions' },
  { id: 'assets', label: 'ASSETS', subtitle: 'Studio warehouse' },
  { id: 'command', label: 'COMMAND', subtitle: 'Mission control' },
];

export function resolveV3WorkspaceIndex(id: V3CoreWorkspaceId): number {
  return V3_CORE_WORKSPACES.findIndex((w) => w.id === id);
}

export function resolveV3WorkspaceByOffset(
  current: V3CoreWorkspaceId,
  delta: number
): V3CoreWorkspaceId {
  const idx = resolveV3WorkspaceIndex(current);
  const next = (idx + delta + V3_CORE_WORKSPACES.length) % V3_CORE_WORKSPACES.length;
  return V3_CORE_WORKSPACES[next]!.id;
}
