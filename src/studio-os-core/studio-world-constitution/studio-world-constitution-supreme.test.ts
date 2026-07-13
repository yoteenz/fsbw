import { describe, expect, it, beforeEach } from 'vitest';
import { CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY } from '../canonical-studio-world/canonical-department-registry';
import { compileDepartment } from '../department-bible/compiler/department-compiler';
import {
  SUPREME_ARTICLES,
  SUPREME_CONSTITUTION_VERSION,
  GOVERNANCE_HIERARCHY,
  listSupremeArticles,
  getSupremeArticle,
} from './supreme-articles';
import {
  clearConstitutionalAuditForTests,
  getConstitutionalAuditCount,
  listConstitutionalAuditRecords,
  recordConstitutionalAudit,
} from './audit/immutable-audit';
import {
  validateConstitutionalExecution,
  assertConstitutionalCompliance,
  CONSTITUTIONAL_GATE_VERSION,
} from './validators/constitutional-gate';
import { resolveStyleBible } from '../studio-world-style/style-bible/registry';

describe('Studio World Constitution™ — Supreme Articles', () => {
  it('defines eight supreme articles as highest authority', () => {
    expect(SUPREME_CONSTITUTION_VERSION).toBe('studio-world-constitution-supreme.v1');
    expect(SUPREME_ARTICLES.length).toBe(8);
    expect(listSupremeArticles().length).toBe(8);
  });

  it('Article I establishes world identity', () => {
    const article = getSupremeArticle('article-i-world-identity');
    expect(article.title).toBe('World Identity');
    expect(article.mission).toContain('persistent operating system');
    expect(article.prohibitions).toContain('page-first thinking');
  });

  it('Article II governs canonical infrastructure', () => {
    const article = getSupremeArticle('article-ii-canonical-infrastructure');
    expect(article.rules).toContain('Only Studio World Administrators may modify canonical departments');
    expect(article.prohibitions).toContain('founder ownership of canonical infrastructure');
  });

  it('Article III separates founder and Studio World property', () => {
    const article = getSupremeArticle('article-iii-founder-property');
    expect(article.rules.some((r) => r.includes('Founders own'))).toBe(true);
    expect(article.rules.some((r) => r.includes('Studio World owns'))).toBe(true);
  });

  it('Article IV governs AI generation boundaries', () => {
    const article = getSupremeArticle('article-iv-ai-generation');
    expect(article.prohibitions).toContain('production UI');
    expect(article.prohibitions).toContain('typography');
    expect(article.rules.some((r) => r.includes('placeholder interfaces'))).toBe(true);
  });

  it('Article V requires complete blueprint governance stack', () => {
    const article = getSupremeArticle('article-v-blueprint-governance');
    expect(article.rules).toContain('Department Bible');
    expect(article.rules).toContain('Style Bible');
    expect(article.rules).toContain('Architectural DNA');
    expect(article.rules).toContain('Golden Reference Pack');
    expect(article.rules).toContain('Founder Approval');
  });

  it('Article VI protects founder mod ownership', () => {
    const article = getSupremeArticle('article-vi-mod-governance');
    expect(article.mission).toContain('founder-owned');
    expect(article.prohibitions).toContain('rewriting creator lineage');
  });

  it('Article VII requires municipal governance', () => {
    const article = getSupremeArticle('article-vii-municipal-governance');
    expect(article.rules.some((r) => r.includes('City Council'))).toBe(true);
    expect(article.prohibitions).toContain('bypassing City Council');
  });

  it('Article VIII mandates immutable audit', () => {
    const article = getSupremeArticle('article-viii-immutable-audit');
    expect(article.rules.some((r) => r.includes('append-only'))).toBe(true);
  });

  it('governance hierarchy places Constitution above Style Bible', () => {
    expect(GOVERNANCE_HIERARCHY[0]).toBe('Studio World Constitution');
    expect(GOVERNANCE_HIERARCHY[1]).toBe('Studio World Style Bible');
    expect(resolveStyleBible().authority.hierarchy[0]).toBe('Studio World Constitution');
  });
});

