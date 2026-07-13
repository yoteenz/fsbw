import type { CanonicalMainDepartmentId } from './canonical-department-registry';

export const ARCHITECTURAL_FINGERPRINT_VERSION = 'architectural-fingerprint.v1' as const;

export type ArchitecturalFingerprint = {
  fingerprintVersion: typeof ARCHITECTURAL_FINGERPRINT_VERSION;
  departmentId: CanonicalMainDepartmentId;
  shellId: string;
  signatureElements: string[];
  forbiddenElements: string[];
};

/** Reception contamination markers — must never appear in non-reception canonical departments. */
export const RECEPTION_CONTAMINATION_MARKERS = [
  'ReceptionShell',
  'shell-reception',
  'ReceptionDesk',
  'ReceptionDeskSocket',
  'CrystalLandmark',
  'LandmarkSocket',
  'LeftSeating',
  'RightSeating',
  'Waiting Lounge',
  'Reception Foyer',
  'concierge desk',
  'reception desk',
  'waiting room',
  'receptionist furniture',
] as const;

const fingerprint = (
  departmentId: CanonicalMainDepartmentId,
  shellId: string,
  signatureElements: string[],
  forbiddenElements: string[] = [...RECEPTION_CONTAMINATION_MARKERS]
): ArchitecturalFingerprint => ({
  fingerprintVersion: ARCHITECTURAL_FINGERPRINT_VERSION,
  departmentId,
  shellId,
  signatureElements,
  forbiddenElements,
});

