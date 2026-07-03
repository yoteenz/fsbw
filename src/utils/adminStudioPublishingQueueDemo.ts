/** Publishing Queue — weekly calendar demo (no publishing backend). */

export type AdminStudioPublishStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'PUBLISHED'
  | 'NEEDS REVIEW'
  | 'FAILED';

export type AdminStudioQueueDayId =
  | 'mon'
  | 'tue'
  | 'wed'
  | 'thu'
  | 'fri'
  | 'sat'
  | 'sun';

export type AdminStudioQueueItem = {
  id: string;
  title: string;
  showId: string;
  showName: string;
  status: AdminStudioPublishStatus;
  dayId: AdminStudioQueueDayId;
  timeSlot: string;
  channels: string[];
  accentHex: string;
};

export const ADMIN_STUDIO_PUBLISH_STATUSES: AdminStudioPublishStatus[] = [
  'DRAFT',
  'SCHEDULED',
  'PUBLISHED',
  'NEEDS REVIEW',
  'FAILED',
];

export const ADMIN_STUDIO_QUEUE_WEEK_LABEL = 'WEEK OF JUN 30 – JUL 6 · 2026';

export const ADMIN_STUDIO_QUEUE_DAYS: Array<{
  id: AdminStudioQueueDayId;
  label: string;
  dateLabel: string;
}> = [
  { id: 'mon', label: 'MON', dateLabel: 'JUN 30' },
  { id: 'tue', label: 'TUE', dateLabel: 'JUL 1' },
  { id: 'wed', label: 'WED', dateLabel: 'JUL 2' },
  { id: 'thu', label: 'THU', dateLabel: 'JUL 3' },
  { id: 'fri', label: 'FRI', dateLabel: 'JUL 4' },
  { id: 'sat', label: 'SAT', dateLabel: 'JUL 5' },
  { id: 'sun', label: 'SUN', dateLabel: 'JUL 6' },
];

export const ADMIN_STUDIO_STATUS_COLORS: Record<AdminStudioPublishStatus, string> = {
  DRAFT: '#9A9A9A',
  SCHEDULED: '#60A5FA',
  PUBLISHED: '#4ADE80',
  'NEEDS REVIEW': '#FBBF24',
  FAILED: '#EB1C24',
};

export const ADMIN_STUDIO_DEFAULT_QUEUE_ITEMS: AdminStudioQueueItem[] = [
  {
    id: 'q-cherry-red',
    title: 'CHERRY RED FORECAST',
    showId: 'the-slay-report',
    showName: 'THE SLAY REPORT',
    status: 'SCHEDULED',
    dayId: 'fri',
    timeSlot: '7:00 PM ET',
    channels: ['LOUNGE', 'EMAIL', 'INSTAGRAM'],
    accentHex: '#EB1C24',
  },
  {
    id: 'q-cutting-lace',
    title: 'CUTTING YOUR LACE',
    showId: 'slay-academy',
    showName: 'SLAY ACADEMY',
    status: 'PUBLISHED',
    dayId: 'tue',
    timeSlot: '12:00 PM ET',
    channels: ['LOUNGE', 'JOURNAL'],
    accentHex: '#8B0000',
  },
  {
    id: 'q-soft-wave',
    title: 'SOFT WAVE REVEAL',
    showId: 'campaigns',
    showName: 'CAMPAIGNS',
    status: 'DRAFT',
    dayId: 'wed',
    timeSlot: 'TBD',
    channels: ['LOUNGE', 'TIKTOK'],
    accentHex: '#C41E3A',
  },
  {
    id: 'q-psa-analyzes',
    title: 'PSA UNDERTONE SESSION',
    showId: 'psa-analyzes',
    showName: 'PSA ANALYZES',
    status: 'NEEDS REVIEW',
    dayId: 'thu',
    timeSlot: '3:00 PM ET',
    channels: ['LOUNGE', 'PSA'],
    accentHex: '#EB1C24',
  },
  {
    id: 'q-slay-lab',
    title: 'LACE GLUE TEST — LAB 12',
    showId: 'slay-lab',
    showName: 'SLAY LAB',
    status: 'SCHEDULED',
    dayId: 'tue',
    timeSlot: '6:00 PM ET',
    channels: ['LOUNGE'],
    accentHex: '#C41E3A',
  },
  {
    id: 'q-build-studio',
    title: 'NOIR CUSTOM BUILD WALKTHROUGH',
    showId: 'build-studio',
    showName: 'BUILD STUDIO',
    status: 'DRAFT',
    dayId: 'mon',
    timeSlot: 'TBD',
    channels: ['LOUNGE', 'SHOP'],
    accentHex: '#8B0000',
  },
  {
    id: 'q-vault-drop',
    title: 'VAULT — FOUNDER MASTERCLASS',
    showId: 'the-vault',
    showName: 'THE VAULT',
    status: 'FAILED',
    dayId: 'sat',
    timeSlot: '10:00 AM ET',
    channels: ['LOUNGE'],
    accentHex: '#1A1A1A',
  },
  {
    id: 'q-lounge-sync',
    title: 'LOUNGE TV WEEKLY SYNC',
    showId: 'the-lounge',
    showName: 'THE LOUNGE',
    status: 'SCHEDULED',
    dayId: 'sun',
    timeSlot: '8:00 PM ET',
    channels: ['LOUNGE', 'PUSH'],
    accentHex: '#0A0A0A',
  },
];
