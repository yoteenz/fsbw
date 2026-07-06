import type { PULSE_ALERT_SEVERITIES, PULSE_INDICATORS, PULSE_STATES } from './constants';

export type PulseIndicatorId = (typeof PULSE_INDICATORS)[number];
export type PulseState = (typeof PULSE_STATES)[number];
export type PulseAlertSeverity = (typeof PULSE_ALERT_SEVERITIES)[number];

export type PulseIndicatorScore = {
  id: PulseIndicatorId;
  label: string;
  scorePct: number;
  state: PulseState;
  signal: string;
  trend: 'accelerating' | 'stable' | 'slowing' | 'declining';
  sourceModules: string[];
};

export type ProactivePulseAlert = {
  id: string;
  indicatorId: PulseIndicatorId;
  title: string;
  message: string;
  severity: PulseAlertSeverity;
  recommendedAction: string;
  detectedAt: string;
};

export type OrganizationPulseProfile = {
  organizationId: string;
  companyName: string;
  industryId: string;
  updatedAt: string;
  overallPulseScore: number;
  pulseState: PulseState;
  pulseFeeling: string;
  indicatorScores: PulseIndicatorScore[];
  proactiveAlerts: ProactivePulseAlert[];
  recommendedActions: string[];
  syncedSources: string[];
};

export type OrganizationPulseStore = {
  version: string;
  profiles: OrganizationPulseProfile[];
};

export type OrganizationPulseDockAdvice = {
  response: string;
  concierge: string;
  pulseState?: PulseState;
  overallPulseScore?: number;
};