export const DEPARTMENT_ARCHITECTURAL_FINGERPRINTS: Record<CanonicalMainDepartmentId, ArchitecturalFingerprint> = {
  'experience-lab': fingerprint('experience-lab', 'ExperienceLabShell', [
    'Architecture Studio',
    'Blueprint Holograms',
    'Floating Room Model',
    'Construction Tables',
    'Material Library',
    'Command Dock',
    'Workbench',
    'Holographic Blueprint Wall',
    'Lighting Study Rigs',
  ]),
  'blueprint-author': fingerprint('blueprint-author', 'BlueprintAuthorShell', [
    'Specification Console',
    'Blueprint Drafting Tables',
    'Socket Registry Wall',
    'Construction Spec Displays',
    'Command Dock',
    'Workbench',
  ]),
  'world-compiler': fingerprint('world-compiler', 'WorldCompilerShell', [
    'Compilation Chamber',
    'Runtime Assembly Tables',
    'Scene Stack Monitors',
    'World Graph Displays',
    'Command Dock',
    'Workbench',
  ]),
  'construction-mode': fingerprint('construction-mode', 'ConstructionModeShell', [
    'Assembly Floor',
    'Manufacturing Bays',
    'Approved Asset Crates',
    'Assembly Consoles',
    'Command Dock',
    'Workbench',
  ]),
  'creative-director-studio': fingerprint('creative-director-studio', 'CreativeDirectorStudioShell', [
    'Production Stage',
    'Asset Breakdown',
    'Version Wall',
    'Lighting Rig',
    'Reference Library',
    'Approval Console',
    'Material Testing Bench',
    'Camera Rig',
  ]),
  'material-lab': fingerprint('material-lab', 'MaterialLabShell', [
    'Material Sample Wall',
    'Texture Testing Stations',
    'Brand Material Vault',
    'Swatch Library',
    'Command Dock',
    'Workbench',
  ]),
  'lighting-studio': fingerprint('lighting-studio', 'LightingStudioShell', [
    'Lighting Rig Array',
    'Gobo Library',
    'Color Temperature Lab',
    'Reflection Study Zone',
    'Command Dock',
    'Workbench',
  ]),
  'composition-studio': fingerprint('composition-studio', 'CompositionStudioShell', [
    'Device Framing Wall',
    'Aspect Ratio Displays',
    'Composition Grid Tables',
    'Multi-Device Preview Racks',
    'Command Dock',
    'Workbench',
  ]),
  'animation-studio': fingerprint('animation-studio', 'AnimationStudioShell', [
    'Motion Capture Stage',
    'Timeline Consoles',
    'Keyframe Displays',
    'Animation Preview Wall',
    'Command Dock',
    'Workbench',
  ]),
  'character-studio': fingerprint('character-studio', 'CharacterStudioShell', [
    'Casting Stage',
    'Talent Turntable',
    'Character Reference Wall',
    'Wardrobe Racks',
    'Command Dock',
    'Workbench',
  ]),
  'command-center': fingerprint('command-center', 'CommandCenterShell', [
    'Mission Wall',
    'City Telemetry',
    'Organization Graph',
    'AI Monitoring',
    'Municipal Command Tables',
    'Operations Bridge',
    'Incident Feed Displays',
  ]),
  'ai-workforce-center': fingerprint('ai-workforce-center', 'AiWorkforceCenterShell', [
    'Worker Orchestration Wall',
    'Queue Management Consoles',
    'Manufacturing Worker Bays',
    'Dispatch Tables',
    'Command Dock',
    'Workbench',
  ]),
  'asset-registry': fingerprint('asset-registry', 'AssetRegistryShell', [
    'Asset Vault Displays',
    'Registry Catalog Wall',
    'Version Tracking Consoles',
    'Asset Turntables',
    'Command Dock',
    'Workbench',
  ]),
  'studio-world-registry': fingerprint('studio-world-registry', 'StudioWorldRegistryShell', [
    'Published Department Catalog',
    'Infrastructure Registry Wall',
    'Canonical Version Displays',
    'Command Dock',
    'Workbench',
  ]),
  'observatory': fingerprint('observatory', 'ObservatoryShell', [
    'Experience Intelligence Wall',
    'Architecture Observability Displays',
    'Telemetry Panoramas',
    'Diagnostic Consoles',
    'Command Dock',
    'Workbench',
  ]),
  'city-council': fingerprint('city-council', 'CityCouncilShell', [
    'Council Chamber Dais',
    'Municipal Vote Panels',
    'Governance Displays',
    'Jurisdiction Maps',
    'Command Dock',
    'Workbench',
  ]),
  'permit-center': fingerprint('permit-center', 'PermitCenterShell', [
    'Permit Review Consoles',
    'Construction Permit Wall',
    'Application Processing Tables',
    'Command Dock',
    'Workbench',
  ]),
  'quality-guard': fingerprint('quality-guard', 'QualityGuardShell', [
    'Quality Inspection Stations',
    'Parity Validation Displays',
    'Composition Check Consoles',
    'Command Dock',
    'Workbench',
  ]),
  'immune-system': fingerprint('immune-system', 'ImmuneSystemShell', [
    'Boundary Enforcement Wall',
    'Routing Validation Consoles',
    'Drift Detection Displays',
    'Architecture Law Monitors',
    'Command Dock',
    'Workbench',
  ]),
  'marketplace': fingerprint('marketplace', 'MarketplaceShell', [
    'Storefronts',
    'Licensing Displays',
    'Creator Kiosks',
    'Featured Mods',
    'Commerce Galleries',
    'Command Dock',
    'Workbench',
  ]),
  'mod-registry': fingerprint('mod-registry', 'ModRegistryShell', [
    'Mod Catalog Wall',
    'Attachment Rule Displays',
    'Approved Mod Vault',
    'Command Dock',
    'Workbench',
  ]),
  'certification-center': fingerprint('certification-center', 'CertificationCenterShell', [
    'Certification Review Stations',
    'Compliance Displays',
    'Marketplace Approval Consoles',
    'Command Dock',
    'Workbench',
  ]),
  'founder-suite': fingerprint('founder-suite', 'ExecutiveAtriumShell', [
    'Monumental Central Gathering Space',
    'Premium Executive Architecture',
    'Executive Circulation',
    'Presentation Areas',
    'Command Dock',
    'Workbench',
  ]),
  'founder-dashboard': fingerprint('founder-dashboard', 'FounderDashboardShell', [
    'Executive Operating Dashboard',
    'Founder Metrics Wall',
    'Strategic Overview Displays',
    'Command Dock',
    'Workbench',
  ]),
  'founder-archive': fingerprint('founder-archive', 'FounderArchiveShell', [
    'Legacy Vault Displays',
    'Historical Archive Wall',
    'Founder Legacy Consoles',
    'Command Dock',
    'Workbench',
  ]),
};

export function resolveDepartmentFingerprint(departmentId: CanonicalMainDepartmentId): ArchitecturalFingerprint {
  return DEPARTMENT_ARCHITECTURAL_FINGERPRINTS[departmentId];
}

export function containsReceptionContamination(text: string): string | null {
  const positiveOnly = text
    .split(/\n\n/)
    .filter((section) => !section.startsWith('NEVER INCLUDE') && !section.toLowerCase().includes('forbidden outputs'))
    .join('\n\n');
  const lower = positiveOnly.toLowerCase();
  for (const marker of RECEPTION_CONTAMINATION_MARKERS) {
    if (lower.includes(marker.toLowerCase())) return marker;
  }
  return null;
}
