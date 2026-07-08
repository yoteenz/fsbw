import { MISSION_CONTROL_ORB_ROLE } from './orb-mission-control';
import { MISSION_CONTROL_MODE_LABELS, MISSION_CONTROL_TRAVEL_LABELS } from './constants';

export type MissionControlDockAdvice = {
  response: string;
  concierge: string;
};

export function resolveMissionControlAdvice(input: string): MissionControlDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (/mission control|atlas table|world is the interface|nervous system/i.test(trimmed)) {
    return {
      response:
        'Mission Control™ — stand above a living civilization on the Atlas Table™. Activation Sequence™ brings districts, transit, and knowledge streams online before navigation unlocks.',
      concierge: MISSION_CONTROL_ORB_ROLE,
    };
  }

  if (/activation sequence|activate.*atlas|world come alive/i.test(trimmed)) {
    return {
      response:
        'Activation Sequence™ — room darkens, Orb brightens, glass particles assemble, foundations rise, civilization comes alive. Only then does navigation unlock.',
      concierge: MISSION_CONTROL_ORB_ROLE,
    };
  }

  if (/constellation.*nav|navigate.*stars|headquarters.*star/i.test(trimmed)) {
    return {
      response:
        'The Constellation™ — every headquarters is a star. Departments orbit headquarters; knowledge links become light bridges. Select stars, not folders.',
      concierge: MISSION_CONTROL_ORB_ROLE,
    };
  }

  if (/world health|environmental health|glowing district/i.test(trimmed)) {
    return {
      response:
        'World Health™ is environmental — thriving districts glow brighter, strained areas dim, expansion opportunities sparkle. No dashboard required.',
      concierge: MISSION_CONTROL_ORB_ROLE,
    };
  }

  if (/architectural travel|glass elevator|fast travel|guided tour|observer mode/i.test(trimmed)) {
    const modes = Object.values(MISSION_CONTROL_TRAVEL_LABELS).join(' · ');
    return {
      response: `Architectural Navigation™ — highlight destination, illuminate corridors, preview, then choose: ${modes}. Travel is part of the experience.`,
      concierge: MISSION_CONTROL_ORB_ROLE,
    };
  }

  if (/atlas mode|visualization mode|architecture mode|civilization mode|knowledge mode/i.test(trimmed)) {
    const modes = Object.values(MISSION_CONTROL_MODE_LABELS).join(' · ');
    return {
      response: `Atlas Modes™ transform the hologram — ${modes}. Each mode reshapes the civilization; nothing replaces the world.`,
      concierge: MISSION_CONTROL_ORB_ROLE,
    };
  }

  if (/continuous scale|zoom.*civilization|camera.*deeper/i.test(trimmed)) {
    return {
      response:
        'Continuous Scale™ — Civilization → Industry → Constellation → District → Campus → Building → Floor → Room → Workspace → Scene. No page transitions; the camera travels deeper.',
      concierge: MISSION_CONTROL_ORB_ROLE,
    };
  }

  if (/world atlas|open atlas|studio world map/i.test(trimmed)) {
    return {
      response: 'World Atlas™ is Mission Control™ — /admin/studio/world-atlas. Watch the world come alive before you navigate.',
      concierge: MISSION_CONTROL_ORB_ROLE,
    };
  }

  return null;
}

export function buildProactiveMissionControlSuggestion(): string {
  return 'Mission Control™ — the Atlas Table™ awaits. Open World Atlas™ and watch civilization assemble.';
}
