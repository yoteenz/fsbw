import { STUDIO_OS_PLATFORM_ASSETS } from '../../studio-os-core/core/assets';
import { DEFAULT_WORKSPACE_PERMISSIONS } from '../../studio-os-core/workspace/permissions';
import { STUDIO_OS_ROUTES } from '../../studio-os-core/workspace/routes';
import type { WorkspaceSchema } from '../../studio-os-core/workspace/types';

/** NDXBOOK — AI Media workspace on Studio OS (platform id: ai-media). */
export const AI_MEDIA_NDXBOOK_WORKSPACE: WorkspaceSchema = {
  id: 'ai-media',
  slug: 'ai-media',
  brandName: 'NDXBOOK',
  displayName: 'NDXBOOK',
  status: 'active',
  logoSrc: STUDIO_OS_PLATFORM_ASSETS.placeholderThumb,
  colors: {
    primary: '#6366F1',
    accent: '#6366F1',
    secondary: '#808080',
  },
  typography: {
    labelFont: 'Futura PT',
    accentFont: 'Covered By Your Grace',
  },
  brandVoice: 'THE INDEX FOR EVERYDAY KNOWLEDGE · EVERY PAGE MAKES YOU SMARTER',
  brandRules: [
    'EDUCATIONAL MEDIA · SHORT-FORM RITUAL',
    'READER TRUST BEFORE SCALE',
    'AI MEDIA NETWORK OPERATING MODEL',
  ],
  permissions: { ...DEFAULT_WORKSPACE_PERMISSIONS, canAccessStudioModules: true },
  moduleCopy: {
    'mission-control': {
      title: 'MISSION CONTROL',
      subtitle: 'NDXBOOK HQ · AI MEDIA OPERATING CENTER · TODAY\'S BRIEFING FIRST.',
    },
    'production-studio': {
      subtitle: 'Cinematic production headquarters — every approved page becomes media.',
    },
    ndxbook: {
      title: 'NDXBOOK',
      subtitle: 'PUBLIC MEDIA BRAND · THE INDEX FOR EVERYDAY KNOWLEDGE.',
    },
    'distribution-network': {
      subtitle: 'ONE STORY · EVERY KNOWLEDGE PAGE — THE BROADCASTING DEPARTMENT OF NDXBOOK.',
    },
    'distribution-engine': {
      subtitle: 'GLOBAL KNOWLEDGE ASSET DISTRIBUTION — CHANNEL OPTIMIZATION FOR NDXBOOK.',
    },
    studioHub: {
      title: 'NDXBOOK STUDIO',
      subtitle: 'AI MEDIA · NEWSROOM · PRODUCTION · REVENUE.',
      dashboardFooter: 'NEXT · PAGE 028 · EDITORIAL BOARD',
    },
  },
  studioEnabled: true,
  studioEntryPath: STUDIO_OS_ROUTES.workspaceDashboard('ai-media'),
  metadata: {
    industry: 'digital-media',
    description: 'Educational media brand — index for everyday knowledge · AI Media pilot workspace.',
    tags: ['media', 'ndxbook', 'ai-media', 'newsroom'],
  },
};
