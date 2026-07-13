import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  commandDockLocationSubtitle,
  commandDockStatusClass,
  EXPERIENCE_LAB_COMMAND_DOCK_LOCATIONS,
  EXPERIENCE_LAB_COMMAND_DOCK_LOGO_PATH,
  resolveExperienceLabCommandDockLogoUrl,
  formatCommandDockApprovalStatus,
  formatCommandDockPermitStatus,
} from './experience-lab-v2-command-dock-locations';

const V2_DIR = dirname(fileURLToPath(import.meta.url));

describe('Experience Lab Command Dock locations', () => {
  it('uses Studio World logo from live preview storage', () => {
    expect(EXPERIENCE_LAB_COMMAND_DOCK_LOGO_PATH).toContain('IMG_6238.webp');
    expect(resolveExperienceLabCommandDockLogoUrl()).toContain('IMG_6238.webp');
  });

  it('lists HQ locations with Experience Lab as primary department tab', () => {
    expect(EXPERIENCE_LAB_COMMAND_DOCK_LOCATIONS[0]?.title).toBe('FRONTAL SLAYER');
    expect(EXPERIENCE_LAB_COMMAND_DOCK_LOCATIONS[0]?.subtitleAlignLeft).toBe(true);
    expect(EXPERIENCE_LAB_COMMAND_DOCK_LOCATIONS[1]?.id).toBe('experience-lab');
    expect(EXPERIENCE_LAB_COMMAND_DOCK_LOCATIONS.some((l) => l.id === 'reception')).toBe(true);
  });

  it('assigns an icon to every location tab', () => {
    for (const tab of EXPERIENCE_LAB_COMMAND_DOCK_LOCATIONS) {
      expect(tab.icon).toBeTruthy();
    }
    expect(EXPERIENCE_LAB_COMMAND_DOCK_LOCATIONS[0]?.icon).toBe('projects');
    expect(EXPERIENCE_LAB_COMMAND_DOCK_LOCATIONS[1]?.icon).toBe('experienceLab');
    expect(EXPERIENCE_LAB_COMMAND_DOCK_LOCATIONS[2]?.icon).toBe('users');
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

describe('Experience Lab Command Dock presentation', () => {
  const css = readFileSync(resolve(V2_DIR, 'experience-lab-v2.css'), 'utf8');

  it('uses larger logo matching avatar circle and shared avatar size token', () => {
    expect(css).toContain('--elab-cmd-avatar-size: 28px');
    expect(css).toMatch(/\.elab-cmd__logo-img\s*\{[\s\S]*?height:\s*var\(--elab-cmd-avatar-size\)/);
    expect(css).toMatch(/\.elab-cmd__avatar\s*\{[\s\S]*?height:\s*var\(--elab-cmd-avatar-size\)/);
  });

  it('centers overflow dots vertically with panel border (no top-50% transform override)', () => {
    expect(css).toContain('.elab-cmd__overflow');
    expect(css).toMatch(/\.elab-cmd__overflow\s*\{[\s\S]*?top:\s*0;[\s\S]*?bottom:\s*0;[\s\S]*?margin:\s*auto 0;/);
    expect(css).toMatch(/\.elab-cmd__overflow\s*\{[\s\S]*?border:\s*1px solid/);
    expect(css).not.toMatch(/\.elab-cmd__overflow\s*\{[\s\S]*?top:\s*50%/);
  });

  it('adjusts row 2 and row 3 typography independently', () => {
    expect(css).toMatch(/\.elab-cmd__title\s*\{[\s\S]*?font-size:\s*11px/);
    expect(css).toMatch(/\.elab-cmd__location-title\s*\{[\s\S]*?font-size:\s*7px/);
    expect(css).toMatch(/\.elab-cmd__location-title\s*\{[\s\S]*?font-weight:\s*600/);
    expect(css).toMatch(/\.elab-cmd__location-subtitle\s*\{[\s\S]*?font-size:\s*5px/);
    expect(css).toContain('.elab-cmd__location-subtitle--align-left');
    expect(css).toMatch(/\.elab-cmd__status-item\s*\{[\s\S]*?font-size:\s*8px/);
    expect(css).toMatch(/\.elab-cmd__status-item\s*\{[\s\S]*?font-weight:\s*400/);
    expect(css).toMatch(/\.elab-cmd__status-item strong\s*\{[\s\S]*?font-weight:\s*600/);
    expect(css).toMatch(/\.elab-cmd__subtitle\s*\{[\s\S]*?margin-top:\s*2px/);
  });

  it('rounds locations row top and bottom like reference pill', () => {
    expect(css).toContain('--elab-cmd-locations-radius: 12px');
    expect(css).toMatch(/\.elab-cmd__locations\s*\{[\s\S]*?border-radius:\s*0/);
    expect(css).toMatch(/\.elab-cmd__row--locations\s*\{[\s\S]*?margin:\s*0/);
    expect(css).toMatch(/\.elab-cmd__row--locations\s*\{[\s\S]*?padding:\s*0/);
  });
});
