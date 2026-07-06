import { EXPERIENCE_MODES } from './constants';
import type { ExperienceModeEntry, ExperienceModeId } from './types';

const MODE_META: Record<
  ExperienceModeId,
  { label: string; description: string; atmosphere: string; status: ExperienceModeEntry['status'] }
> = {
  normal: {
    label: 'Normal',
    description: 'Default Studio OS atmosphere — balanced and professional.',
    atmosphere: 'Standard glass, brand accent, calm notifications.',
    status: 'active',
  },
  'founder-mode': {
    label: 'Founder Mode',
    description: 'Executive priority view — strategic focus elevated.',
    atmosphere: 'Warmer lighting, reduced panel density, Chief Concierge prominence.',
    status: 'available',
  },
  'focus-mode': {
    label: 'Focus Mode',
    description: 'Deep work protection — distractions minimized.',
    atmosphere: 'Muted accents, silent notifications, Command Dock concise.',
    status: 'available',
  },
  'presentation-mode': {
    label: 'Presentation Mode',
    description: 'Stakeholder-ready — polished and distraction-free.',
    atmosphere: 'Clean dashboard focus, hidden internal metrics, presentation lighting.',
    status: 'available',
  },
  'launch-mode': {
    label: 'Launch Mode',
    description: 'Campaign or product launch day energy.',
    atmosphere: 'Elevated accent, mission-critical dashboard, launch countdown.',
    status: 'available',
  },
  'celebration-mode': {
    label: 'Celebration Mode',
    description: 'Milestone achieved — tasteful celebration effects.',
    atmosphere: 'Subtle celebration particles, warm glow, congratulatory Command Dock.',
    status: 'available',
  },
  'learning-mode': {
    label: 'Learning Mode',
    description: 'Studio Institute and training sessions.',
    atmosphere: 'Academy-forward dashboard, guided tooltips, learning atmosphere.',
    status: 'available',
  },
  'emergency-mode': {
    label: 'Emergency Mode',
    description: 'Critical issue detected — clarity and urgency without panic.',
    atmosphere: 'High-contrast alerts, essential panels only, emergency Command Dock tone.',
    status: 'available',
  },
  'maintenance-mode': {
    label: 'Maintenance Mode',
    description: 'Platform maintenance window — calm informational tone.',
    atmosphere: 'Reduced motion, maintenance banner, muted interactions.',
    status: 'available',
  },
  'night-mode': {
    label: 'Night Mode',
    description: 'After-hours work — reduced eye strain.',
    atmosphere: 'Dimmed lighting, softer glass, minimal notifications.',
    status: 'available',
  },
  'executive-review-mode': {
    label: 'Executive Review Mode',
    description: 'Council briefing and strategic review sessions.',
    atmosphere: 'Executive Council prominence, briefing-first layout, formal tone.',
    status: 'available',
  },
  'creative-mode': {
    label: 'Creative Mode',
    description: 'Design, content, and innovation work.',
    atmosphere: 'Expanded canvas, Asset Director focus, creative accent palette.',
    status: 'available',
  },
  'training-mode': {
    label: 'Training Mode',
    description: 'Employee onboarding and department training.',
    atmosphere: 'Step-by-step guidance, Institute paths, supportive Concierge tone.',
    status: 'available',
  },
  'conference-mode': {
    label: 'Conference Mode',
    description: 'External events and partner presentations.',
    atmosphere: 'Partner-safe views, polished branding, restricted internal data.',
    status: 'available',
  },
  'future-experience-packs': {
    label: 'Future Experience Packs',
    description: 'Reserved for upcoming experiential extensions.',
    atmosphere: 'Extensible mode slots — plugin-compatible.',
    status: 'planned',
  },
};

export function buildExperienceModeCatalog(): ExperienceModeEntry[] {
  return EXPERIENCE_MODES.map((modeId) => ({
    modeId,
    tasteful: true as const,
    ...MODE_META[modeId],
  }));
}

export function getExperienceMode(modeId: ExperienceModeId): ExperienceModeEntry | undefined {
  return buildExperienceModeCatalog().find((m) => m.modeId === modeId);
}

export function resolveActiveMode(contextSignals: { suggestedMode?: ExperienceModeId }[]): ExperienceModeId {
  const suggested = contextSignals.find((s) => s.suggestedMode)?.suggestedMode;
  return suggested ?? 'normal';
}
