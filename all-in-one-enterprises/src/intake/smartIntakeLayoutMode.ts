/** Smart Intake presentation mode — responsive follows viewport; desktop/mobile are fixed preview routes. */
export type SmartIntakeLayoutMode = 'responsive' | 'desktop' | 'mobile';

export function smartIntakeShellClass(mode: SmartIntakeLayoutMode): string {
  if (mode === 'responsive') return 'si-shell';
  return `si-shell si-shell--layout-${mode}`;
}

export function smartIntakeAppClass(mode: SmartIntakeLayoutMode): string | undefined {
  if (mode === 'responsive') return undefined;
  return `si-app--layout-${mode}`;
}
