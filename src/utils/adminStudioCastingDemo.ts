/** CASTING — talent management & production casting board (CMS-ready). */

export const ADMIN_STUDIO_CASTING_SUBTITLE =
  'BRINGING EVERY STORY TO LIFE — LUXURY CASTING DEPARTMENT.';

export type CastingDashboardSectionId =
  | 'active-talent'
  | 'available-talent'
  | 'upcoming-castings'
  | 'current-productions'
  | 'guest-talent'
  | 'community-talent'
  | 'talent-requests'
  | 'talent-schedule'
  | 'talent-analytics';

export const CASTING_DASHBOARD_SECTIONS: Array<{
  id: CastingDashboardSectionId;
  title: string;
  metric: string;
  description: string;
}> = [
  { id: 'active-talent', title: 'ACTIVE TALENT', metric: '9', description: 'SIGNED · ON ROSTER · PRODUCTION-READY' },
  { id: 'available-talent', title: 'AVAILABLE TALENT', metric: '6', description: 'OPEN FOR NEXT EPISODE CASTING' },
  { id: 'upcoming-castings', title: 'UPCOMING CASTINGS', metric: '4', description: 'SCHEDULED CASTING SESSIONS' },
  { id: 'current-productions', title: 'CURRENT PRODUCTIONS', metric: '7', description: 'IN CASTING OR FILMING' },
  { id: 'guest-talent', title: 'GUEST TALENT', metric: '3', description: 'ROTATING · SEASONAL · EXPERT' },
  { id: 'community-talent', title: 'COMMUNITY TALENT', metric: '12', description: 'APPLIED · REVIEWING · APPROVED' },
  { id: 'talent-requests', title: 'TALENT REQUESTS', metric: '5', description: 'SHOW REQUESTS · ROLE NEEDS' },
  { id: 'talent-schedule', title: 'TALENT SCHEDULE', metric: '14', description: 'AVAILABILITY · SHOOT DATES' },
  { id: 'talent-analytics', title: 'TALENT ANALYTICS', metric: '—', description: 'ENGAGEMENT · CONVERSION · FAVORITES' },
];

export type CastingProductionTabId =
  | 'board'
  | 'workflow'
  | 'roles'
  | 'talent'
  | 'wardrobe'
  | 'expressions'
  | 'schedule'
  | 'continuity'
  | 'licensing';

export const CASTING_PRODUCTION_TABS: Array<{ id: CastingProductionTabId; label: string }> = [
  { id: 'board', label: 'BOARD' },
  { id: 'workflow', label: 'WORKFLOW' },
  { id: 'roles', label: 'ROLES' },
  { id: 'talent', label: 'TALENT' },
  { id: 'wardrobe', label: 'WARDROBE' },
  { id: 'expressions', label: 'EXPRESSIONS' },
  { id: 'schedule', label: 'SCHEDULE' },
  { id: 'continuity', label: 'CONTINUITY' },
  { id: 'licensing', label: 'LICENSING' },
];

export type CastingTalentTabId =
  | 'profile'
  | 'shows'
  | 'studios'
  | 'wardrobe'
  | 'expressions'
  | 'community'
  | 'schedule'
  | 'analytics'
  | 'licensing';

export const CASTING_TALENT_TABS: Array<{ id: CastingTalentTabId; label: string }> = [
  { id: 'profile', label: 'PROFILE' },
  { id: 'shows', label: 'SHOWS' },
  { id: 'studios', label: 'STUDIOS' },
  { id: 'wardrobe', label: 'WARDROBE' },
  { id: 'expressions', label: 'EXPRESSIONS' },
  { id: 'community', label: 'COMMUNITY' },
  { id: 'schedule', label: 'SCHEDULE' },
  { id: 'analytics', label: 'ANALYTICS' },
  { id: 'licensing', label: 'LICENSING' },
];

export type CastingProductionStatus =
  | 'draft'
  | 'casting'
  | 'approved'
  | 'locked'
  | 'filming'
  | 'post'
  | 'scheduled'
  | 'released';

export type CastingTalentStatus =
  | 'available'
  | 'booked'
  | 'filming'
  | 'on-break'
  | 'season-complete'
  | 'retired'
  | 'inactive'
  | 'guest-appearance';

