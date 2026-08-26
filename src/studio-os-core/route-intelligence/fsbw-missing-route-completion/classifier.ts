import type {
  DesignFamilyRecord,
  MissingPageCandidateRecord,
  MissingPageCompletionMode,
  MissingPageRequirementsBrief,
  StudioWorldDesignRouteManifest,
} from '../types';

const COMPLEX_ROUTE_PATTERNS: Array<{ pattern: RegExp; mode: MissingPageCompletionMode }> = [
  { pattern: /build-a-wig|\/baw|customize|hair-analysis|transformation/i, mode: 'CREATIVE_COMPLEX' },
  { pattern: /mansion|lobby|lounge|slay-cam|immersive|room|desktop\//i, mode: 'CREATIVE_COMPLEX' },
  { pattern: /office|load-board|portal|dispatch|brokerage|bookkeeping|fleet|shipper|carrier|mechanic/i, mode: 'FUNCTIONAL_COMPLEX' },
  { pattern: /assessment|workflow|wizard|step|checkout|personaliz/i, mode: 'STRUCTURAL_COMPLEX' },
  { pattern: /admin\/studio|studio-os|genesis|world-compiler/i, mode: 'FUNCTIONAL_COMPLEX' },
];

const SIMPLE_ROUTE_PATTERNS: RegExp[] = [
  /forgot|reset-password|faq|contact|guide|support|help|privacy|terms|confirmation|thank-you|success/i,
  /sign-in|sign-up|login|account\/settings/i,
];

function familyIsImplemented(
  familyIds: string[],
  families: DesignFamilyRecord[],
): DesignFamilyRecord | undefined {
  for (const id of familyIds) {
    const family = families.find((f) => f.designFamilyId === id);
    if (family && family.representativeScreenId) return family;
  }
  return undefined;
}

export function classifyMissingPageCompletionMode(
  candidate: MissingPageCandidateRecord,
  manifest: StudioWorldDesignRouteManifest,
): MissingPageCompletionMode {
  const route = candidate.representativeRoute;
  const name = candidate.displayName;

  for (const { pattern, mode } of COMPLEX_ROUTE_PATTERNS) {
    if (pattern.test(route) || pattern.test(name)) return mode;
  }

  const families = manifest.designFamilies ?? [];
  const family = familyIsImplemented(candidate.designFamilyIds, families);
  const isSimplePattern = SIMPLE_ROUTE_PATTERNS.some((p) => p.test(route) || p.test(name));

  if (family && isSimplePattern) return 'FAMILY_DERIVED_SIMPLE';
  if (family && candidate.projectId === 'all-in-one-enterprise' && /service|about|contact|get-started/i.test(route)) {
    return 'FAMILY_DERIVED_SIMPLE';
  }
  if (family && candidate.projectId === 'frontal-slayer' && /account|auth|support|help/i.test(route)) {
    return 'FAMILY_DERIVED_SIMPLE';
  }
  if (family && candidate.projectId === 'studio-world' && /utility|settings|profile/i.test(route)) {
    return 'FAMILY_DERIVED_SIMPLE';
  }

  if (!family && isSimplePattern) return 'UNKNOWN_REVIEW_REQUIRED';
  if (family) return 'STRUCTURAL_COMPLEX';

  return 'UNKNOWN_REVIEW_REQUIRED';
}

export function isSimpleCompletionMode(mode: MissingPageCompletionMode): boolean {
  return mode === 'FAMILY_DERIVED_SIMPLE';
}

export function isComplexCompletionMode(mode: MissingPageCompletionMode): boolean {
  return mode !== 'FAMILY_DERIVED_SIMPLE' && mode !== 'UNKNOWN_REVIEW_REQUIRED';
}

export function buildMissingPageRequirementsBrief(
  candidate: MissingPageCandidateRecord,
  mode: MissingPageCompletionMode,
  manifest: StudioWorldDesignRouteManifest,
): MissingPageRequirementsBrief {
  const graph = manifest.dependencyGraphs?.find((g) => g.projectId === candidate.projectId);
  const deps =
    graph?.missingRequired
      ?.filter((m) => m.routePattern === candidate.representativeRoute)
      .flatMap((m) => m.requestedBy) ?? [];

  const creativeDirectionRequired =
    mode === 'CREATIVE_COMPLEX' || mode === 'UNKNOWN_REVIEW_REQUIRED';
  const functionalReviewRequired =
    mode === 'FUNCTIONAL_COMPLEX' || mode === 'STRUCTURAL_COMPLEX';

  return {
    candidateId: candidate.candidateId,
    projectId: candidate.projectId,
    displayName: candidate.displayName,
    route: candidate.representativeRoute,
    purpose: `Complete missing experience page: ${candidate.displayName}`,
    entryPoints: deps.length ? deps : ['dependency-graph'],
    exitPoints: ['TBD — derive from family shell'],
    requiredContent: creativeDirectionRequired
      ? ['CONTENT_REQUIRED — creative direction pending']
      : ['Reuse family shell content regions'],
    requiredActions: functionalReviewRequired ? ['Functional review required'] : ['Standard navigation'],
    requiredData: ['CONTENT_REQUIRED when business facts unavailable'],
    requiredStates: ['loading', 'error'],
    designFamilyIds: candidate.designFamilyIds,
    completionMode: mode,
    creativeDirectionRequired,
    functionalReviewRequired,
    dependencies: deps,
    contentBlocks: [
      {
        label: 'Page title',
        provenance: creativeDirectionRequired ? 'CONTENT_REQUIRED' : 'SOURCE_EXISTING_ROUTE',
      },
      {
        label: 'Body copy',
        provenance: 'CONTENT_REQUIRED',
        detail: 'No unsupported prices, shipping, membership, or legal claims',
      },
    ],
  };
}
