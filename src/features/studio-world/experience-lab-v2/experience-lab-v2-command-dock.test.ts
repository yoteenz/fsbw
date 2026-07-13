import { describe, expect, it } from 'vitest';
import {
  commandDockLocationSubtitle,
  commandDockStatusClass,
  EXPERIENCE_LAB_COMMAND_DOCK_LOCATIONS,
  EXPERIENCE_LAB_COMMAND_DOCK_LOGO_PATH,
  resolveExperienceLabCommandDockLogoUrl,
  formatCommandDockApprovalStatus,
  formatCommandDockPermitStatus,
} from './experience-lab-v2-command-dock-locations';

describe('Experience Lab Command Dock locations', () => {
  it('uses Studio World logo from live preview storage', () => {
    expect(EXPERIENCE_LAB_COMMAND_DOCK_LOGO_PATH).toContain('IMG_6220.png');
    expect(resolveExperienceLabCommandDockLogoUrl()).toContain('IMG_6220.png');
  });

  it('lists HQ locations with Experience Lab as primary department tab', () => {
    expect(EXPERIENCE_LAB_COMMAND_DOCK_LOCATIONS[0]?.title).toBe('FRONTAL SLAYER HQ');
    expect(EXPERIENCE_LAB_COMMAND_DOCK_LOCATIONS[1]?.id).toBe('experience-lab');
    expect(EXPERIENCE_LAB_COMMAND_DOCK_LOCATIONS.some((l) => l.id === 'reception')).toBe(true);
  });

  it('maps approval and permit states to uppercase review labels', () => {
    expect(formatCommandDockApprovalStatus('approved')).toBe('APPROVED');
    expect(formatCommandDockApprovalStatus('pending')).toBe('PENDING');
    expect(formatCommandDockApprovalStatus('rejected')).toBe('REJECTED');
    expect(formatCommandDockPermitStatus('clear')).toBe('APPROVED');
    expect(formatCommandDockPermitStatus('blocked')).toBe('REJECTED');
    expect(formatCommandDockPermitStatus('pending')).toBe('PENDING');
  });

  it('applies status color classes', () => {
    expect(commandDockStatusClass('APPROVED')).toBe('elab-status--ok');
    expect(commandDockStatusClass('REJECTED')).toBe('elab-status--danger');
    expect(commandDockStatusClass('PENDING')).toBe('elab-status--warn');
  });

  it('shows revision on reception location subtitle', () => {
    const reception = EXPERIENCE_LAB_COMMAND_DOCK_LOCATIONS.find((l) => l.id === 'reception');
    expect(reception).toBeTruthy();
    expect(commandDockLocationSubtitle(reception!, 18)).toBe('REVISION 18');
  });
});
