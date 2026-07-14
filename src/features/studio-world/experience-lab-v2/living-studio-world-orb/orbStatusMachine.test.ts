import { describe, expect, it } from 'vitest';
import {
  deriveOrbPresentationStatus,
  orbStatusAriaLabel,
  resolveOrbStatusFromViewModel,
} from './orbStatusMachine';
import type { ExperienceLabV2ViewModel } from '../experience-lab-v2.types';

function baseModel(overrides: Partial<ExperienceLabV2ViewModel> = {}): ExperienceLabV2ViewModel {
  return {
    version: 'v2',
    program: 'experience-lab',
    departmentId: 'experience-lab',
    departmentName: 'Experience Lab',
    revision: 1,
    approvalStatus: 'pending',
    permitStatus: 'pending',
    costEstimate: '$0',
    healthState: 'healthy',
    testMode: 'MOCK',
    liveBackendMode: true,
    viewportMode: 'BLUEPRINT',
    artifacts: {},
    founderRender: null,
    blueprintSummary: '',
    constructionSummary: '',
    charterSummary: '',
    dependencies: [],
    approval: {
      canApprove: false,
      disabledReasons: [],
      primaryActionLabel: 'Approve',
      permitStatus: 'pending',
      approvalRecorded: false,
    },
    migrationReadiness: {
      mobileApproved: false,
      desktopApproved: false,
      viewportApproved: false,
      dataParityApproved: false,
      generationParityApproved: false,
      accessibilityApproved: false,
      performanceApproved: false,
      productionNavigationApproved: false,
    },
    diagnostics: [],
    isStale: false,
    imageLoaded: true,
    ...overrides,
  } as ExperienceLabV2ViewModel;
}

describe('orbStatusMachine', () => {
  it('resolves IDLE by default', () => {
    expect(resolveOrbStatusFromViewModel(baseModel())).toBe('IDLE');
  });

  it('resolves GENERATING when viewport is loading', () => {
    expect(resolveOrbStatusFromViewModel(baseModel({ viewportMode: 'LOADING' }))).toBe('GENERATING');
  });

  it('resolves WARNING when stale or permit blocked', () => {
    expect(resolveOrbStatusFromViewModel(baseModel({ isStale: true }))).toBe('WARNING');
    expect(resolveOrbStatusFromViewModel(baseModel({ permitStatus: 'blocked' }))).toBe('WARNING');
  });

  it('resolves ERROR and OFFLINE states', () => {
    expect(resolveOrbStatusFromViewModel(baseModel({ viewportMode: 'ERROR' }))).toBe('ERROR');
    expect(resolveOrbStatusFromViewModel(baseModel({ liveBackendMode: false }))).toBe('OFFLINE');
  });

  it('resolves APPROVED when approval recorded', () => {
    expect(
      resolveOrbStatusFromViewModel(
        baseModel({
          approvalStatus: 'approved',
          approval: {
            canApprove: true,
            disabledReasons: [],
            primaryActionLabel: 'Approved',
            permitStatus: 'clear',
            approvalRecorded: true,
          },
        })
      )
    ).toBe('APPROVED');
  });

  it('prioritizes hover and focus presentation', () => {
    expect(deriveOrbPresentationStatus('GENERATING', true, false)).toBe('HOVER');
    expect(deriveOrbPresentationStatus('GENERATING', false, true)).toBe('FOCUSED');
  });

  it('exposes accessible status labels', () => {
    expect(orbStatusAriaLabel('GENERATING')).toBe('STUDIO WORLD ORB — GENERATING');
    expect(orbStatusAriaLabel('IDLE')).toBe('STUDIO WORLD ORB — IDLE');
  });
});
