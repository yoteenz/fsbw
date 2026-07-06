import {
  DEFAULT_PRIVACY_SETTINGS,
  PRIVACY_CONTROL_LABELS,
  PRIVACY_CONTROLS,
} from './constants';
import type { PrivacyLevel, PrivacySettingsSnapshot } from './types';

const LEVEL_DESCRIPTIONS: Record<PrivacyLevel, string> = {
  private: 'Not visible outside this organization — operational knowledge fully protected',
  'network-only': 'Visible only to trusted founder network members you authorize',
  discoverable: 'Discoverable to authorized organizations — founder controls all connections',
};

export function buildPrivacySettings(): PrivacySettingsSnapshot[] {
  return PRIVACY_CONTROLS.map((control) => {
    const level = DEFAULT_PRIVACY_SETTINGS[control];
    return {
      control,
      label: PRIVACY_CONTROL_LABELS[control],
      level,
      description: `${PRIVACY_CONTROL_LABELS[control]}: ${LEVEL_DESCRIPTIONS[level]}`,
    };
  });
}

export function privacyFirstSummary(): string {
  return 'Private operational knowledge is never shared automatically. Every connection requires founder permission.';
}

export function countPrivateControls(settings: PrivacySettingsSnapshot[]): number {
  return settings.filter((s) => s.level === 'private').length;
}