export type CommunityTalentStatus =
  | 'applied'
  | 'reviewing'
  | 'approved'
  | 'guest-star'
  | 'recurring-guest'
  | 'series-regular'
  | 'hall-of-fame';

export type CastingWorkflowStepId =
  | 'create-episode'
  | 'select-show'
  | 'select-studio'
  | 'select-roles'
  | 'assign-talent'
  | 'review-availability'
  | 'approve-cast'
  | 'lock-cast'
  | 'production-pipeline';

export const CASTING_WORKFLOW_STEPS: Array<{ id: CastingWorkflowStepId; label: string }> = [
  { id: 'create-episode', label: 'CREATE EPISODE' },
  { id: 'select-show', label: 'SELECT SHOW' },
  { id: 'select-studio', label: 'SELECT STUDIO' },
  { id: 'select-roles', label: 'SELECT REQUIRED ROLES' },
  { id: 'assign-talent', label: 'ASSIGN TALENT' },
  { id: 'review-availability', label: 'REVIEW AVAILABILITY' },
  { id: 'approve-cast', label: 'APPROVE CAST' },
  { id: 'lock-cast', label: 'LOCK CAST' },
  { id: 'production-pipeline', label: 'PRODUCTION PIPELINE' },
];

export const CASTING_INHERITANCE_CHAIN = [
  'TALENT AGENCY',
  'CASTING',
  'PRODUCTION PIPELINE',
  'AI GENERATION',
  'PUBLISHING',
] as const;

export const CASTING_ROLE_LIBRARY = [
  'HOST',
  'CO-HOST',
  'LUXURY STYLIST',
  'HAIR SCIENTIST',
  'BEAUTY REPORTER',
  'COLOR SPECIALIST',
  'PRODUCT EXPERT',
  'GUEST EXPERT',
  'FOUNDER',
  'COMMUNITY SPOTLIGHT',
  'BRAND AMBASSADOR',
  'SEASONAL GUEST',
] as const;

export const CASTING_WARDROBE_COLLECTIONS = [
  'LUXURY EDITORIAL',
  'BUSINESS',
  'SCIENTIST',
  'WEATHER HOST',
  'BUILD STUDIO',
  'CAMPAIGN',
  'HOLIDAY',
  'LAUNCH',
  'EVENING',
  'MINIMAL',
] as const;

export const CASTING_EXPRESSION_PRESETS = [
  'LUXURY SMILE',
  'NEUTRAL',
  'TEACHING',
  'THINKING',
  'CELEBRATING',
  'WELCOMING',
  'LUXURY PORTRAIT',
  'PRODUCT SHOWCASE',
  'INTERVIEW',
] as const;

export type CastingProductionEntry = {
  id: string;
  accentHex: string;
  showName: string;
  episodeTitle: string;
  episodeNumber: string;
  studioName: string;
  requiredRoles: string;
  selectedTalent: string;
  backupTalent: string;
  productionStatus: CastingProductionStatus;
  shootDate: string;
  publishDate: string;
  workflowState: Record<CastingWorkflowStepId, boolean>;
  wardrobeAssignment: string;
  expressionPreset: string;
  scheduleNotes: string;
  continuityNotes: string;
  licensingNotes: string;
};

export type CastingTalentProfile = {
  id: string;
  talentAgencyId: string;
  accentHex: string;
  portraitSrc: string;
  name: string;
  role: string;
  castingStatus: CastingTalentStatus;
  primaryShows: string;
  currentSeason: string;
  episodesAppeared: string;
  studiosAssigned: string;
  voiceProfileSummary: string;
  wardrobeCount: string;
  firstAppearance: string;
  latestAppearance: string;
  availability: string;
  recurringShows: string;
  guestShows: string;
  upcomingEpisodes: string;
  previousEpisodes: string;
  episodeHistory: string;
  studioAssignments: string;
  wardrobeAssignments: string;
  expressionPresets: string;
  scheduleCalendar: string;
  analyticsEpisodes: string;
  analyticsShows: string;
  analyticsWatchTime: string;
  analyticsEngagement: string;
  analyticsCtr: string;
  analyticsFavorites: string;
  analyticsShared: string;
  analyticsConversion: string;
  signedRelease: string;
  aiLikenessPermission: string;
  voicePermission: string;
  imagePermission: string;
  contentUsageRights: string;
  contractExpiration: string;
  renewalReminder: string;
  talentNotes: string;
  communityStatus: CommunityTalentStatus | '';
};

