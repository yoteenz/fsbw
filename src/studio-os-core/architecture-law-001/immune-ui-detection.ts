import {
  AI_FORBIDDEN_PRODUCTION_UI_CATEGORIES,
  ARCHITECTURE_LAW_001_CODE,
  ARCHITECTURE_LAW_001_MESSAGE,
  ARCHITECTURE_LAW_001_VERSION,
  type ArchitectureLawValidationResult,
} from './contract';

export type RenderUiInspectionInput = {
  /** OCR or vision-detected text snippets from render inspection. */
  detectedText?: string[];
  /** Vision model labels (e.g. "text", "logo", "chart"). */
  detectedLabels?: string[];
  /** Explicit reviewer or automated flags. */
  reviewerFlags?: string[];
  /** Optional image URL for future vision pipeline — metadata only in v1. */
  artifactUrl?: string | null;
};

const READABLE_TEXT_PATTERN = /[a-zA-Z0-9]{2,}/;
const FORBIDDEN_LABEL_KEYWORDS = [
  'text',
  'typography',
  'word',
  'letter',
  'number',
  'caption',
  'logo',
  'icon',
  'menu',
  'chart',
  'graph',
  'breadcrumb',
  'notification',
  'badge',
  'button-label',
  'button label',
  'dashboard',
  'metric',
  'tooltip',
  'status-bar',
  'progress-bar',
  'brand-name',
  'company-name',
  'revision',
  'ui-element',
  'interface',
  'hud',
  'overlay-text',
] as const;

function normalizeToken(value: string): string {
  return value.trim().toLowerCase();
}

function collectTextViolations(detectedText: string[] | undefined): string[] {
  if (!detectedText?.length) return [];
  const violations: string[] = [];
  for (const snippet of detectedText) {
    const trimmed = snippet.trim();
    if (!trimmed) continue;
    if (READABLE_TEXT_PATTERN.test(trimmed)) {
      violations.push(`detected-text:${trimmed.slice(0, 48)}`);
    }
  }
  return violations;
}

function collectLabelViolations(detectedLabels: string[] | undefined): string[] {
  if (!detectedLabels?.length) return [];
  const violations: string[] = [];
  for (const label of detectedLabels) {
    const normalized = normalizeToken(label);
    for (const keyword of FORBIDDEN_LABEL_KEYWORDS) {
      if (normalized.includes(keyword)) {
        violations.push(`detected-label:${label}`);
        break;
      }
    }
    for (const category of AI_FORBIDDEN_PRODUCTION_UI_CATEGORIES) {
      if (normalized.includes(category.replace(/-/g, ' ')) || normalized.includes(category)) {
        violations.push(`forbidden-category:${category}`);
        break;
      }
    }
  }
  return violations;
}

function collectFlagViolations(reviewerFlags: string[] | undefined): string[] {
  if (!reviewerFlags?.length) return [];
  return reviewerFlags
    .filter((f) => normalizeToken(f).includes('ai_ui') || normalizeToken(f).includes('production-ui'))
    .map((f) => `reviewer-flag:${f}`);
}

/**
 * Immune System™ — Architecture Law #001 enforcement.
 * Reject renders containing AI-generated production interface elements.
 */
export function detectAiGeneratedProductionUi(input: RenderUiInspectionInput): ArchitectureLawValidationResult {
  const violations = [
    ...collectTextViolations(input.detectedText),
    ...collectLabelViolations(input.detectedLabels),
    ...collectFlagViolations(input.reviewerFlags),
  ];

  const unique = [...new Set(violations)];
  if (unique.length === 0) {
    return { ok: true, lawVersion: ARCHITECTURE_LAW_001_VERSION };
  }

  return {
    ok: false,
    code: ARCHITECTURE_LAW_001_CODE,
    message: ARCHITECTURE_LAW_001_MESSAGE,
    violations: unique,
  };
}

export function validateFounderRenderBeforeApproval(
  input: RenderUiInspectionInput
): ArchitectureLawValidationResult {
  return detectAiGeneratedProductionUi(input);
}
