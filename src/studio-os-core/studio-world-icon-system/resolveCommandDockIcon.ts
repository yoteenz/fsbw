import { resolveRuntimeIcon } from './resolveRuntimeIcon';

/** Command Dock integration — no hardcoded icon imports. */
export function resolveCommandDockIcon(input: {
  slotId: string;
  state?: 'default' | 'active' | 'hover' | 'disabled';
  device?: 'mobile' | 'tablet' | 'desktop';
  sizePx?: number;
}): ReturnType<typeof resolveRuntimeIcon> {
  const iconId = `command-dock.${input.slotId}`;
  return resolveRuntimeIcon({
    iconId,
    state: input.state ?? 'default',
    device: input.device ?? 'desktop',
    sizePx: input.sizePx ?? 20,
  }) ?? resolveRuntimeIcon({
    iconId: input.slotId,
    state: input.state ?? 'default',
    device: input.device ?? 'desktop',
    sizePx: input.sizePx ?? 20,
  });
}

export function resolveCommandDockIcons(): string[] {
  return [
    'command-dock.program',
    'command-dock.department',
    'command-dock.environment',
    'command-dock.variant',
  ];
}
