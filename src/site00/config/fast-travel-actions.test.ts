import { describe, expect, it } from 'vitest';
import { getFastTravelActions } from './fast-travel-actions';
import { SITE00_ROUTES } from './routes';
import { SITE00_CTRL_ROOM_PATH } from './mobile-directory-nav';

describe('getFastTravelActions', () => {
  it('returns signed-out starter tiles without private data', () => {
    const actions = getFastTravelActions({ authState: { isSignedIn: false } });
    expect(actions).toHaveLength(4);
    expect(actions.map((a) => a.id)).toEqual([
      'start-build',
      'find-build-type',
      'evolve-site',
      'create-idnty',
    ]);
    expect(actions.every((a) => !a.description.includes('NORTHQUARTER'))).toBe(true);
  });

  it('prioritizes blockers for signed-in users', () => {
    const actions = getFastTravelActions({
      authState: { isSignedIn: true },
      blockers: [
        {
          id: 'domain',
          label: 'Domain connection required',
          urgent: true,
          href: '/control/domains',
        },
      ],
      projects: [],
      sites: [],
      activeBuilds: [],
    });
    expect(actions[0]?.id).toBe('action-required');
    expect(actions[0]?.href).toBe('/control/domains');
  });

  it('surfaces continue build from active work', () => {
    const actions = getFastTravelActions({
      authState: { isSignedIn: true },
      activeBuilds: [
        {
          id: 'p1',
          name: 'Northquarter',
          stage: 'Design',
          progress: 72,
          href: '/projects/northquarter',
        },
      ],
      projects: [
        {
          id: 'p1',
          name: 'Northquarter Brand + Digital Launch',
          description: '',
          status: 'ACTIVE',
          stage: 'Design',
          progress: 72,
          lastUpdated: '',
          teamInitials: [],
          href: '/projects/northquarter',
        },
      ],
      sites: [],
      blockers: [],
    });
    const continueTile = actions.find((a) => a.id === 'continue-build');
    expect(continueTile).toBeDefined();
    expect(continueTile?.description).toContain('72%');
    expect(continueTile?.href).toBe('/projects/northquarter');
  });

  it('includes evolve route in starter set', () => {
    const actions = getFastTravelActions({ authState: { isSignedIn: false } });
    const evolve = actions.find((a) => a.id === 'evolve-site');
    expect(evolve?.href).toBe(SITE00_ROUTES.evolve);
  });

  it('returns max four tiles', () => {
    const actions = getFastTravelActions({
      authState: { isSignedIn: true },
      blockers: [
        { id: 'a', label: 'Domain connection required', urgent: true, href: '/control/domains' },
        { id: 'b', label: 'Homepage awaiting approval', urgent: true, href: '/projects/a' },
      ],
      now: [{ id: 'c', label: '1 approval waiting', href: '/projects/b' }],
      upNext: [{ id: 'd', label: 'Homepage Approval', date: 'Aug 20' }],
      activeBuilds: [
        { id: 'p1', name: 'Test', stage: 'Design', progress: 50, href: '/projects/test' },
      ],
      projects: [
        {
          id: 'p1',
          name: 'Test',
          description: '',
          status: 'ACTIVE',
          stage: 'Design',
          progress: 50,
          lastUpdated: '',
          teamInitials: [],
          href: '/projects/test',
        },
      ],
      sites: [],
    });
    expect(actions.length).toBeLessThanOrEqual(4);
  });

  it('uses ctrl room for signed-in starter fallback', () => {
    const actions = getFastTravelActions({
      authState: { isSignedIn: true },
      projects: [],
      sites: [],
      blockers: [],
      activeBuilds: [],
    });
    expect(actions.some((a) => a.href === SITE00_CTRL_ROOM_PATH)).toBe(true);
  });
});