export type CommunityTalentEntry = {
  id: string;
  name: string;
  status: CommunityTalentStatus;
  appliedDate: string;
  notes: string;
};

export type CastingCallEntry = {
  id: string;
  title: string;
  type: string;
  status: 'inactive' | 'planned';
  description: string;
};

export type CastingProductionFieldKey = keyof Omit<CastingProductionEntry, 'id' | 'accentHex' | 'productionStatus' | 'workflowState'>;
export type CastingTalentFieldKey = keyof Omit<CastingTalentProfile, 'id' | 'talentAgencyId' | 'accentHex' | 'portraitSrc' | 'castingStatus'>;

export type CastingFieldDef = { key: string; label: string; multiline?: boolean };
export type CastingFieldGroup = { title: string; fields: CastingFieldDef[] };

export const CASTING_PRODUCTION_BOARD_GROUPS: CastingFieldGroup[] = [
  {
    title: 'PRODUCTION',
    fields: [
      { key: 'showName', label: 'SHOW' },
      { key: 'episodeTitle', label: 'EPISODE TITLE' },
      { key: 'episodeNumber', label: 'EPISODE NUMBER' },
      { key: 'studioName', label: 'STUDIO' },
      { key: 'shootDate', label: 'SHOOT DATE' },
      { key: 'publishDate', label: 'PUBLISH DATE' },
    ],
  },
  {
    title: 'CAST',
    fields: [
      { key: 'requiredRoles', label: 'REQUIRED ROLES', multiline: true },
      { key: 'selectedTalent', label: 'SELECTED TALENT', multiline: true },
      { key: 'backupTalent', label: 'BACKUP TALENT', multiline: true },
    ],
  },
];

export const CASTING_TALENT_PROFILE_GROUPS: CastingFieldGroup[] = [
  {
    title: 'TALENT CARD',
    fields: [
      { key: 'name', label: 'NAME' },
      { key: 'role', label: 'ROLE' },
      { key: 'primaryShows', label: 'PRIMARY SHOWS', multiline: true },
      { key: 'currentSeason', label: 'CURRENT SEASON' },
      { key: 'episodesAppeared', label: 'EPISODES APPEARED' },
      { key: 'firstAppearance', label: 'FIRST APPEARANCE' },
      { key: 'latestAppearance', label: 'LATEST APPEARANCE' },
      { key: 'availability', label: 'AVAILABILITY' },
    ],
  },
];

export const CASTING_TALENT_SHOW_GROUPS: CastingFieldGroup[] = [
  {
    title: 'SHOW ASSIGNMENTS',
    fields: [
      { key: 'primaryShows', label: 'PRIMARY SHOWS', multiline: true },
      { key: 'recurringShows', label: 'RECURRING SHOWS', multiline: true },
      { key: 'guestShows', label: 'GUEST SHOWS', multiline: true },
      { key: 'upcomingEpisodes', label: 'UPCOMING EPISODES', multiline: true },
      { key: 'previousEpisodes', label: 'PREVIOUS EPISODES', multiline: true },
      { key: 'episodeHistory', label: 'EPISODE HISTORY', multiline: true },
    ],
  },
];

export const CASTING_TALENT_STUDIO_GROUPS: CastingFieldGroup[] = [
  {
    title: 'STUDIO ASSIGNMENTS',
    fields: [{ key: 'studioAssignments', label: 'STUDIOS (ONE PER LINE)', multiline: true }],
  },
];

export const CASTING_TALENT_LICENSING_GROUPS: CastingFieldGroup[] = [
  {
    title: 'LICENSING & PERMISSIONS (ARCHITECTURE ONLY)',
    fields: [
      { key: 'signedRelease', label: 'SIGNED RELEASE STATUS' },
      { key: 'aiLikenessPermission', label: 'AI LIKENESS PERMISSION' },
      { key: 'voicePermission', label: 'VOICE PERMISSION' },
      { key: 'imagePermission', label: 'IMAGE PERMISSION' },
      { key: 'contentUsageRights', label: 'CONTENT USAGE RIGHTS', multiline: true },
      { key: 'contractExpiration', label: 'CONTRACT EXPIRATION' },
      { key: 'renewalReminder', label: 'RENEWAL REMINDER' },
      { key: 'talentNotes', label: 'TALENT NOTES', multiline: true },
    ],
  },
];

