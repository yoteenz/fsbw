/** Executive Headquarters™ — Studio OS Launch Stack Sprint 1 flagship experience */

export const EXECUTIVE_HEADQUARTERS_SUBSYSTEM_NAME = 'Executive Headquarters™';
export const EXECUTIVE_HEADQUARTERS_SUBSYSTEM_VERSION = '1.0.0';

export const EXECUTIVE_HEADQUARTERS_BASE_PATH = '/admin/studio/executive-headquarters';

export const HQ_ROOM_IDS = [
  'executive-atrium',
  'founder-office',
  'mission-control',
  'daily-briefing',
  'command-center',
  'department-directory',
  'knowledge-wing',
  'content-studio',
  'creative-direction-studio',
  'marketing-headquarters',
  'operations-wing',
  'customer-experience-headquarters',
  'finance-headquarters',
  'research-wing',
  'automation-lab',
  'meeting-rooms',
  'expansion-wings',
] as const;

export type HqRoomId = (typeof HQ_ROOM_IDS)[number];

export const HQ_ROOM_MATURITY_LEVELS = [
  'preview',
  'projection',
  'operational',
  'autonomous-ready',
  'advanced',
] as const;

export type HqRoomMaturityLevel = (typeof HQ_ROOM_MATURITY_LEVELS)[number];

export const HQ_ROOM_CLASSES = [
  'core-executive',
  'creation',
  'knowledge',
  'department',
  'expansion',
] as const;

export type HqRoomClass = (typeof HQ_ROOM_CLASSES)[number];

export const HQ_ORB_MODES = [
  'greeting',
  'briefing',
  'focus',
  'command',
  'room-guide',
] as const;

export type HqOrbMode = (typeof HQ_ORB_MODES)[number];

export const HQ_PRIORITY_KINDS = ['critical-decision', 'active-mission', 'opportunity-risk'] as const;

export type HqPriorityKind = (typeof HQ_PRIORITY_KINDS)[number];

export const HQ_MISSION_STATUSES = [
  'active',
  'blocked',
  'awaiting-approval',
  'recently-completed',
] as const;

export type HqMissionStatus = (typeof HQ_MISSION_STATUSES)[number];

export const HQ_ADVISORY_KINDS = ['risk', 'opportunity', 'readiness', 'dependency'] as const;

export type HqAdvisoryKind = (typeof HQ_ADVISORY_KINDS)[number];

/** Default arrival room — Executive Atrium™ */
export const HQ_DEFAULT_ROOM_ID: HqRoomId = 'executive-atrium';
