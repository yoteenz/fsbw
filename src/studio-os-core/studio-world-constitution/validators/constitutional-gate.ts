import type { CanonicalMainDepartmentId } from '../../canonical-studio-world/canonical-department-registry';
import { getCanonicalDepartmentRecord } from '../../canonical-studio-world/canonical-department-registry';
import { resolveStyleBible } from '../../studio-world-style/style-bible/registry';
import { validateDepartmentBible } from '../../department-bible/validators/bible-validator';
import { recordConstitutionalAudit } from '../audit/immutable-audit';
import { SUPREME_ARTICLES, SUPREME_CONSTITUTION_VERSION } from '../supreme-articles';

export const CONSTITUTIONAL_GATE_VERSION = 'constitutional-gate.v1' as const;

export type ConstitutionalActorRole =
  | 'admin'
  | 'founder'
  | 'guest'
  | 'marketplace-creator'
  | 'municipal-inspector'
  | 'ai-worker'
  | 'automation'
  | 'system';

export type ConstitutionalExecutionContext =
  | {
      kind: 'department-compile';
      departmentId: CanonicalMainDepartmentId;
      actorRole: ConstitutionalActorRole;
      founderApproved?: boolean;
    }
  | {
      kind: 'founder-render';
      departmentId: CanonicalMainDepartmentId;
      actorRole: ConstitutionalActorRole;
    }
  | {
      kind: 'canonical-modify';
      departmentId: CanonicalMainDepartmentId;
      actorRole: ConstitutionalActorRole;
    }
  | {
      kind: 'cds-manufacture';
      departmentId: CanonicalMainDepartmentId;
      actorRole: ConstitutionalActorRole;
      hasApprovedHandoff: boolean;
    }
  | {
      kind: 'experience-lab-author';
      departmentId: CanonicalMainDepartmentId;
      actorRole: ConstitutionalActorRole;
    }
  | {
      kind: 'marketplace-publish';
      modId: string;
      actorRole: ConstitutionalActorRole;
      cityCouncilApproved: boolean;
      certificationComplete: boolean;
    }
  | {
      kind: 'mod-licensing';
      modId: string;
      actorRole: ConstitutionalActorRole;
      founderOwned: boolean;
      canonicalClaimWithoutLicense: boolean;
    }
  | {
      kind: 'construction';
      departmentId: CanonicalMainDepartmentId;
      actorRole: ConstitutionalActorRole;
      permitGranted: boolean;
    };

export type ConstitutionalGateResult = {
  gateVersion: typeof CONSTITUTIONAL_GATE_VERSION;
  constitutionVersion: typeof SUPREME_CONSTITUTION_VERSION;
  ok: boolean;
  violations: string[];
  articlesEvaluated: string[];
  auditRecordId: string;
};

function articleIds(): string[] {
  return SUPREME_ARTICLES.map((a) => a.id);
}

function deny(
  context: ConstitutionalExecutionContext,
  violations: string[],
  articlesEvaluated: string[]
): ConstitutionalGateResult {
  const audit = recordConstitutionalAudit({
    contextKind: context.kind,
    decision: 'denied',
    articlesEvaluated,
    violations,
    actorRole: context.actorRole,
    subjectId: 'departmentId' in context ? context.departmentId : 'modId' in context ? context.modId : undefined,
  });
  return {
    gateVersion: CONSTITUTIONAL_GATE_VERSION,
    constitutionVersion: SUPREME_CONSTITUTION_VERSION,
    ok: false,
    violations,
    articlesEvaluated,
    auditRecordId: audit.recordId,
  };
}

function allow(
  context: ConstitutionalExecutionContext,
  articlesEvaluated: string[]
): ConstitutionalGateResult {
  const audit = recordConstitutionalAudit({
    contextKind: context.kind,
    decision: 'allowed',
    articlesEvaluated,
    violations: [],
    actorRole: context.actorRole,
    subjectId: 'departmentId' in context ? context.departmentId : 'modId' in context ? context.modId : undefined,
  });
  return {
    gateVersion: CONSTITUTIONAL_GATE_VERSION,
    constitutionVersion: SUPREME_CONSTITUTION_VERSION,
    ok: true,
    violations: [],
    articlesEvaluated,
    auditRecordId: audit.recordId,
  };
}

function validateArticleIV(): string[] {
  const violations: string[] = [];
  const styleBible = resolveStyleBible();
  if (!styleBible.typographyPlaceholders.aiNeverRendersText) {
    violations.push('article-iv:ai-must-not-render-production-ui');
  }
  if (styleBible.authority.hierarchy[0] !== 'Studio World Constitution') {
    violations.push('article-i:constitution-not-supreme-authority');
  }
  return violations;
}

function validateArticleV(departmentId: CanonicalMainDepartmentId, founderApproved?: boolean): string[] {
  const violations: string[] = [];
  const bibleResult = validateDepartmentBible(departmentId, { includeCompile: false });
  if (!bibleResult.ok) {
    violations.push(...bibleResult.violations.map((v) => `article-v:${v}`));
  }
  if (founderApproved === false) {
    violations.push('article-v:founder-approval-required');
  }
  return violations;
}

/**
 * Constitutional Gate™ — all Studio World systems must validate here before execution.
 */
export function validateConstitutionalExecution(context: ConstitutionalExecutionContext): ConstitutionalGateResult {
  const articles = articleIds();
  const violations: string[] = [];

  violations.push(...validateArticleIV());

  switch (context.kind) {
    case 'department-compile':
    case 'founder-render': {
      violations.push(...validateArticleV(context.departmentId, context.kind === 'department-compile' ? context.founderApproved : undefined));
      const record = getCanonicalDepartmentRecord(context.departmentId);
      if (!record) violations.push('article-i:unknown-department');
      break;
    }
    case 'canonical-modify':
    case 'experience-lab-author': {
      if (context.actorRole !== 'admin' && context.actorRole !== 'system' && context.actorRole !== 'automation') {
        violations.push('article-ii:admin-only-canonical-modification');
      }
      violations.push(...validateArticleV(context.departmentId));
      break;
    }
    case 'cds-manufacture': {
      if (!context.hasApprovedHandoff) {
        violations.push('article-v:cds-requires-approved-handoff');
      }
      if (context.actorRole === 'guest') {
        violations.push('article-iii:guest-cannot-manufacture');
      }
      break;
    }
    case 'marketplace-publish': {
      if (!context.cityCouncilApproved) violations.push('article-vii:city-council-approval-required');
      if (!context.certificationComplete) violations.push('article-vii:certification-required');
      break;
    }
    case 'mod-licensing': {
      if (!context.founderOwned) violations.push('article-vi:founder-ownership-required');
      if (context.canonicalClaimWithoutLicense) violations.push('article-vi:no-canonical-without-license');
      break;
    }
    case 'construction': {
      if (!context.permitGranted) violations.push('article-vii:construction-permit-required');
      violations.push(...validateArticleV(context.departmentId));
      break;
    }
  }

  if (violations.length) {
    return deny(context, violations, articles);
  }
  return allow(context, articles);
}

export function assertConstitutionalCompliance(context: ConstitutionalExecutionContext): boolean {
  return validateConstitutionalExecution(context).ok;
}