const PORTRAITS = [
  '/assets/NOIR/wave-thumb.png',
  '/assets/NOIR/curl-thumb.png',
  '/assets/NOIR/noir-thumb.png',
  '/assets/NOIR/blanco-thumb.png',
];

function defaultWorkflow(partial?: Partial<Record<CastingWorkflowStepId, boolean>>): Record<CastingWorkflowStepId, boolean> {
  return {
    'create-episode': false,
    'select-show': false,
    'select-studio': false,
    'select-roles': false,
    'assign-talent': false,
    'review-availability': false,
    'approve-cast': false,
    'lock-cast': false,
    'production-pipeline': false,
    ...partial,
  };
}

function createProduction(
  partial: Partial<CastingProductionEntry> & Pick<CastingProductionEntry, 'id' | 'showName' | 'accentHex'>
): CastingProductionEntry {
  return {
    episodeTitle: 'UNTITLED EPISODE',
    episodeNumber: '1',
    studioName: 'TBD',
    requiredRoles: 'HOST',
    selectedTalent: 'TBD',
    backupTalent: 'TBD',
    productionStatus: 'draft',
    shootDate: '',
    publishDate: '',
    workflowState: defaultWorkflow(),
    wardrobeAssignment: 'LUXURY EDITORIAL',
    expressionPreset: 'LUXURY SMILE',
    scheduleNotes: '',
    continuityNotes: 'INHERIT TALENT AGENCY · APPEARANCE · VOICE · WARDROBE',
    licensingNotes: 'ARCHITECTURE ONLY — NO LEGAL WORKFLOW',
    ...partial,
  };
}

function createTalentProfile(
  partial: Partial<CastingTalentProfile> & Pick<CastingTalentProfile, 'id' | 'talentAgencyId' | 'name' | 'accentHex'>
): CastingTalentProfile {
  return {
    portraitSrc: PORTRAITS[0],
    role: '',
    castingStatus: 'available',
    primaryShows: '',
    currentSeason: '1',
    episodesAppeared: '0',
    studiosAssigned: '0',
    voiceProfileSummary: 'WARM · CONFIDENT',
    wardrobeCount: '10',
    firstAppearance: '—',
    latestAppearance: '—',
    availability: 'OPEN',
    recurringShows: '',
    guestShows: '',
    upcomingEpisodes: '',
    previousEpisodes: '',
    episodeHistory: '',
    studioAssignments: '',
    wardrobeAssignments: CASTING_WARDROBE_COLLECTIONS.join('\n'),
    expressionPresets: CASTING_EXPRESSION_PRESETS.join('\n'),
    scheduleCalendar: '',
    analyticsEpisodes: '0',
    analyticsShows: '0',
    analyticsWatchTime: '0:00',
    analyticsEngagement: '0%',
    analyticsCtr: '0%',
    analyticsFavorites: '—',
    analyticsShared: '—',
    analyticsConversion: '0%',
    signedRelease: 'PENDING — ARCHITECTURE ONLY',
    aiLikenessPermission: 'GRANTED — DEMO',
    voicePermission: 'GRANTED — DEMO',
    imagePermission: 'GRANTED — DEMO',
    contentUsageRights: 'FULL ECOSYSTEM — DEMO',
    contractExpiration: '2027-12-31',
    renewalReminder: '90 DAYS BEFORE',
    talentNotes: '',
    communityStatus: '',
    ...partial,
  };
}

