import { resolveRuntimeIcon } from './resolveRuntimeIcon';

/** Workbench integration — never import image files directly; registry resolves theme/state/device/size. */
export function resolveWorkbenchIcon(input: {
  toolId: string;
  departmentId?: string;
  state?: 'default' | 'active' | 'hover' | 'disabled';
  device?: 'mobile' | 'tablet' | 'desktop';
  sizePx?: number;
}): ReturnType<typeof resolveRuntimeIcon> {
  const iconId = `workbench.${input.toolId}`;
  const mapped = resolveRuntimeIcon({
    iconId,
    state: input.state ?? 'default',
    device: input.device ?? 'desktop',
    sizePx: input.sizePx ?? 24,
    departmentId: input.departmentId,
  });
  if (mapped) return mapped;

  return resolveRuntimeIcon({
    iconId: input.toolId,
    state: input.state ?? 'default',
    device: input.device ?? 'desktop',
    sizePx: input.sizePx ?? 24,
    departmentId: input.departmentId,
  });
}

export function resolveWorkbenchIconsForDepartment(_departmentId: string): string[] {
  return [
    `workbench.architectural-tools`,
    `workbench.material-library`,
    `workbench.permit-center`,
  ].map((id) => id);
}
