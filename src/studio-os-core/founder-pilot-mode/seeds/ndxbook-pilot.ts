import {
  DEFAULT_BRAND,
  DEFAULT_CREATIVE_DNA,
  DEFAULT_LAUNCH_CHECKLIST,
  DEFAULT_PROGRAMMING,
  DEFAULT_TAXONOMY,
  DEFAULT_VOICE_RULES,
  LAUNCH_VOLUMES,
  NDXBOOK_WORKSPACE_ID,
} from '../../ndxbook/constants';
import type { NdxbookSocialAccount, NdxbookStore } from '../../ndxbook/types';

/** Pilot-phase social accounts — Instagram only active; others locked. */
export const PILOT_SOCIAL_ACCOUNTS: NdxbookSocialAccount[] = [
  {
    id: 'social-instagram',
    platform: 'instagram',
    status: 'not-connected',
    handle: '—',
    email: '—',
    notes: 'Your first publishing destination — connect to begin the pipeline.',
  },
  {
    id: 'social-tiktok',
    platform: 'tiktok',
    status: 'locked',
    handle: '—',
    email: '—',
    notes: 'Locked — perfect the Instagram pipeline first.',
  },
  {
    id: 'social-youtube',
    platform: 'youtube-shorts',
    status: 'locked',
    handle: '—',
    email: '—',
    notes: 'Locked — unlock after Instagram publishing is proven.',
  },
  {
    id: 'social-facebook',
    platform: 'facebook',
    status: 'locked',
    handle: '—',
    email: '—',
    notes: 'Locked — available after pilot phase milestones.',
  },
  {
    id: 'social-newsletter',
    platform: 'threads',
    status: 'locked',
    handle: '—',
    email: '—',
    notes: 'Newsletter — locked until editorial rhythm is established.',
  },
];

export function buildPilotNdxbookStorePatch(): Partial<NdxbookStore> {
  return {
    brand: DEFAULT_BRAND,
    taxonomy: DEFAULT_TAXONOMY,
    volumes: LAUNCH_VOLUMES,
    programming: DEFAULT_PROGRAMMING,
    programmingSlots: [],
    pages: [],
    talentHosts: [],
    socialAccounts: PILOT_SOCIAL_ACCOUNTS,
    voiceRules: DEFAULT_VOICE_RULES,
    creativeDna: DEFAULT_CREATIVE_DNA,
    launchChecklist: DEFAULT_LAUNCH_CHECKLIST.map((item) => ({ ...item })),
    nextPageNumber: 1,
    dashboard: {
      brand: 'ndxbook',
      positioning: DEFAULT_BRAND.positioning,
      launchVolumes: LAUNCH_VOLUMES.length,
      pagesCreated: 0,
      pagesScheduled: 0,
      socialsConnected: 0,
      labsExperiments: 0,
      nextAction: 'connect instagram · create page 001',
    },
  };
}

export const PILOT_NDXBOOK_WORKSPACE_ID = NDXBOOK_WORKSPACE_ID;