export const ADMIN_STUDIO_CASTING_PRODUCTIONS: CastingProductionEntry[] = [
  createProduction({
    id: 'slay-report-ep13',
    showName: 'THE SLAY REPORT',
    accentHex: '#EB1C24',
    episodeTitle: 'CHERRY RED FORECAST',
    episodeNumber: '13',
    studioName: 'THE WEATHER STUDIO',
    requiredRoles: 'HOST\nBEAUTY REPORTER\nLUXURY STYLIST',
    selectedTalent: 'BEAUTY REPORTER\nLUXURY STYLIST',
    backupTalent: 'SEASONAL GUEST HOST',
    productionStatus: 'filming',
    shootDate: '2026-07-05',
    publishDate: '2026-07-11',
    workflowState: defaultWorkflow({
      'create-episode': true,
      'select-show': true,
      'select-studio': true,
      'select-roles': true,
      'assign-talent': true,
      'review-availability': true,
      'approve-cast': true,
      'lock-cast': true,
    }),
    wardrobeAssignment: 'WEATHER HOST',
    expressionPreset: 'TEACHING',
  }),
  createProduction({
    id: 'slay-lab-ep8',
    showName: 'SLAY LAB',
    accentHex: '#C41E3A',
    episodeTitle: 'LACE TENSION TEST',
    episodeNumber: '8',
    studioName: 'THE LAB STUDIO',
    requiredRoles: 'HAIR SCIENTIST\nPRODUCT EXPERT',
    selectedTalent: 'HAIR SCIENTIST\nPSA',
    backupTalent: 'GUEST EXPERT',
    productionStatus: 'casting',
    shootDate: '2026-07-12',
    publishDate: '2026-07-18',
    workflowState: defaultWorkflow({
      'create-episode': true,
      'select-show': true,
      'select-studio': true,
      'select-roles': true,
      'assign-talent': true,
    }),
    wardrobeAssignment: 'SCIENTIST',
    expressionPreset: 'THINKING',
  }),
  createProduction({
    id: 'build-studio-ep5',
    showName: 'BUILD STUDIO',
    accentHex: '#8B0000',
    episodeTitle: 'NOIR CUSTOM PREVIEW',
    episodeNumber: '5',
    studioName: 'THE BUILD STUDIO',
    requiredRoles: 'BUILD SPECIALIST\nLUXURY MANNEQUIN',
    selectedTalent: 'BUILD SPECIALIST\nLUXURY MANNEQUIN COLLECTION',
    backupTalent: 'LUXURY STYLIST',
    productionStatus: 'approved',
    shootDate: '2026-07-08',
    publishDate: '2026-07-15',
    workflowState: defaultWorkflow({
      'create-episode': true,
      'select-show': true,
      'select-studio': true,
      'select-roles': true,
      'assign-talent': true,
      'review-availability': true,
      'approve-cast': true,
    }),
    wardrobeAssignment: 'BUILD STUDIO',
  }),
  createProduction({
    id: 'psa-analyzes-ep22',
    showName: 'PSA ANALYZES',
    accentHex: '#EB1C24',
    episodeTitle: 'MEMBER LOOK BREAKDOWN',
    episodeNumber: '22',
    studioName: 'PSA STUDIO',
    requiredRoles: 'HOST',
    selectedTalent: 'PSA',
    backupTalent: '—',
    productionStatus: 'locked',
    shootDate: '2026-07-03',
    publishDate: '2026-07-10',
    workflowState: defaultWorkflow({
      'create-episode': true,
      'select-show': true,
      'select-studio': true,
      'select-roles': true,
      'assign-talent': true,
      'review-availability': true,
      'approve-cast': true,
      'lock-cast': true,
    }),
    expressionPreset: 'WELCOMING',
  }),
  createProduction({
    id: 'campaign-film-launch',
    showName: 'CAMPAIGN FILMS',
    accentHex: '#EB1C24',
    episodeTitle: 'SUMMER LAUNCH MANIFESTO',
    episodeNumber: 'SP1',
    studioName: 'CAMPAIGN STUDIO',
    requiredRoles: 'BRAND AMBASSADOR\nCAMPAIGN TALENT',
    selectedTalent: 'CAMPAIGN TALENT\nLUXURY STYLIST',
    backupTalent: 'SEASONAL GUEST HOST',
    productionStatus: 'scheduled',
    shootDate: '2026-07-20',
    publishDate: '2026-08-01',
    workflowState: defaultWorkflow({
      'create-episode': true,
      'select-show': true,
      'select-studio': true,
      'select-roles': true,
      'assign-talent': true,
      'review-availability': true,
      'approve-cast': true,
      'lock-cast': true,
      'production-pipeline': true,
    }),
    wardrobeAssignment: 'LAUNCH',
    expressionPreset: 'LUXURY PORTRAIT',
  }),
];

