import { STUDIO_OS_PLATFORM_ASSETS } from '../../studio-os/core/assets';
import { DEFAULT_WORKSPACE_PERMISSIONS } from '../../studio-os/workspace/permissions';
import type { WorkspaceSchema } from '../../studio-os/workspace/types';

/**
 * Frontal Slayer Workspace configuration.
 * All brand-specific knowledge for the first StudioOS workspace lives here.
 */
export const FRONTAL_SLAYER_WORKSPACE: WorkspaceSchema = {
  id: 'frontal-slayer',
  slug: 'frontal-slayer',
  brandName: 'FRONTAL SLAYER',
  displayName: 'FRONTAL SLAYER',
  status: 'active',
  logoSrc: STUDIO_OS_PLATFORM_ASSETS.placeholderThumb,
  colors: {
    primary: '#EB1C24',
    accent: '#EB1C24',
    secondary: '#808080',
  },
  typography: {
    labelFont: 'Futura PT',
    accentFont: 'Covered By Your Grace',
  },
  brandVoice:
    'LUXURY EDITORIAL · TRUST OVER SALES · HANDCRAFTED STORYTELLING · NEVER GENERIC AI',
  brandRules: [
    'WHITE MARBLE · GLASS ACRYLIC · CHERRY RED ACCENT',
    'UPPERCASE FUTURA LABELS · GRACE ACCENT NUMBERS',
    'PSA: TRUSTED FOUNDER PRESENCE — NEVER ROBOTIC',
    'REAL CATALOG UNITS ONLY IN PRODUCT REFERENCES',
  ],
  permissions: DEFAULT_WORKSPACE_PERMISSIONS,
  moduleCopy: {
    'executive-command-center': {
      title: 'THE STUDIO',
      subtitle: 'ONE COMPANY. ONE VIEW. — THE EXECUTIVE CONTROL ROOM OF FRONTAL SLAYER STUDIOS.',
    },
    'studio-dashboard': {
      title: 'THE STUDIO',
      subtitle: 'WHERE EVERY FRONTAL SLAYER STORY BEGINS.',
    },
    'content-brain': {
      subtitle:
        'FRONTAL SLAYER BRAND BIBLE · SHOW BIBLE · EDITORIAL BRAIN — SINGLE SOURCE OF TRUTH FOR ALL AI GENERATION.',
    },
    'creative-director': {
      subtitle: 'THE MIND BEHIND EVERY FRONTAL SLAYER STORY — DECISION ENGINE BEFORE ANY AI PROVIDER.',
    },
    'intelligence-engine': {
      subtitle: 'FRONTAL SLAYER STRATEGIST — EVIDENCE-BASED RECOMMENDATIONS FROM CONNECTED SOURCES ONLY.',
    },
    'show-bible': {
      subtitle: 'THE DNA OF EVERY FRONTAL SLAYER SHOW — NETFLIX HANDBOOK × LUXURY NETWORK STYLE GUIDE.',
    },
    'asset-director': {
      subtitle: 'THE VISUAL SOURCE OF TRUTH — HOW FRONTAL SLAYER LOOKS ACROSS EVERY CHANNEL.',
    },
    'studio-lot': {
      subtitle: 'EVERY STORY STARTS ON SET — THE PRODUCTION CAMPUS OF FRONTAL SLAYER.',
    },
    'talent-agency': {
      subtitle: 'THE FACES BEHIND EVERY FRONTAL SLAYER STORY — LUXURY CASTING DEPARTMENT.',
    },
    'production-pipeline': {
      subtitle: 'TURNING IDEAS INTO EXPERIENCES — THE OPERATIONAL HEART OF FRONTAL SLAYER STUDIOS.',
    },
    'ai-production-engine': {
      subtitle: 'TURNING STRATEGY INTO PRODUCTION — THE EXECUTION TEAM OF FRONTAL SLAYER STUDIOS.',
    },
    'distribution-network': {
      subtitle: 'ONE STORY. EVERY DESTINATION. — THE BROADCASTING DEPARTMENT OF FRONTAL SLAYER STUDIOS.',
    },
    'audience-brain': {
      subtitle: 'LEARNING FROM EVERY INTERACTION — THE FEEDBACK ENGINE OF FRONTAL SLAYER STUDIOS.',
    },
    'legacy-system': {
      subtitle: 'EVERY STORY DESERVES TO BE REMEMBERED — THE LIVING MUSEUM OF FRONTAL SLAYER STUDIOS.',
    },
    studioHub: {
      title: 'THE STUDIO',
      subtitle: 'WHERE EVERY FRONTAL SLAYER STORY BEGINS.',
      dashboardFooter: 'NEXT RELEASE — SLAY REPORT • FRIDAY • 7PM',
    },
  },
  studioEnabled: true,
  studioEntryPath: '/admin/studio/executive-command-center',
  metadata: {
    industry: 'luxury-beauty',
    description: 'First production Workspace on StudioOS — luxury wig house and media studio.',
    tags: ['beauty', 'e-commerce', 'media', 'membership'],
  },
};
