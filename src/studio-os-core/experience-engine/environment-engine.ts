import { ADAPTIVE_ENVIRONMENT_CONTROLS } from './constants';
import type { AdaptiveEnvironmentSetting, ExperienceModeId } from './types';

const CONTROL_META: Record<
  typeof ADAPTIVE_ENVIRONMENT_CONTROLS[number],
  { label: string; normalValue: string; focusValue: string }
> = {
  lighting: { label: 'Lighting', normalValue: 'Balanced daylight', focusValue: 'Soft warm dim' },
  'accent-colors': { label: 'Accent Colors', normalValue: 'Brand red #EB1C24', focusValue: 'Muted slate accent' },
  'glass-intensity': { label: 'Glass Intensity', normalValue: 'Standard blur 60%', focusValue: 'Minimal blur 30%' },
  animations: { label: 'Animations', normalValue: 'Standard motion', focusValue: 'Reduced motion' },
  'panel-density': { label: 'Panel Density', normalValue: 'Full dashboard', focusValue: 'Essential panels only' },
  'notification-behavior': { label: 'Notification Behavior', normalValue: 'Standard alerts', focusValue: 'Urgent only' },
  sound: { label: 'Sound', normalValue: 'Off (optional)', focusValue: 'Off' },
  motion: { label: 'Motion', normalValue: 'Smooth transitions', focusValue: 'Instant transitions' },
  'background-atmosphere': { label: 'Background Atmosphere', normalValue: 'Marble standard', focusValue: 'Calm neutral' },
  'dashboard-focus': { label: 'Dashboard Focus', normalValue: 'Mission Control full', focusValue: 'Priority mission only' },
  'command-dock-personality': { label: 'Command Dock Personality', normalValue: 'Chief Concierge full', focusValue: 'Concise executive' },
  'celebration-effects': { label: 'Celebration Effects', normalValue: 'Off', focusValue: 'Off' },
};

export function buildAdaptiveEnvironmentSettings(activeMode: ExperienceModeId): AdaptiveEnvironmentSetting[] {
  const isFocus = activeMode === 'focus-mode' || activeMode === 'presentation-mode';
  return ADAPTIVE_ENVIRONMENT_CONTROLS.map((control) => ({
    control,
    professional: true as const,
    label: CONTROL_META[control].label,
    currentValue: isFocus ? CONTROL_META[control].focusValue : CONTROL_META[control].normalValue,
    modeInfluence: isFocus ? 'Focus/Presentation adjusted' : 'Normal baseline',
  }));
}
