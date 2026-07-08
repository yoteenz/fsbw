import type { WarehouseWingKind } from '../../../../studio-os-core/studio-warehouse/campus-nav';

export type WarehouseOrbPersonality = {
  role: string;
  greeting: string;
  accent: string;
};

const PERSONALITIES: Record<WarehouseWingKind, WarehouseOrbPersonality> = {
  threshold: {
    role: 'Campus Greeter',
    greeting: 'Welcome to Studio Warehouse™ — one campus, endless districts. Cross the threshold when ready.',
    accent: '#c9a962',
  },
  production: {
    role: 'Production Assistant',
    greeting: 'I can help retrieve assets, compare lighting packs, and mount objects to your workspaces without regenerating.',
    accent: '#c9a962',
  },
  legacy: {
    role: 'Company Historian',
    greeting: 'You have left active production. Every Golden Build™ here is preserved forever — walk the Legacy Hall and touch your history.',
    accent: '#9b7bb8',
  },
  innovation: {
    role: 'Storyteller & Inventor',
    greeting: 'This wing holds what comes next — prototypes, experiments, and the stories behind your boldest ideas.',
    accent: '#8ba4c4',
  },
  expansion: {
    role: 'Campus Architect',
    greeting: 'These bays await your company\'s growth. New districts manifest here as you expand Studio World™.',
    accent: '#d4af7a',
  },
};

export function resolveWarehouseOrbPersonality(wing: WarehouseWingKind): WarehouseOrbPersonality {
  return PERSONALITIES[wing];
}
