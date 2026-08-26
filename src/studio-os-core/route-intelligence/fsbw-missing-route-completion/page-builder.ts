import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { FSBW_MISSING_ROUTE_COMPLETION_SPRINT } from '../constants';
import type {
  MissingPageCompletionMode,
  MissingPageRequirementsBrief,
  PageCreationReceipt,
  StudioWorldDesignRouteManifest,
} from '../types';
import { createPageAuthorshipRecord } from './authorship';

export type PageBuildResult = {
  authorship: ReturnType<typeof createPageAuthorshipRecord>;
  receipt: PageCreationReceipt;
  skippedReason?: string;
};

function slugFromRoute(route: string): string {
  return route
    .replace(/^\//, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'page';
}

function projectComponentDir(projectId: string): string {
  switch (projectId) {
    case 'frontal-slayer':
      return 'src/composer-draft-pages/frontal-slayer';
    case 'all-in-one-enterprise':
      return 'src/composer-draft-pages/all-in-one-enterprise';
    case 'studio-world':
      return 'src/composer-draft-pages/studio-world';
    default:
      return `src/composer-draft-pages/${projectId}`;
  }
}

function simplePageComponentSource(brief: MissingPageRequirementsBrief, familyUsed?: string): string {
  const title = brief.displayName.toUpperCase();
  return `/** COMPOSER DRAFT — ${FSBW_MISSING_ROUTE_COMPLETION_SPRINT} · PREVIEW ONLY */
import { ComposerDraftPageShell } from '../ComposerDraftPageShell';

export default function ComposerDraft_${slugFromRoute(brief.route).replace(/-/g, '_')}() {
  return (
    <ComposerDraftPageShell
      projectId="${brief.projectId}"
      route="${brief.route}"
      displayName="${brief.displayName}"
      completionMode="FAMILY_DERIVED_SIMPLE"
      familyUsed="${familyUsed ?? 'unknown'}"
    >
      <h1 className="composer-draft__title">${title}</h1>
      <p className="composer-draft__body">CONTENT_REQUIRED — family-derived draft page.</p>
    </ComposerDraftPageShell>
  );
}
`;
}

function complexShellComponentSource(brief: MissingPageRequirementsBrief, mode: MissingPageCompletionMode): string {
  const title = brief.displayName.toUpperCase();
  const flag = brief.creativeDirectionRequired
    ? 'CREATIVE_DIRECTION_REQUIRED'
    : brief.functionalReviewRequired
      ? 'FUNCTIONAL_REVIEW_REQUIRED'
      : 'REVIEW_REQUIRED';
  return `/** COMPOSER DRAFT SHELL — ${FSBW_MISSING_ROUTE_COMPLETION_SPRINT} · PREVIEW ONLY · ${flag} */
import { ComposerDraftPageShell } from '../ComposerDraftPageShell';

export default function ComposerDraft_${slugFromRoute(brief.route).replace(/-/g, '_')}() {
  return (
    <ComposerDraftPageShell
      projectId="${brief.projectId}"
      route="${brief.route}"
      displayName="${brief.displayName}"
      completionMode="${mode}"
      creativeDirectionRequired={${brief.creativeDirectionRequired}}
      functionalReviewRequired={${brief.functionalReviewRequired}}
    >
      <section className="composer-draft__region" data-region="hero">
        <h1 className="composer-draft__title">${title}</h1>
        <p className="composer-draft__placeholder">CONTENT_REQUIRED — structural shell only.</p>
      </section>
      <section className="composer-draft__region" data-region="primary">
        <p className="composer-draft__placeholder">Interaction placeholders — no final creative design.</p>
      </section>
      <section className="composer-draft__region" data-region="actions">
        <button type="button" className="composer-draft__btn" disabled>ACTION PLACEHOLDER</button>
      </section>
    </ComposerDraftPageShell>
  );
}
`;
}

export function buildMissingPageImplementation(
  brief: MissingPageRequirementsBrief,
  manifest: StudioWorldDesignRouteManifest,
  options: { repoRoot: string; sourceCommit: string; executeBuild: boolean },
): PageBuildResult {
  const familyUsed = brief.designFamilyIds[0]
    ? manifest.designFamilies?.find((f) => f.designFamilyId === brief.designFamilyIds[0])?.displayName
    : undefined;

  const authorship = createPageAuthorshipRecord({
    projectId: brief.projectId,
    experiencePageId: brief.candidateId,
    route: brief.route,
    displayName: brief.displayName,
    completionMode: brief.completionMode,
    sourceCommit: options.sourceCommit,
    creativeDirectionRequired: brief.creativeDirectionRequired,
    functionalReviewRequired: brief.functionalReviewRequired,
  });

  const relComponentPath = join(projectComponentDir(brief.projectId), `${slugFromRoute(brief.route)}.tsx`);
  const absComponentPath = join(options.repoRoot, relComponentPath);

  const filesCreated: string[] = [];
  const filesModified: string[] = [];

  if (options.executeBuild) {
    if (existsSync(absComponentPath)) {
      return {
        authorship,
        receipt: {
          receiptId: `${brief.candidateId}:receipt`,
          projectId: brief.projectId,
          experiencePageId: brief.candidateId,
          displayName: brief.displayName,
          route: brief.route,
          completionMode: brief.completionMode,
          filesCreated: [],
          filesModified: [],
          familyUsed,
          contentSources: brief.contentBlocks.map((b) => b.provenance),
          inferredContent: [],
          dependenciesResolved: brief.dependencies,
          createdBy: FSBW_MISSING_ROUTE_COMPLETION_SPRINT,
          sourceCommit: options.sourceCommit,
          createdAt: new Date().toISOString(),
          previewOnly: true,
          productionNavBlocked: true,
        },
        skippedReason: 'EXISTING_PAGE_UNTOUCHED',
      };
    }

    const source =
      brief.completionMode === 'FAMILY_DERIVED_SIMPLE'
        ? simplePageComponentSource(brief, familyUsed)
        : complexShellComponentSource(brief, brief.completionMode);

    mkdirSync(dirname(absComponentPath), { recursive: true });
    writeFileSync(absComponentPath, source, 'utf8');
    filesCreated.push(relComponentPath);
  }

  const receipt: PageCreationReceipt = {
    receiptId: `${brief.candidateId}:receipt:${Date.now()}`,
    projectId: brief.projectId,
    experiencePageId: brief.candidateId,
    displayName: brief.displayName,
    route: brief.route,
    completionMode: brief.completionMode,
    filesCreated,
    filesModified,
    familyUsed,
    contentSources: brief.contentBlocks.map((b) => b.provenance),
    inferredContent: brief.requiredContent.filter((c) => c.includes('CONTENT_REQUIRED')),
    dependenciesResolved: brief.dependencies,
    createdBy: FSBW_MISSING_ROUTE_COMPLETION_SPRINT,
    sourceCommit: options.sourceCommit,
    createdAt: new Date().toISOString(),
    previewOnly: true,
    productionNavBlocked: true,
  };

  return { authorship, receipt };
}