export const ADMIN_STUDIO_CASTING_TALENT: CastingTalentProfile[] = [
  createTalentProfile({
    id: 'cast-psa',
    talentAgencyId: 'psa',
    name: 'PSA',
    accentHex: '#EB1C24',
    portraitSrc: PORTRAITS[2],
    role: 'FOUNDER HOLOGRAM · HAIR CONCIERGE',
    castingStatus: 'booked',
    primaryShows: 'PSA ANALYZES · MEMBER BRIEFINGS',
    episodesAppeared: '47',
    studiosAssigned: '6',
    wardrobeCount: '12',
    firstAppearance: '2025-03-01',
    latestAppearance: '2026-06-28',
    availability: 'BOOKED — JUL 10',
    recurringShows: 'PSA ANALYZES\nSLAY LAB\nBUILD STUDIO',
    studioAssignments: `PSA STUDIO
THE LAB STUDIO
THE LOUNGE
BUILD STUDIO
CAMPAIGN STUDIO
FUTURE MANSION`,
    analyticsEpisodes: '47',
    analyticsShows: '8',
    analyticsWatchTime: '8:12',
    analyticsEngagement: '82%',
    analyticsCtr: '5.4%',
    analyticsFavorites: 'PSA ANALYZES EP 18',
    analyticsConversion: '4.1%',
  }),
  createTalentProfile({
    id: 'cast-beauty-reporter',
    talentAgencyId: 'beauty-reporter',
    name: 'BEAUTY REPORTER',
    accentHex: '#EB1C24',
    portraitSrc: PORTRAITS[0],
    role: 'NEWSROOM HOST',
    castingStatus: 'filming',
    primaryShows: 'THE SLAY REPORT',
    episodesAppeared: '24',
    studiosAssigned: '3',
    wardrobeCount: '10',
    recurringShows: 'THE SLAY REPORT\nMEMBER BRIEFINGS',
    studioAssignments: 'THE WEATHER STUDIO\nTHE NEWSROOM\nTHE LOUNGE',
    analyticsEpisodes: '24',
    analyticsEngagement: '78%',
  }),
  createTalentProfile({
    id: 'cast-hair-scientist',
    talentAgencyId: 'hair-scientist',
    name: 'HAIR SCIENTIST',
    accentHex: '#4A90D9',
    portraitSrc: PORTRAITS[1],
    role: 'LAB EXPERT',
    castingStatus: 'booked',
    primaryShows: 'SLAY LAB',
    episodesAppeared: '16',
    studioAssignments: 'THE LAB STUDIO\nPRODUCT STUDIO',
    wardrobeAssignments: 'SCIENTIST\nLABORATORY\nMINIMAL',
  }),
  createTalentProfile({
    id: 'cast-build-specialist',
    talentAgencyId: 'build-specialist',
    name: 'BUILD SPECIALIST',
    accentHex: '#8B0000',
    portraitSrc: PORTRAITS[3],
    role: 'BUILD-A-WIG HOST',
    castingStatus: 'available',
    primaryShows: 'BUILD STUDIO',
    episodesAppeared: '11',
    studioAssignments: 'THE BUILD STUDIO\nPRODUCT STUDIO',
  }),
  createTalentProfile({
    id: 'cast-luxury-stylist',
    talentAgencyId: 'luxury-stylist',
    name: 'LUXURY STYLIST',
    accentHex: '#C41E3A',
    portraitSrc: PORTRAITS[0],
    role: 'EDITORIAL STYLIST',
    castingStatus: 'available',
    primaryShows: 'THE SLAY REPORT · CAMPAIGN FILMS',
    guestShows: 'PRODUCT STORIES',
    episodesAppeared: '19',
  }),
  createTalentProfile({
    id: 'cast-campaign-talent',
    talentAgencyId: 'campaign-talent',
    name: 'CAMPAIGN TALENT',
    accentHex: '#EB1C24',
    portraitSrc: PORTRAITS[1],
    role: 'BRAND FILM PRESENTER',
    castingStatus: 'booked',
    primaryShows: 'CAMPAIGN FILMS',
    episodesAppeared: '8',
    studioAssignments: 'CAMPAIGN STUDIO\nTHE RUNWAY',
    wardrobeAssignments: 'CAMPAIGN\nLAUNCH\nEVENING',
  }),
  createTalentProfile({
    id: 'cast-guest-expert',
    talentAgencyId: 'guest-expert',
    name: 'GUEST EXPERT',
    accentHex: '#1A1A1A',
    portraitSrc: PORTRAITS[2],
    role: 'ROTATING EXPERT',
    castingStatus: 'guest-appearance',
    guestShows: 'SLAY ACADEMY\nTHE LOUNGE',
    availability: 'BY BOOKING',
    episodesAppeared: '4',
  }),
  createTalentProfile({
    id: 'cast-seasonal-host',
    talentAgencyId: 'seasonal-guest-host',
    name: 'SEASONAL GUEST HOST',
    accentHex: '#EB1C24',
    portraitSrc: PORTRAITS[0],
    role: 'SEASONAL HOST',
    castingStatus: 'guest-appearance',
    guestShows: 'CAMPAIGN FILMS\nTHE LOUNGE',
    availability: 'SEASONAL',
    episodesAppeared: '6',
  }),
  createTalentProfile({
    id: 'cast-founder',
    talentAgencyId: 'founder-avatar',
    name: 'FOUNDER AVATAR',
    accentHex: '#EB1C24',
    portraitSrc: PORTRAITS[1],
    role: 'FOUNDER (FUTURE)',
    castingStatus: 'inactive',
    primaryShows: 'FOUNDER NOTES',
    availability: 'FUTURE RELEASE',
    episodesAppeared: '0',
  }),
];

