import type { ExperienceLabV2ViewModel } from '../experience-lab-v2.types';

export type OrbStatus =
  | 'IDLE'
  | 'HOVER'
  | 'FOCUSED'
  | 'GENERATING'
  | 'APPROVED'
  | 'WARNING'
  | 'ERROR'
  | 'OFFLINE';

export function resolveOrbStatusFromViewModel(model: ExperienceLabV2ViewModel): OrbStatus {
  const approval = model.approvalStatus.trim().toLowerCase();
  const permit = model.permitStatus.trim().toLowerCase();
  const health = model.healthState.trim().toLowerCase();

  if (!model.liveBackendMode || health === 'offline' || health === 'disconnected') {
    return 'OFFLINE';
  }

  if (model.viewportMode === 'ERROR' || health === 'error' || health === 'critical') {
    return 'ERROR';
  }

  if (
    model.viewportMode === 'LOADING' ||
    model.founderRender?.status === 'generating' ||
    model.founderRender?.status === 'queued' ||
    Object.values(model.artifacts).some((a) => a.status === 'loading')
  ) {
    return 'GENERATING';
  }

  if (approval === 'approved' && model.approval.approvalRecorded) {
    return 'APPROVED';
  }

  if (
    model.isStale ||
    permit === 'blocked' ||
    health === 'warning' ||
    health === 'degraded'
  ) {
    return 'WARNING';
  }

  return 'IDLE';
}

/** Interaction states take precedence over ambient status for presentation. */
export function deriveOrbPresentationStatus(
  base: OrbStatus,
  isHovered: boolean,
  isFocused: boolean
): OrbStatus {
  if (isFocused) return 'FOCUSED';
  if (isHovered) return 'HOVER';
  return base;
}

export function orbStatusAriaLabel(status: OrbStatus): string {
  switch (status) {
    case 'GENERATING':
      return 'Studio World Orb — generating';
    case 'APPROVED':
      return 'Studio World Orb — approved';
    case 'WARNING':
      return 'Studio World Orb — attention required';
    case 'ERROR':
      return 'Studio World Orb — error state';
    case 'OFFLINE':
      return 'Studio World Orb — offline';
    case 'HOVER':
    case 'FOCUSED':
      return 'Studio World Orb — active';
    default:
      return 'Studio World Orb — idle';
  }
}
