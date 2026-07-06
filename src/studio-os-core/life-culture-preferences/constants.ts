import type { CommunicationStyle, PreferenceCategory, PreferenceLayer } from './types';

export const LIFE_CULTURE_PREFERENCES_STORAGE_KEY = 'studioOsLifeCulturePreferences_v1';
export const LIFE_CULTURE_PREFERENCES_VERSION = '1.0.0';
export const LIFE_CULTURE_ID = 'life-culture-preferences';

export const LIFE_CULTURE_INTRO_FOOTER =
  'There are no right or wrong answers here. These preferences simply help Studio Intelligence™ better understand what matters most to you so it can create an experience that feels more thoughtful, respectful, and personal. You can change these preferences at any time.';

export const PREFERENCE_CATEGORY_LABELS: Record<PreferenceCategory, string> = {
  'religious-spiritual': 'Religious or Spiritual Traditions',
  'cultural-traditions': 'Cultural Traditions',
  'family-traditions': 'Family Traditions',
  'personal-milestones': 'Personal Milestones',
  'organization-milestones': 'Organization Milestones',
  'company-traditions': 'Company Traditions',
  'holiday-preferences': 'Holiday Preferences',
  'celebration-preferences': 'Celebration Preferences',
  'recognition-style': 'Recognition Style',
  'motivation-style': 'Motivation Style',
  'communication-style': 'Communication Style',
  'humor-preference': 'Humor Preference',
  'emotional-tone': 'Emotional Tone',
  'visual-theme': 'Visual Theme Preferences',
  animation: 'Animation Preferences',
  'ambient-sound': 'Ambient Sound Preferences',
  accessibility: 'Accessibility Preferences',
};

export const LAYER_LABELS: Record<PreferenceLayer, string> = {
  personal: 'Personal',
  household: 'Household',
  organization: 'Organization',
  department: 'Department',
  workspace: 'Workspace',
};

export const COMMUNICATION_STYLE_LABELS: Record<CommunicationStyle, string> = {
  executive: 'Executive',
  professional: 'Professional',
  teacher: 'Teacher',
  coach: 'Coach',
  advisor: 'Advisor',
  encouraging: 'Encouraging',
  minimal: 'Minimal',
  friendly: 'Friendly',
  collaborative: 'Collaborative',
};

export const EVENT_RESPONSE_LABELS = {
  unset: 'Not set yet',
  celebrate: 'Celebrate',
  'acknowledge-quietly': 'Acknowledge quietly',
  ignore: 'Ignore completely',
  'ask-each-time': 'Ask me each time',
} as const;

export const SENSITIVE_EVENT_RESPONSE_LABELS = {
  unset: 'Not set yet',
  celebrate: 'Celebrate',
  'acknowledge-quietly': 'Quietly acknowledge',
  silent: 'Remain silent',
  'ask-before': 'Ask before mentioning',
  'supportive-resources': 'Offer supportive resources',
} as const;

/** Known holidays & observances — never assumed; default unset until user chooses. */
export const HOLIDAY_CATALOG: Array<{ id: string; label: string; month: number; day: number }> = [
  { id: 'christmas', label: 'Christmas', month: 11, day: 25 },
  { id: 'hanukkah', label: 'Hanukkah (season)', month: 11, day: 15 },
  { id: 'kwanzaa', label: 'Kwanzaa', month: 11, day: 26 },
  { id: 'diwali', label: 'Diwali (season)', month: 9, day: 20 },
  { id: 'eid', label: 'Eid (season)', month: 3, day: 10 },
  { id: 'lunar-new-year', label: 'Lunar New Year', month: 0, day: 25 },
  { id: 'passover', label: 'Passover (season)', month: 3, day: 10 },
  { id: 'juneteenth', label: 'Juneteenth', month: 5, day: 19 },
  { id: 'veterans-day', label: 'Veterans Day', month: 10, day: 11 },
  { id: 'indigenous-peoples-day', label: "Indigenous Peoples' Day", month: 9, day: 14 },
  { id: 'org-anniversary', label: 'Organization Anniversary', month: -1, day: -1 },
  { id: 'founder-anniversary', label: 'Founder Anniversary', month: -1, day: -1 },
];

export const SENSITIVE_EVENT_CATALOG: Array<{ id: string; label: string }> = [
  { id: 'mothers-day', label: "Mother's Day" },
  { id: 'fathers-day', label: "Father's Day" },
  { id: 'birthday', label: 'Birthdays' },
  { id: 'wedding-anniversary', label: 'Wedding Anniversaries' },
  { id: 'memorial-date', label: 'Memorial Dates' },
  { id: 'loss-of-loved-one', label: 'Loss of Loved Ones' },
  { id: 'divorce-anniversary', label: 'Divorce Anniversaries' },
  { id: 'recovery-milestone', label: 'Recovery Milestones' },
  { id: 'reflection-day', label: 'Personal Reflection Days' },
];

export const PRIVACY_NOTICE = {
  why: 'Studio Intelligence™ asks so acknowledgements feel respectful — never assumed.',
  usage: 'Preferences guide greetings, Headquarters atmosphere, and milestone mentions only.',
  storage: 'Stored locally in your browser for this organization — not shared without your choice.',
  access: 'Only you can view and edit these preferences from the Studio Orb™.',
} as const;