export const ADMIN_STUDIO_COMMUNITY_TALENT: CommunityTalentEntry[] = [
  { id: 'cm-1', name: 'MEMBER SPOTLIGHT — JASMINE T.', status: 'approved', appliedDate: '2026-05-12', notes: 'SLAY CHALLENGE WINNER' },
  { id: 'cm-2', name: 'MEMBER SPOTLIGHT — DIANA R.', status: 'reviewing', appliedDate: '2026-06-20', notes: 'INSTALL TRANSFORMATION' },
  { id: 'cm-3', name: 'COMMUNITY GUEST — ALEX M.', status: 'guest-star', appliedDate: '2026-04-01', notes: 'ONE EPISODE GUEST' },
  { id: 'cm-4', name: 'HALL OF FAME — TEE S.', status: 'hall-of-fame', appliedDate: '2025-11-01', notes: 'YEAR ONE MEMBER' },
  { id: 'cm-5', name: 'APPLICANT — NEW MEMBER', status: 'applied', appliedDate: '2026-07-01', notes: 'PENDING REVIEW' },
];

export const ADMIN_STUDIO_CASTING_CALLS: CastingCallEntry[] = [
  { id: 'cc-guest', title: 'GUEST EXPERTS', type: 'GUEST', status: 'inactive', description: 'ROTATING INDUSTRY EXPERTS — NOT ENABLED' },
  { id: 'cc-seasonal', title: 'SEASONAL TALENT', type: 'SEASONAL', status: 'inactive', description: 'HOLIDAY · LAUNCH HOSTS — NOT ENABLED' },
  { id: 'cc-community', title: 'COMMUNITY SPOTLIGHTS', type: 'COMMUNITY', status: 'planned', description: 'MEMBER FEATURES — ARCHITECTURE READY' },
  { id: 'cc-campaign', title: 'CAMPAIGN MODELS', type: 'CAMPAIGN', status: 'inactive', description: 'BRAND COLLAB MODELS — NOT ENABLED' },
  { id: 'cc-member', title: 'MEMBER FEATURES', type: 'MEMBER', status: 'planned', description: 'MEMBER BRIEFING SPOTLIGHTS' },
  { id: 'cc-brand', title: 'BRAND COLLABORATIONS', type: 'BRAND', status: 'inactive', description: 'PARTNER TALENT — NOT ENABLED' },
  { id: 'cc-celeb', title: 'CELEBRITY GUESTS', type: 'CELEBRITY', status: 'inactive', description: 'FUTURE CELEBRITY COLLABS — NOT ENABLED' },
];

export function getCastingProductionById(id: string): CastingProductionEntry | undefined {
  return ADMIN_STUDIO_CASTING_PRODUCTIONS.find((p) => p.id === id);
}

export function getCastingTalentById(id: string): CastingTalentProfile | undefined {
  return ADMIN_STUDIO_CASTING_TALENT.find((t) => t.id === id);
}

export function createBlankCastingProduction(id: string, showName: string): CastingProductionEntry {
  return createProduction({
    id,
    showName: showName.toUpperCase(),
    accentHex: '#EB1C24',
    episodeTitle: 'NEW EPISODE',
    productionStatus: 'draft',
  });
}
