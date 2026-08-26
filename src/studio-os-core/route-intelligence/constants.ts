/** P0.VR.3 — Cross-project design route manifest schema version */
export const DESIGN_ROUTE_MANIFEST_VERSION = '1.0.0';
export const DESIGN_ROUTE_MANIFEST_SCHEMA_VERSION = 'studio-world-design-route-manifest@1';

export const MANIFEST_ARTIFACT_FILENAME = 'studio-world-design-route-manifest.json';
export const MANIFEST_ARTIFACT_RELATIVE_PATH = `public/studio-world/${MANIFEST_ARTIFACT_FILENAME}`;

export const VIEWPORT_CLASSES = ['MOBILE', 'TABLET', 'DESKTOP'] as const;
export const OPTIONAL_VIEWPORT_CLASSES = ['ULTRAWIDE', 'CUSTOM'] as const;

/** Default reference dimensions — projects may override via brandConfig */
export const DEFAULT_VIEWPORT_DIMENSIONS = {
  MOBILE: { referenceWidth: 390, referenceHeight: 844 },
  TABLET: { referenceWidth: 834, referenceHeight: 1194 },
  DESKTOP: { referenceWidth: 1440, referenceHeight: 900 },
  ULTRAWIDE: { referenceWidth: 1920, referenceHeight: 1080 },
} as const;

export const ROUTE_FAMILIES = [
  'MARKETING',
  'COMMERCE',
  'ACCOUNT',
  'ONBOARDING',
  'WORKSPACE',
  'TOOLS',
  'CONTENT',
  'ADMIN',
  'SUPPORT',
  'OTHER',
] as const;

export const DESIGN_ROUTE_PRIORITIES = [
  'CRITICAL',
  'PRIMARY',
  'SECONDARY',
  'SUPPORTING',
  'INTERNAL',
] as const;

export const DESIGNABLE_SURFACE_CLASSES = [
  'FOUNDER_DESIGNABLE',
  'SYSTEM_INTERNAL',
  'DEV_ONLY',
  'TEST_ONLY',
  'DEPRECATED',
] as const;

export const FAILURE_TAXONOMY = [
  'FAIL_PROJECT_DISCOVERY_INCOMPLETE',
  'FAIL_ROUTER_ROUTE_OMITTED',
  'FAIL_LINK_TARGET_NOT_AUDITED',
  'FAIL_DEPENDENCY_ROUTE_MISSING',
  'FAIL_ROUTE_ORPHANED',
  'FAIL_ROUTE_DUPLICATE_UNKNOWN_AUTHORITY',
  'FAIL_VIEWPORT_COVERAGE_UNKNOWN',
  'FAIL_REFERENCE_COVERAGE_UNKNOWN',
  'FAIL_IMPLEMENTATION_COVERAGE_UNKNOWN',
  'FAIL_MOBILE_DESKTOP_CONFLATED',
  'FAIL_TABLET_CONFLATED_WITH_MOBILE',
  'FAIL_OUTDATED_REFERENCE_ACTIVE',
  'FAIL_ROUTE_MANIFEST_STALE',
  'FAIL_CROSS_PROJECT_ROUTE_LEAK',
  'FAIL_DESIGNABLE_ROUTE_NOT_VISIBLE_IN_DESIGN',
] as const;
