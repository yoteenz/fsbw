import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { FSBW_FAMILY_DERIVATION_SPRINT } from '../constants';
import type {
  FamilyDerivedMissingTargetRecord,
  FamilyDerivationReceipt,
  FamilySiblingCandidate,
  MissingDesignTargetType,
  MissingPageCandidateRecord,
  MissingTargetQueueGroup,
  MissingTargetQueueItem,
  StudioWorldDesignRouteManifest,
} from '../types';
import { createPageAuthorshipRecord } from './authorship';
import {
  defaultAllowedDifferences,
  defaultPreservedProperties,
  reviewStatusForTarget,
  validateFamilyFidelity,
} from './family-fidelity-qa';
import { captureFamilySiblingOnDemand, planDerivedTargetDraftSnapshots } from './on-demand-capture';
import { selectBestFamilySibling } from './sibling-selector';
import {
  classifyMissingDesignTarget,
  isTrueMissingRouteHandoff,
} from './target-classifier';

export type DeriveMissingTargetOptions = {
  repoRoot: string;
  sourceCommit: string;
  executeBuild?: boolean;
  founderOverrideSiblingId?: string;
  existingSnapshots?: import('../types').ComposerDraftSnapshotRecord[];
};

export type DeriveMissingTargetResult = {
  target: FamilyDerivedMissingTargetRecord;
  sibling?: FamilySiblingCandidate;
  siblingCandidates: FamilySiblingCandidate[];
  authorship?: ReturnType<typeof createPageAuthorshipRecord>;
  derivationReceipt?: FamilyDerivationReceipt;
  sourceSnapshots: import('../types').ComposerDraftSnapshotRecord[];
  draftSnapshots: import('../types').ComposerDraftSnapshotRecord[];
  filesCreated: string[];
  skippedReason?: string;
};

