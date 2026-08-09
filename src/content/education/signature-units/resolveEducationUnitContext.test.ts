import { describe, expect, it, beforeEach, vi } from 'vitest';
import { resolveEducationUnitContext } from './resolveEducationUnitContext';
import { writeFollowThisUnitPreference } from './educationUnitPreference';

const storage = new Map<string, string>();

beforeEach(() => {
  storage.clear();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value);
    },
    removeItem: (key: string) => {
      storage.delete(key);
    },
    clear: () => storage.clear(),
  });
});

describe('resolveEducationUnitContext', () => {
  it('returns general mode when no unit owned or selected', () => {
    const ctx = resolveEducationUnitContext({});
    expect(ctx.generalMode).toBe(true);
    expect(ctx.learnerUnitId).toBeNull();
    expect(ctx.contextSource).toBe('general');
  });

  it('uses single owned unit automatically', () => {
    const ctx = resolveEducationUnitContext({ ownedUnitIds: ['noir'] });
    expect(ctx.learnerUnitId).toBe('noir');
    expect(ctx.contextSource).toBe('owned');
    expect(ctx.generalMode).toBe(false);
  });

  it('does not auto-pick when multiple units owned', () => {
    const ctx = resolveEducationUnitContext({ ownedUnitIds: ['noir', 'blanco'] });
    expect(ctx.multipleOwnedUnits).toBe(true);
    expect(ctx.learnerUnitId).toBeNull();
    expect(ctx.contextSource).toBe('general');
  });

  it('respects follow-this-unit preference', () => {
    writeFollowThisUnitPreference('soft-wave');
    const ctx = resolveEducationUnitContext({ ownedUnitIds: ['noir', 'blanco'] });
    expect(ctx.learnerUnitId).toBe('soft-wave');
    expect(ctx.contextSource).toBe('follow-preference');
  });

  it('curriculum-selected demonstration can differ from learner unit', () => {
    const ctx = resolveEducationUnitContext({
      selectedUnitId: 'noir',
      preferredDemonstrationUnitIds: ['soft-wave'],
      demonstrationUnitStrategy: 'curriculum-selected',
      demonstrationUnitReason: 'Wavy texture shows straightening transformation clearly.',
    });
    expect(ctx.learnerUnitId).toBe('noir');
    expect(ctx.demonstrationUnitId).toBe('soft-wave');
    expect(ctx.demonstrationUnitReason).toContain('Wavy texture');
  });
});
