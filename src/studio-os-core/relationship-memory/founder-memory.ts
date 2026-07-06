import { getOrganizationAmbientAwarenessProfile } from '../ambient-awareness/store';
import { getOrganizationExecutiveCouncilProfile } from '../executive-council/org-store';
import { getOrganizationFounderCognitiveLoadProfile } from '../founder-cognitive-load/store';
import { getOrganizationPresenceProfile } from '../presence-engine/store';
import {
  FOUNDER_PREFERENCE_LABELS,
  FOUNDER_PREFERENCE_TYPES,
} from './constants';
import type { FounderPreferenceMemory, FounderPreferenceType } from './types';

function confidence(base: number, reinforced: boolean): number {
  return Math.min(94, reinforced ? base + 8 : base);
}

function buildPreference(
  type: FounderPreferenceType,
  learnedPreference: string,
  baseConfidence: number,
  reinforced = false
): FounderPreferenceMemory {
  return {
    type,
    label: FOUNDER_PREFERENCE_LABELS[type],
    learnedPreference,
    confidencePct: confidence(baseConfidence, reinforced),
    learnedThrough: 'observation',
    lastReinforcedAt: new Date().toISOString(),
  };
}

export function buildFounderPreferenceMemories(organizationId: string): FounderPreferenceMemory[] {
  const cognitive = getOrganizationFounderCognitiveLoadProfile(organizationId);
  const presence = getOrganizationPresenceProfile(organizationId);
  const ambient = getOrganizationAmbientAwarenessProfile(organizationId);
  const council = getOrganizationExecutiveCouncilProfile(organizationId);
  const hour = new Date().getHours();

  const commContext = presence?.activeCommunicationContext ?? 'executive-planning';
  const attentionMode = cognitive?.activeAttentionMode ?? 'strategic-deep-work';
  const summarized = cognitive?.executiveAssistance.some((a) => a.category === 'summarized') ?? false;
  const postponedApprovals = cognitive?.executiveAssistance.some((a) => a.category === 'postponed') ?? false;
  const pendingDecisions = council?.pendingDecisions ?? 0;

  const preferences: FounderPreferenceMemory[] = [
    buildPreference(
      'communication-style',
      commContext === 'busy-day'
        ? 'Prefers concise updates during high-demand periods — bullet summaries over narrative.'
        : commContext === 'creative-session'
          ? 'Prefers collaborative tone with space for exploration — operational noise held back.'
          : commContext === 'emergency'
            ? 'Prefers direct, action-first communication when stakes are elevated.'
            : 'Prefers strategic framing with context before detail — executive planning tone.',
      78,
      Boolean(presence)
    ),
    buildPreference(
      'approval-habits',
      postponedApprovals || pendingDecisions > 2
        ? 'Typically batches low-priority approvals — urgent items surfaced immediately.'
        : 'Reviews approvals in focused windows — prefers prepared summaries before signing off.',
      72,
      Boolean(cognitive)
    ),
    buildPreference(
      'creative-workflow',
      attentionMode === 'creating'
        ? 'Creative sessions protected — prefers visual exploration before implementation commitments.'
        : 'Usually reviews designs visually before approving implementation — mockups before specs.',
      81,
      attentionMode === 'creating'
    ),
    buildPreference(
      'decision-making',
      pendingDecisions > 0
        ? 'Cross-functional input before major decisions — Marketing and Operations often review first.'
        : 'Decisions ranked by impact — prefers executive summary with ranked options.',
      76,
      pendingDecisions > 0
    ),
    buildPreference(
      'meeting-preferences',
      hour >= 9 && hour <= 11
        ? 'Mornings reserved for strategic work — meetings typically scheduled after 11 AM.'
        : 'Prefers shorter meetings with pre-reads — async updates when possible.',
      74,
      hour >= 9 && hour <= 11
    ),
    buildPreference(
      'review-preferences',
      summarized
        ? 'Typically prefers executive summaries before reading detailed reports.'
        : 'Reviews visually first for creative work — detailed reports on request, not by default.',
      83,
      summarized
    ),
    buildPreference(
      'working-hours',
      hour >= 20 || hour <= 6
        ? 'Evening creative windows observed — async-friendly outside core business hours.'
        : 'Core focus hours mid-morning through early afternoon — protect deep work blocks.',
      70,
      false
    ),
    buildPreference(
      'leadership-philosophy',
      cognitive?.loadState === 'light' || cognitive?.loadState === 'moderate'
        ? 'Empowers departments with clear ownership — founder intervenes on strategy and exceptions.'
        : 'Delegates routine operations during demanding periods — founder attention on irreplaceable decisions.',
      75,
      Boolean(cognitive)
    ),
    buildPreference(
      'reporting-formats',
      summarized
        ? 'Favorite reporting format: one-page executive summary with optional drill-down.'
        : 'Prefers visual dashboards and trend sparklines over dense spreadsheets.',
      79,
      summarized
    ),
    buildPreference(
      'presentation-style',
      presence?.activeAtmosphere === 'focused'
        ? 'Presentation style: direct, minimal slides — decisions and next steps upfront.'
        : 'Presentation style: narrative arc with visual anchors — story before data tables.',
      77,
      Boolean(presence)
    ),
  ];

  if (ambient?.intelligentContext?.founderFocus) {
    const focusIdx = preferences.findIndex((p) => p.type === 'working-hours');
    if (focusIdx >= 0) {
      preferences[focusIdx] = buildPreference(
        'working-hours',
        `${preferences[focusIdx].learnedPreference} Current focus: ${ambient.intelligentContext.founderFocus}.`,
        82,
        true
      );
    }
  }

  return FOUNDER_PREFERENCE_TYPES.map(
    (type) => preferences.find((p) => p.type === type) ?? buildPreference(type, 'Learning through observation — no manual setup required.', 55)
  );
}