describe('Constitutional Gate™', () => {
  beforeEach(() => {
    clearConstitutionalAuditForTests();
  });

  it('allows department compilation for all canonical departments', () => {
    for (const record of CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY) {
      const result = validateConstitutionalExecution({
        kind: 'department-compile',
        departmentId: record.departmentId,
        actorRole: 'system',
        founderApproved: true,
      });
      expect(result.ok).toBe(true);
      expect(result.gateVersion).toBe(CONSTITUTIONAL_GATE_VERSION);
      expect(result.articlesEvaluated.length).toBe(8);
    }
  });

  it('department compiler passes constitutional gate', () => {
    const result = compileDepartment('experience-lab', 'landscape');
    expect(result.ok).toBe(true);
  });

  it('denies canonical modification by founder', () => {
    const result = validateConstitutionalExecution({
      kind: 'canonical-modify',
      departmentId: 'experience-lab',
      actorRole: 'founder',
    });
    expect(result.ok).toBe(false);
    expect(result.violations).toContain('article-ii:admin-only-canonical-modification');
  });

  it('denies marketplace publish without city council approval', () => {
    const result = validateConstitutionalExecution({
      kind: 'marketplace-publish',
      modId: 'mod-test-1',
      actorRole: 'marketplace-creator',
      cityCouncilApproved: false,
      certificationComplete: false,
    });
    expect(result.ok).toBe(false);
    expect(result.violations).toContain('article-vii:city-council-approval-required');
  });

  it('denies mod canonicalization without license', () => {
    const result = validateConstitutionalExecution({
      kind: 'mod-licensing',
      modId: 'mod-test-2',
      actorRole: 'founder',
      founderOwned: true,
      canonicalClaimWithoutLicense: true,
    });
    expect(result.ok).toBe(false);
    expect(result.violations).toContain('article-vi:no-canonical-without-license');
  });

  it('denies CDS manufacture without approved handoff', () => {
    const result = validateConstitutionalExecution({
      kind: 'cds-manufacture',
      departmentId: 'creative-director-studio',
      actorRole: 'founder',
      hasApprovedHandoff: false,
    });
    expect(result.ok).toBe(false);
    expect(result.violations).toContain('article-v:cds-requires-approved-handoff');
  });

  it('denies construction without permit', () => {
    const result = validateConstitutionalExecution({
      kind: 'construction',
      departmentId: 'construction-mode',
      actorRole: 'admin',
      permitGranted: false,
    });
    expect(result.ok).toBe(false);
    expect(result.violations).toContain('article-vii:construction-permit-required');
  });

  it('assertConstitutionalCompliance returns boolean', () => {
    expect(
      assertConstitutionalCompliance({
        kind: 'department-compile',
        departmentId: 'command-center',
        actorRole: 'system',
        founderApproved: true,
      })
    ).toBe(true);
  });
});

describe('Immutable Constitutional Audit™', () => {
  beforeEach(() => {
    clearConstitutionalAuditForTests();
  });

  it('records every constitutional validation attempt', () => {
    validateConstitutionalExecution({
      kind: 'department-compile',
      departmentId: 'experience-lab',
      actorRole: 'system',
      founderApproved: true,
    });
    validateConstitutionalExecution({
      kind: 'canonical-modify',
      departmentId: 'experience-lab',
      actorRole: 'founder',
    });
    expect(getConstitutionalAuditCount()).toBe(2);
    const records = listConstitutionalAuditRecords();
    expect(records.some((r) => r.decision === 'allowed')).toBe(true);
    expect(records.some((r) => r.decision === 'denied')).toBe(true);
  });

  it('audit records are append-only with unique ids', () => {
    const a = recordConstitutionalAudit({
      contextKind: 'test',
      decision: 'allowed',
      articlesEvaluated: ['article-viii-immutable-audit'],
      violations: [],
    });
    const b = recordConstitutionalAudit({
      contextKind: 'test',
      decision: 'denied',
      articlesEvaluated: ['article-viii-immutable-audit'],
      violations: ['test-violation'],
    });
    expect(a.recordId).not.toBe(b.recordId);
    expect(getConstitutionalAuditCount()).toBe(2);
  });
});
