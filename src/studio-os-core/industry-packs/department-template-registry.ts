import type {
  BusinessArchetypeId,
  DepartmentTemplate,
  DepartmentTemplateId,
  SharedDepartmentInstance,
  SharedDepartmentRegistry,
} from './contract';
import { INDUSTRY_PACKS_VERSION } from './contract';

function dept(
  templateId: DepartmentTemplateId,
  displayName: string,
  description: string,
  purpose: string,
  compatibleArchetypes: BusinessArchetypeId[],
  currentVersion: string,
  defaultSocketIds: string[] = []
): DepartmentTemplate {
  return {
    templateId,
    displayName,
    description,
    purpose,
    defaultSocketIds,
    defaultCapabilities: ['founder-render', 'scene-stack'],
    constructionTemplateId: `construction-template.${templateId}`,
    compatibleArchetypes,
    currentVersion,
    registryVersion: INDUSTRY_PACKS_VERSION,
  };
}

/** Shared Department Registry™ — reusable department templates, not pack-owned. */
export const DEPARTMENT_TEMPLATE_CATALOG: DepartmentTemplate[] = [
  dept('reception', 'Reception', 'Guest arrival and first impression', 'Arrival desk and greeting', ['beauty', 'healthcare', 'professional-services', 'retail', 'real-estate', 'creative'], 'v6', ['reception-desk', 'guest-seating']),
  dept('lobby', 'Lobby', 'Primary circulation hall', 'Arrival and wayfinding', ['beauty', 'healthcare', 'professional-services', 'hospitality', 'retail'], 'v4', ['lobby-hero', 'circulation-path']),
  dept('waiting-area', 'Waiting Area', 'Client waiting zone', 'Comfortable queue and seating', ['healthcare', 'beauty', 'professional-services'], 'v3', ['waiting-seating']),
  dept('office', 'Office', 'Staff workspace', 'Daily operations', ['beauty', 'healthcare', 'professional-services', 'technology', 'finance', 'real-estate'], 'v9', ['desk-cluster']),
  dept('conference-room', 'Conference Room', 'Meetings and presentations', 'Client and team meetings', ['professional-services', 'technology', 'finance', 'healthcare'], 'v5', ['conference-table']),
  dept('inventory', 'Inventory', 'Stock and supply storage', 'Product and supply management', ['beauty', 'retail', 'manufacturing', 'food-beverage'], 'v3', ['shelving-bay']),
  dept('break-room', 'Break Room', 'Staff rest area', 'Employee break and recharge', ['professional-services', 'healthcare', 'retail', 'manufacturing'], 'v2', ['break-table']),
  dept('training-room', 'Training Room', 'Education and onboarding', 'Staff training sessions', ['beauty', 'fitness', 'education', 'retail'], 'v4', ['training-station']),
  dept('storage', 'Storage', 'General storage', 'Equipment and supply storage', ['healthcare', 'retail', 'hospitality', 'construction'], 'v2', ['storage-rack']),
  dept('mechanical-room', 'Mechanical Room', 'Building systems', 'HVAC and utilities', ['hospitality', 'healthcare', 'manufacturing', 'construction'], 'v1', []),
  dept('executive-office', 'Executive Office', 'Leadership private office', 'Executive decisions', ['professional-services', 'finance', 'technology', 'real-estate'], 'v3', ['executive-desk']),
  dept('checkout', 'Checkout', 'Point of sale', 'Transaction completion', ['beauty', 'retail', 'food-beverage'], 'v2', ['checkout-counter']),
  dept('photo-studio', 'Photo Studio', 'Content and portfolio capture', 'Visual content production', ['beauty', 'creative', 'retail'], 'v2', ['photo-backdrop']),
  dept('retail-floor', 'Retail Floor', 'Customer shopping area', 'Product display and sales', ['retail', 'beauty', 'food-beverage'], 'v3', ['display-fixture']),
  dept('kitchen', 'Kitchen', 'Food preparation', 'Culinary production', ['food-beverage', 'hospitality'], 'v2', ['prep-station']),
  dept('dining-area', 'Dining Area', 'Guest dining', 'Seated service', ['food-beverage', 'hospitality'], 'v2', ['dining-table']),
  dept('treatment-room', 'Treatment Room', 'Service delivery room', 'Client treatment sessions', ['beauty', 'wellness', 'healthcare'], 'v3', ['treatment-chair']),
  dept('exam-room', 'Exam Room', 'Clinical examination', 'Patient examination', ['healthcare'], 'v2', ['exam-table']),
  dept('retail-boutique', 'Boutique Floor', 'Curated retail experience', 'Premium product presentation', ['retail', 'beauty'], 'v2', ['boutique-display']),
  dept('studio-floor', 'Studio Floor', 'Creative production floor', 'Active creative work', ['creative', 'entertainment', 'beauty'], 'v2', ['studio-desk']),
  dept('reception-waiting', 'Reception + Waiting', 'Combined arrival and queue', 'Compact medical/salon arrival', ['healthcare', 'beauty'], 'v2', ['reception-desk', 'waiting-seating']),
];

