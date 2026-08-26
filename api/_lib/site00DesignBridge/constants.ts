/** P0.BRIDGE.1-FSBW — project mappings and path policy */

import type { Site00ProjectKey } from './types.js';

export const PROJECT_SOURCE_ROOTS: Record<Site00ProjectKey, string> = {
  FRONTAL_SLAYER: 'src',
  ALL_IN_ONE_ENTERPRISES: 'all-in-one-enterprises',
  STUDIO_WORLD_WEBSITE: 'src/features/studio-world',
};

export const PROJECT_PATH_ALLOWLISTS: Record<Site00ProjectKey, RegExp[]> = {
  FRONTAL_SLAYER: [
    /^src\/pages\//,
    /^src\/components\//,
    /^src\/styles\//,
    /^src\/features\/frontal-slayer\//,
    /^public\//,
  ],
  ALL_IN_ONE_ENTERPRISES: [
    /^all-in-one-enterprises\/src\//,
    /^all-in-one-enterprises\/public\//,
  ],
  STUDIO_WORLD_WEBSITE: [
    /^src\/features\/studio-world\/website\//,
    /^src\/features\/studio-world\/marketing\//,
    /^public\/studio-world\/website\//,
  ],
};

/** Sensitive paths — never writable via SITE 00 bridge */
export const GLOBAL_PATH_DENYLIST: RegExp[] = [
  /^\.env/,
  /^\.cursor\//,
  /^supabase\//,
  /^api\/_lib\/supabase/,
  /^scripts\/agent-commit/,
  /service.?role/i,
  /^src\/studio-os-core\//,
  /^src\/components\/admin\/studio\//,
  /^api\/admin\/studio/,
  /^api\/_lib\/productAssetFactory\//,
  /^api\/admin\/product-asset-factory/,
  /^src\/services\/studio\/brandAssetsProductAssetFactory\//,
];

/** Studio World native infrastructure — blocked for STUDIO_WORLD_WEBSITE project */
export const STUDIO_WORLD_NATIVE_DENYLIST: RegExp[] = [
  /^src\/studio-os-core\//,
  /^src\/features\/studio-world\/experience-lab/,
  /^src\/features\/studio-world\/genesis/,
  /^src\/features\/studio-world\/world-compiler/,
  /^src\/components\/admin\/studio/,
  /^api\/admin\/studio/,
  /^api\/_lib\/creativeProduction\//,
];

/** P0.PAF — product imagery authority paths */
export const P0_PAF_PROTECTED_PATTERNS: RegExp[] = [
  /^src\/pages\/.*\/product/i,
  /^src\/components\/.*Product/i,
  /^api\/_lib\/productAssetFactory\//,
  /^api\/admin\/product-asset-factory/,
  /^src\/services\/studio\/brandAssetsProductAssetFactory\//,
];

export const ALLOWED_DESIGN_TOKEN_KEYS = new Set([
  'color.primary',
  'color.secondary',
  'color.accent',
  'color.background',
  'color.text',
  'spacing.section',
  'spacing.gutter',
  'typography.heading',
  'typography.body',
  'radius.card',
  'radius.button',
]);

export const ALLOWED_COMPONENT_VARIANTS: Record<string, Set<string>> = {
  HeroSection: new Set(['default', 'compact', 'immersive']),
  NavShell: new Set(['default', 'minimal', 'expanded']),
  FooterShell: new Set(['default', 'compact']),
  ContentSection: new Set(['default', 'split', 'stacked']),
};

export const ALLOWED_SECTION_KEYS = new Set([
  'hero',
  'features',
  'cta',
  'testimonials',
  'gallery',
  'faq',
  'footer',
  'nav',
  'content',
]);

export const PROJECT_TEST_COMMANDS: Record<Site00ProjectKey, string[]> = {
  FRONTAL_SLAYER: ['npm run test -- api/_lib/site00DesignBridge/site00DesignBridge.test.ts'],
  ALL_IN_ONE_ENTERPRISES: ['npm run test:aio'],
  STUDIO_WORLD_WEBSITE: ['npm run test -- api/_lib/site00DesignBridge/site00DesignBridge.test.ts'],
};

export const PROJECT_BUILD_COMMANDS: Record<Site00ProjectKey, string[]> = {
  FRONTAL_SLAYER: ['npm run build'],
  ALL_IN_ONE_ENTERPRISES: ['npm run test:aio:build'],
  STUDIO_WORLD_WEBSITE: ['npm run build'],
};

export const FORBIDDEN_OPERATION_KEYS = [
  'code',
  'rawCode',
  'script',
  'shellCommand',
  'command',
  'eval',
  'execute',
  'importPath',
  'dynamicImport',
  'fileReplacementPayload',
  'remoteScript',
] as const;
