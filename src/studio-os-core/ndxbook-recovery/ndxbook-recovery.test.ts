import { describe, expect, it } from 'vitest';
import { buildNdxbookLegacyHandoff } from './build-handoff';
import { assertHandoffHasNoSecrets, isSecretKey, looksLikeSecretValue, sanitizeForHandoff } from './sanitize';

describe('NDXbook legacy intelligence recovery', () => {
  const pkg = buildNdxbookLegacyHandoff({ commitSha: 'test-commit' });

  it('includes classified brand positioning from constants', () => {
    expect(pkg.brand.positioning.value).toBe('the index for everyday knowledge.');
    expect(pkg.brand.positioning.classification).toBe('CANONICAL');
    expect(pkg.brand.positioning.confidence).toBe('HIGH');
    expect(pkg.brand.positioning.provenance[0]?.file).toContain('ndxbook/constants');
  });

  it('marks creative DNA as confirmation required (placeholder)', () => {
    expect(pkg.visualIdentity.creativeDnaStatus.value).toBe('placeholder');
    expect(pkg.visualIdentity.creativeDnaStatus.classification).toBe('OWNER_CONFIRMATION_REQUIRED');
  });

  it('preserves demo vs pilot conflict', () => {
    expect(pkg.conflicts.length).toBeGreaterThan(0);
    expect(pkg.conflicts.some((c) => c.classification === 'CONFLICT')).toBe(true);
  });

  it('marks obsolete demo distribution packs', () => {
    expect(pkg.obsolete.length).toBeGreaterThan(0);
    expect(pkg.obsolete[0]?.classification).toBe('OBSOLETE');
  });

  it('separates Studio World-only production history', () => {
    expect(pkg.studioWorldHistory.pagePipeline.classification).toBe('STUDIO_WORLD_ONLY');
  });

  it('excludes secrets from handoff package', () => {
    const check = assertHandoffHasNoSecrets(pkg);
    expect(check.ok).toBe(true);
  });

  it('detects secret keys and values', () => {
    expect(isSecretKey('encrypted_tokens')).toBe(true);
    expect(isSecretKey('brandName')).toBe(false);
    expect(looksLikeSecretValue('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.abc.def')).toBe(true);
    expect(looksLikeSecretValue('the index for everyday knowledge.')).toBe(false);
  });

  it('sanitizes nested secret fields', () => {
    const raw = { brand: 'ndxbook', encrypted_tokens: 'secret-value', meta: { api_key: 'sk-test' } };
    const clean = sanitizeForHandoff(raw) as Record<string, unknown>;
    expect(clean.encrypted_tokens).toBeUndefined();
    expect((clean.meta as Record<string, unknown>).api_key).toBeUndefined();
  });

  it('includes EVOLVE gap analysis for all required domains', () => {
    const domains = pkg.evolveGapAnalysis.map((e) => e.domain);
    expect(domains).toContain('business description');
    expect(domains).toContain('Instagram role');
    expect(domains).toContain('publishing cadence');
    expect(domains).toContain('automation preference');
  });

  it('reduces founder questionnaire to genuine gaps', () => {
    expect(pkg.founderQuestions.length).toBeGreaterThanOrEqual(6);
    expect(pkg.founderQuestions.length).toBeLessThanOrEqual(12);
    expect(pkg.founderQuestions.every((q) => q.question.length > 10)).toBe(true);
  });

  it('defines import contract without SITE 00 implementation', () => {
    expect(pkg.importContract.packageName).toBe('NdxbookLegacyIntelligencePackage');
    expect(pkg.importContract.stages).toContain('OWNER_CONFIRMED');
    expect(pkg.importContract.rules.some((r) => r.includes('STUDIO_WORLD_ONLY'))).toBe(true);
  });

  it('does not introduce runtime coupling marker', () => {
    expect(pkg.meta.boundary).toContain('no runtime coupling');
  });
});