export function getDepartmentTemplate(templateId: DepartmentTemplateId): DepartmentTemplate | undefined {
  return DEPARTMENT_TEMPLATE_CATALOG.find((d) => d.templateId === templateId);
}

export function listDepartmentTemplatesForArchetype(archetypeId: BusinessArchetypeId): DepartmentTemplate[] {
  return DEPARTMENT_TEMPLATE_CATALOG.filter((d) => d.compatibleArchetypes.includes(archetypeId));
}

/** Canonical shared instances — Reception v6 reused across packs (fixture seed). */
export const SHARED_DEPARTMENT_REGISTRY: SharedDepartmentRegistry = {
  registryVersion: INDUSTRY_PACKS_VERSION,
  instances: [
    sharedInstance('reception', 'v6', 'shared-reception-v6'),
    sharedInstance('lobby', 'v4', 'shared-lobby-v4'),
    sharedInstance('office', 'v9', 'shared-office-v9'),
    sharedInstance('conference-room', 'v5', 'shared-conference-v5'),
    sharedInstance('inventory', 'v3', 'shared-inventory-v3'),
    sharedInstance('waiting-area', 'v3', 'shared-waiting-v3'),
    sharedInstance('break-room', 'v2', 'shared-break-v2'),
    sharedInstance('training-room', 'v4', 'shared-training-v4'),
    sharedInstance('storage', 'v2', 'shared-storage-v2'),
    sharedInstance('checkout', 'v2', 'shared-checkout-v2'),
    sharedInstance('photo-studio', 'v2', 'shared-photo-studio-v2'),
  ],
};

function sharedInstance(
  templateId: DepartmentTemplateId,
  templateVersion: string,
  instanceId: string
): SharedDepartmentInstance {
  const template = getDepartmentTemplate(templateId)!;
  return {
    instanceId,
    templateId,
    templateVersion,
    blueprintTemplateId: `blueprint.${templateId}.${templateVersion}`,
    constructionTemplateId: template.constructionTemplateId,
    materialLibraryId: 'founder-material-library',
    lightingProfileId: `lighting.${templateId}`,
    cameraPackId: `camera-pack.${templateId}`,
    renderArtifactUrl: null,
    generatedAt: null,
    reuseCount: 0,
    registryVersion: INDUSTRY_PACKS_VERSION,
  };
}

export function getSharedDepartmentInstance(
  registry: SharedDepartmentRegistry,
  templateId: DepartmentTemplateId,
  templateVersion: string
): SharedDepartmentInstance | undefined {
  return registry.instances.find(
    (i) => i.templateId === templateId && i.templateVersion === templateVersion
  );
}

export function incrementReuseCount(
  registry: SharedDepartmentRegistry,
  instanceId: string
): SharedDepartmentRegistry {
  return {
    ...registry,
    instances: registry.instances.map((i) =>
      i.instanceId === instanceId ? { ...i, reuseCount: i.reuseCount + 1 } : i
    ),
  };
}