function slugFromRoute(route: string): string {
  return route
    .replace(/^\//, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'page';
}

function tabStateComponentSource(target: FamilyDerivedMissingTargetRecord, sibling?: FamilySiblingCandidate): string {
  const tabLabel = target.displayName.toUpperCase();
  const activeTab = target.displayName.replace(/\s+/g, '');
  return `/** COMPOSER DERIVED — ${FSBW_FAMILY_DERIVATION_SPRINT} · TAB_STATE · PREVIEW ONLY */
import { ComposerDraftPageShell } from '../../ComposerDraftPageShell';

/** Reuses ${sibling?.displayName ?? 'family sibling'} shell — active tab: ${tabLabel} */
export default function ComposerDerived_${slugFromRoute(target.representativeRoute).replace(/-/g, '_')}() {
  return (
    <ComposerDraftPageShell
      projectId="${target.projectId}"
      route="${target.representativeRoute}"
      displayName="${target.displayName}"
      completionMode="FAMILY_DERIVED_SIMPLE"
      familyUsed="${target.sourceFamilyId ?? 'character-lab'}"
      data-active-tab="${activeTab}"
      data-derived-from="${sibling?.route ?? ''}"
    >
      <nav className="composer-draft__tabs" aria-label="Character Lab tabs">
        <span className="composer-draft__tab">Character</span>
        <span className="composer-draft__tab">Visual</span>
        <span className="composer-draft__tab">Wardrobe</span>
        <span className="composer-draft__tab composer-draft__tab--active">${tabLabel}</span>
      </nav>
      <section className="composer-draft__region" data-region="voice-lab-content">
        <h1 className="composer-draft__title">${tabLabel}</h1>
        <p className="composer-draft__body">CONTENT_REQUIRED — Voice Lab controls derived from Character Lab shell.</p>
      </section>
    </ComposerDraftPageShell>
  );
}
`;
}

function materialScreenComponentSource(target: FamilyDerivedMissingTargetRecord): string {
  return `/** COMPOSER DERIVED — ${FSBW_FAMILY_DERIVATION_SPRINT} · MATERIAL_SCREEN · PREVIEW ONLY */
import { ComposerDraftPageShell } from '../../ComposerDraftPageShell';

export default function ComposerDerived_${slugFromRoute(target.representativeRoute).replace(/-/g, '_')}() {
  return (
    <ComposerDraftPageShell projectId="${target.projectId}" route="${target.representativeRoute}" displayName="${target.displayName}" completionMode="FAMILY_DERIVED_SIMPLE">
      <section data-material-screen="${target.materialScreenId ?? target.targetId}">
        <h1>${target.displayName.toUpperCase()}</h1>
        <p>Material screen — nested under ${target.parentExperiencePageId ?? 'parent page'}.</p>
      </section>
    </ComposerDraftPageShell>
  );
}
`;
}

function buildTargetRecord(
  candidate: MissingPageCandidateRecord,
  targetType: MissingDesignTargetType,
  sibling?: FamilySiblingCandidate,
  _siblingCandidates: FamilySiblingCandidate[] = [],
): FamilyDerivedMissingTargetRecord {
  const confidence = sibling?.confidence ?? 'LOW';
  const captureRequired = sibling?.captureRequired ?? false;

  return {
    targetId: candidate.candidateId,
    projectId: candidate.projectId,
    targetType,
    displayName: candidate.displayName,
    representativeRoute: candidate.representativeRoute,
    experiencePageId: candidate.experiencePageId,
    parentExperiencePageId: candidate.sectionId,
    sourceFamilyId: sibling?.familyId ?? candidate.designFamilyIds[0],
    sourceSiblingId: sibling?.siblingId,
    sourceRoute: sibling?.route,
    sourceComponentIds: sibling?.shellId ? [sibling.shellId] : [],
    shellId: sibling?.shellId,
    sharedComponentIds: sibling?.shellId ? [sibling.shellId] : [],
    preservedProperties: defaultPreservedProperties(targetType),
    allowedDifferences: defaultAllowedDifferences(targetType, candidate.displayName),
    derivationConfidence: confidence,
    createdBy: FSBW_FAMILY_DERIVATION_SPRINT,
    reviewStatus: reviewStatusForTarget(targetType, confidence, captureRequired),
    lineage: {
      derivedFromFamily: sibling?.familyId,
      derivedFromSibling: sibling?.siblingId,
      derivedFromShell: sibling?.shellId,
      derivedFromComponents: sibling?.shellId ? [sibling.shellId] : [],
    },
    trueMissingRoute: isTrueMissingRouteHandoff(targetType, candidate),
    handoffSprint: isTrueMissingRouteHandoff(targetType, candidate) ? 'P0.VR.3H-FSBW' : undefined,
  };
}

export function deriveMissingTargetFromFamily(
  candidate: MissingPageCandidateRecord,
  manifest: StudioWorldDesignRouteManifest,
  options: DeriveMissingTargetOptions,
): DeriveMissingTargetResult {
  const targetType = classifyMissingDesignTarget({ candidate, manifest });
  const { sibling, candidates } = selectBestFamilySibling(
    candidate,
    manifest,
    targetType,
    options.founderOverrideSiblingId,
    options.existingSnapshots ?? [],
  );

  const target = buildTargetRecord(candidate, targetType, sibling, candidates);

  if (target.trueMissingRoute) {
    return {
      target,
      sibling,
      siblingCandidates: candidates,
      sourceSnapshots: [],
      draftSnapshots: [],
      filesCreated: [],
      skippedReason: 'TRUE_MISSING_ROUTE — handoff to P0.VR.3H-FSBW',
    };
  }

  if (targetType === 'CONTENT_INSTANCE' || targetType === 'DATA_INSTANCE' || targetType === 'VISUAL_STATE') {
    return {
      target: { ...target, reviewStatus: 'READY_FOR_DERIVATION' },
      sibling,
      siblingCandidates: candidates,
      sourceSnapshots: [],
      draftSnapshots: [],
      filesCreated: [],
      skippedReason: 'INSTANCE/STATE — no new route',
    };
  }

  const authorship = createPageAuthorshipRecord({
    projectId: candidate.projectId,
    experiencePageId: candidate.candidateId,
    route: candidate.representativeRoute,
    displayName: candidate.displayName,
    completionMode: 'FAMILY_DERIVED_SIMPLE',
    sourceCommit: options.sourceCommit,
    creativeDirectionRequired: targetType === 'UNIQUE_EXPERIENCE',
    functionalReviewRequired: false,
  });
  authorship.createdBySprint = FSBW_FAMILY_DERIVATION_SPRINT;

  const sourceCapture = sibling
    ? captureFamilySiblingOnDemand(
        {
          sibling,
          projectId: candidate.projectId,
          authorshipId: authorship.authorshipId,
        },
        options.existingSnapshots ?? [],
      )
    : { snapshots: [], reusedExisting: false, captureRequired: false };

  const draftSnapshots = planDerivedTargetDraftSnapshots(authorship);

  const fidelity = validateFamilyFidelity(target);
  const derivationReceipt: FamilyDerivationReceipt = {
    receiptId: `${target.targetId}:derivation:${Date.now()}`,
    targetId: target.targetId,
    projectId: target.projectId,
    targetType,
    sourceSiblingId: sibling?.siblingId,
    draftSnapshotIds: draftSnapshots.map((s) => s.snapshotId),
    fidelityIssues: fidelity.issues,
    unexplainedDrift: fidelity.unexplainedDrift,
    createdAt: new Date().toISOString(),
    createdBy: FSBW_FAMILY_DERIVATION_SPRINT,
  };

  const filesCreated: string[] = [];
  const shouldWriteDraft =
    options.executeBuild &&
    (targetType === 'TAB_STATE' || targetType === 'MATERIAL_SCREEN' || targetType === 'FAMILY_DERIVED_PAGE');

  if (shouldWriteDraft) {
      const relPath = join(
        'src/composer-draft-pages',
        candidate.projectId,
        `${slugFromRoute(candidate.representativeRoute)}.tsx`,
      );
      const absPath = join(options.repoRoot, relPath);
      if (!existsSync(absPath)) {
        const source =
          targetType === 'TAB_STATE'
            ? tabStateComponentSource(target, sibling)
            : targetType === 'MATERIAL_SCREEN'
              ? materialScreenComponentSource(target)
              : tabStateComponentSource(target, sibling);
        mkdirSync(dirname(absPath), { recursive: true });
        writeFileSync(absPath, source, 'utf8');
        filesCreated.push(relPath);
      }
  }

  return {
    target: {
      ...target,
      reviewStatus: filesCreated.length || draftSnapshots.length ? 'COMPOSER_DRAFT' : target.reviewStatus,
    },
    sibling,
    siblingCandidates: candidates,
    authorship,
    derivationReceipt,
    sourceSnapshots: sourceCapture.snapshots,
    draftSnapshots,
    filesCreated,
  };
}

export function queueGroupForTarget(target: FamilyDerivedMissingTargetRecord): MissingTargetQueueGroup {
  if (target.trueMissingRoute) return 'TRUE_MISSING_ROUTE';
  if (target.targetType === 'UNIQUE_EXPERIENCE') return 'NEEDS_CREATIVE_DIRECTION';
  if (target.derivationConfidence === 'LOW') return 'NEEDS_SIBLING_SELECTION';
  if (target.targetType === 'CONTENT_INSTANCE' || target.targetType === 'DATA_INSTANCE' || target.targetType === 'VISUAL_STATE') {
    return 'INSTANCE_STATE_ONLY';
  }
  if (target.reviewStatus === 'SOURCE_CAPTURE_REQUIRED') return 'NEEDS_SIBLING_SELECTION';
  return 'READY_FOR_FAMILY_DERIVATION';
}

export function buildMissingTargetQueue(
  targets: FamilyDerivedMissingTargetRecord[],
  siblingMap: Map<string, FamilySiblingCandidate>,
  candidatesMap: Map<string, FamilySiblingCandidate[]>,
): MissingTargetQueueItem[] {
  return targets.map((target) => ({
    group: queueGroupForTarget(target),
    target,
    sibling: siblingMap.get(target.targetId),
    siblingCandidates: candidatesMap.get(target.targetId),
  }));
}

/** Synthetic Character Lab → Voice Lab target for Studio World pattern tests */
export function characterLabVoiceLabFixture(): MissingPageCandidateRecord {
  return {
    candidateId: 'studio-world:missing:character-lab:voice-lab',
    projectId: 'studio-world',
    experiencePageId: 'studio-world:xp:character-lab',
    displayName: 'Voice Lab',
    representativeRoute: '/admin/studio/character-lab/voice-lab',
    sectionId: 'studio-world:section:character-lab',
    designFamilyIds: ['studio-world:dfamily:character-lab'],
    sourceKind: 'EXPERIENCE_PAGE',
    ownership: 'FSBW',
    implementationStatus: 'IMPLEMENTATION_MISSING',
  };
}
