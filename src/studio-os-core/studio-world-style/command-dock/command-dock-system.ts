import { STUDIO_WORLD_STYLE_BIBLE } from '../style-bible/registry';

export const COMMAND_DOCK_SYSTEM_VERSION = 'universal-command-dock.v1' as const;

export type CommandDockVariant = 'desktop' | 'tablet' | 'mobile';

export type UniversalCommandDockSpec = {
  systemVersion: typeof COMMAND_DOCK_SYSTEM_VERSION;
  objectId: 'StudioWorldCommandDock';
  integration: 'integrated into environment — physically belongs to room';
  material: 'acrylic/glass — premium lighting — placeholder icon sockets only';
  proportions: {
    desktop: { width: '72%', height: '8%', bottomOffset: '4%' };
    tablet: { width: '85%', height: '9%', bottomOffset: '3%' };
    mobile: { width: '92%', height: '10%', bottomOffset: '2%' };
  };
  rules: string[];
  forbidden: string[];
  toolOverlayRule: 'only tools change — architecture never changes';
};

export const UNIVERSAL_COMMAND_DOCK: UniversalCommandDockSpec = {
  systemVersion: COMMAND_DOCK_SYSTEM_VERSION,
  objectId: 'StudioWorldCommandDock',
  integration: 'integrated into environment — physically belongs to room',
  material: 'acrylic/glass — premium lighting — placeholder icon sockets only',
  proportions: {
    desktop: { width: '72%', height: '8%', bottomOffset: '4%' },
    tablet: { width: '85%', height: '9%', bottomOffset: '3%' },
    mobile: { width: '92%', height: '10%', bottomOffset: '2%' },
  },
  rules: [
    'integrated into environment',
    'physically belongs to room',
    'AI-generated without text',
    'placeholder icon sockets only',
    'acrylic/glass premium lighting',
    'same proportions everywhere',
    'desktop, tablet, mobile variants',
    'UI overlays typography later',
    'no baked AI text',
  ],
  forbidden: ['floating HUD dock', 'detached UI bar', 'generated text labels', 'fake readable UI'],
  toolOverlayRule: 'only tools change — architecture never changes',
};

export function resolveCommandDockSpec(variant: CommandDockVariant = 'desktop') {
  return { ...UNIVERSAL_COMMAND_DOCK, activeVariant: variant, proportions: UNIVERSAL_COMMAND_DOCK.proportions[variant] };
}

export function buildCommandDockPromptSection(variant: CommandDockVariant = 'desktop'): string {
  const dock = UNIVERSAL_COMMAND_DOCK;
  const props = dock.proportions[variant];
  return [
    `UNIVERSAL COMMAND DOCK™: ${dock.systemVersion}`,
    `Integration: ${dock.integration}`,
    `Material: ${dock.material}`,
    `Proportions (${variant}): width ${props.width}, height ${props.height}, bottom ${props.bottomOffset}`,
    `Rules: ${dock.rules.join(' · ')}`,
    `Forbidden: ${dock.forbidden.join(', ')}`,
  ].join('\n');
}

export function assertCommandDockMatchesBible(): boolean {
  return UNIVERSAL_COMMAND_DOCK.rules.includes('no baked AI text') &&
    STUDIO_WORLD_STYLE_BIBLE.worldLanguage.dockPlacement.includes('Command Dock');
}
