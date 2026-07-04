/**
 * Photography Bible Prompt Compiler — placeholder substitution ONLY.
 * Validates locked template segments, not full-string equality against injected values.
 */

import {
  CREATIVE_DNA_APPROVED_PROMPT_BODY,
  CREATIVE_DNA_APPROVED_PROMPT_VERSION,
} from './CreativeDnaApprovedPrompt';

export const PHOTOGRAPHY_BIBLE_LOCKED_MASTER_TEMPLATE = CREATIVE_DNA_APPROVED_PROMPT_BODY;

export const PHOTOGRAPHY_BIBLE_PROMPT_VERSION = CREATIVE_DNA_APPROVED_PROMPT_VERSION;

export const CREATIVE_DNA_SPEC_VERSION = '1.0' as const;

/** Only these placeholders may change between units. */
export const PHOTOGRAPHY_BIBLE_PLACEHOLDERS = {
  unit_name: '{{unit_name}}',
  collection_number: '{{collection_number}}',
  texture: '{{texture}}',
  length: '{{length}}',
  density: '{{density}}',
  lace: '{{lace}}',
} as const;

export type PhotographyBiblePlaceholderKey = keyof typeof PHOTOGRAPHY_BIBLE_PLACEHOLDERS;

export type PhotographyBibleUnitVariables = {
  unitName: string;
  collectionNumber: string;
  texture: string;
  length: string;
  density: string;
  lace: string;
};

export type PhotographyBiblePromptValidation = {
  promptLocked: true;
  lockedTemplateHash: string;
  photographyBibleVersion: string;
  creativeDnaVersion: string;
  validatorStatus: 'passed' | 'failed';
  validatorMessage?: string;
  approvedPlaceholders: string[];
  variableInjectionSummary: string;
  injectedVariables: PhotographyBibleUnitVariables;
  lockedSectionsVerified: string[];
  finalPromptStatus: string;
  compiledPromptLength: number;
  lockedSectionViolation?: string;
};

const PLACEHOLDER_ORDER: Array<{ key: PhotographyBiblePlaceholderKey; label: string }> = [
  { key: 'unit_name', label: 'Unit Name' },
  { key: 'collection_number', label: 'Collection Number' },
  { key: 'texture', label: 'Texture' },
  { key: 'length', label: 'Length' },
  { key: 'density', label: 'Density' },
  { key: 'lace', label: 'Lace' },
];

export const PHOTOGRAPHY_BIBLE_LOCKED_SECTIONS = [
  'Camera',
  'Crop',
  'Framing',
  'Mannequin',
  'Proportions',
  'Lighting',
  'Logo placement',
  'Stand',
  'Background',
  'Composition',
  'Editorial style',
  'White space',
  'Photography language',
] as const;

const APPROVED_PLACEHOLDER_TOKENS = PLACEHOLDER_ORDER.map(({ key }) => PHOTOGRAPHY_BIBLE_PLACEHOLDERS[key]);

function unitVarsToRecord(vars: PhotographyBibleUnitVariables): Record<PhotographyBiblePlaceholderKey, string> {
  return {
    unit_name: vars.unitName.trim(),
    collection_number: vars.collectionNumber.trim(),
    texture: vars.texture.trim(),
    length: vars.length.trim(),
    density: vars.density.trim(),
    lace: vars.lace.trim(),
  };
}

function assertNonEmptyVariables(vars: PhotographyBibleUnitVariables): void {
  const record = unitVarsToRecord(vars);
  for (const { key, label } of PLACEHOLDER_ORDER) {
    if (!record[key]) {
      throw new Error(`Photography Bible variable "${label}" is required — cannot compile prompt`);
    }
  }
}

/** Deterministic FNV-1a hex hash — computed from locked template only. */
export function hashPhotographyBiblePrompt(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function hashLockedPhotographyBibleTemplate(
  masterTemplate: string = PHOTOGRAPHY_BIBLE_LOCKED_MASTER_TEMPLATE
): string {
  return hashPhotographyBiblePrompt(masterTemplate);
}

/** Split template into locked segments interleaved with placeholder positions. */
export function splitTemplateByPlaceholders(
  masterTemplate: string,
  tokens: readonly string[] = APPROVED_PLACEHOLDER_TOKENS
): string[] {
  const segments: string[] = [];
  let rest = masterTemplate;
  for (const token of tokens) {
    const idx = rest.indexOf(token);
    if (idx === -1) {
      throw new Error(`Photography Bible master template missing placeholder ${token}`);
    }
    segments.push(rest.slice(0, idx));
    rest = rest.slice(idx + token.length);
  }
  segments.push(rest);
  return segments;
}

/** Ensure template contains only the six approved placeholders. */
export function validateTemplatePlaceholdersOnly(
  masterTemplate: string = PHOTOGRAPHY_BIBLE_LOCKED_MASTER_TEMPLATE
): { ok: true } | { ok: false; error: string } {
  const found = masterTemplate.match(/\{\{[a-z0-9_]+\}\}/g) ?? [];
  const approved = new Set<string>(APPROVED_PLACEHOLDER_TOKENS);
  for (const token of found) {
    if (!approved.has(token)) {
      return {
        ok: false,
        error: `Photography Bible template contains unauthorized placeholder ${token}`,
      };
    }
  }
  for (const token of APPROVED_PLACEHOLDER_TOKENS) {
    if (!masterTemplate.includes(token)) {
      return {
        ok: false,
        error: `Photography Bible template missing required placeholder ${token}`,
      };
    }
  }
  return { ok: true };
}

/**
 * Validate assembled prompt by walking locked segments — never compare injected values against template literals.
 */
export function validateAssembledPromptLockedSections(
  assembled: string,
  variables: PhotographyBibleUnitVariables,
  masterTemplate: string = PHOTOGRAPHY_BIBLE_LOCKED_MASTER_TEMPLATE
): { ok: true } | { ok: false; error: string; lockedSectionViolation?: string } {
  const record = unitVarsToRecord(variables);
  let segments: string[];
  try {
    segments = splitTemplateByPlaceholders(masterTemplate, APPROVED_PLACEHOLDER_TOKENS);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }

  let pos = 0;
  for (let i = 0; i < APPROVED_PLACEHOLDER_TOKENS.length; i++) {
    const lockedSegment = segments[i];
    if (assembled.slice(pos, pos + lockedSegment.length) !== lockedSegment) {
      const snippet = lockedSegment.trim().slice(0, 72) || APPROVED_PLACEHOLDER_TOKENS[i];
      return {
        ok: false,
        error: `Locked section changed before ${APPROVED_PLACEHOLDER_TOKENS[i]}`,
        lockedSectionViolation: snippet,
      };
    }
    pos += lockedSegment.length;

    const { key } = PLACEHOLDER_ORDER[i];
    const injected = record[key];
    if (assembled.slice(pos, pos + injected.length) !== injected) {
      return {
        ok: false,
        error: `Failed to inject ${APPROVED_PLACEHOLDER_TOKENS[i]} — assembled prompt structure invalid`,
      };
    }
    pos += injected.length;
  }

  const tailSegment = segments[APPROVED_PLACEHOLDER_TOKENS.length];
  if (assembled.slice(pos) !== tailSegment) {
    const snippet = tailSegment.trim().slice(-72) || 'end of prompt';
    return {
      ok: false,
      error: 'Locked section changed at end of assembled prompt',
      lockedSectionViolation: snippet,
    };
  }

  return { ok: true };
}

/** @deprecated Use validateAssembledPromptLockedSections */
export function validateCompiledPromptAgainstMasterTemplate(
  compiled: string,
  masterTemplate: string,
  variables: PhotographyBibleUnitVariables
): { ok: true } | { ok: false; error: string } {
  return validateAssembledPromptLockedSections(compiled, variables, masterTemplate);
}

export function compilePhotographyBiblePrompt(
  variables: PhotographyBibleUnitVariables,
  masterTemplate: string = PHOTOGRAPHY_BIBLE_LOCKED_MASTER_TEMPLATE
): string {
  assertNonEmptyVariables(variables);
  const record = unitVarsToRecord(variables);

  const placeholderCheck = validateTemplatePlaceholdersOnly(masterTemplate);
  if (!placeholderCheck.ok) {
    throw new Error(placeholderCheck.error);
  }

  let compiled = masterTemplate;
  for (const { key } of PLACEHOLDER_ORDER) {
    const token = PHOTOGRAPHY_BIBLE_PLACEHOLDERS[key];
    compiled = compiled.split(token).join(record[key]);
  }

  if (/\{\{[a-z0-9_]+\}\}/.test(compiled)) {
    throw new Error('Compiled prompt contains unsubstituted placeholders — aborting');
  }

  const integrity = validateAssembledPromptLockedSections(compiled, variables, masterTemplate);
  if (!integrity.ok) {
    throw new Error(
      integrity.lockedSectionViolation
        ? `${integrity.error} · violation near "${integrity.lockedSectionViolation}"`
        : integrity.error
    );
  }

  return compiled;
}

export function validateCreativeDnaBeforeGeneration(opts?: {
  masterTemplate?: string;
  promptVersion?: string;
  creativeDnaVersion?: string;
}): { ok: true } | { ok: false; error: string } {
  const masterTemplate = opts?.masterTemplate ?? PHOTOGRAPHY_BIBLE_LOCKED_MASTER_TEMPLATE;
  const promptVersion = opts?.promptVersion ?? PHOTOGRAPHY_BIBLE_PROMPT_VERSION;
  const creativeDnaVersion = opts?.creativeDnaVersion ?? CREATIVE_DNA_SPEC_VERSION;

  if (promptVersion !== PHOTOGRAPHY_BIBLE_PROMPT_VERSION) {
    return {
      ok: false,
      error: `Creative DNA validation failed — expected Photography Bible prompt ${PHOTOGRAPHY_BIBLE_PROMPT_VERSION}, got ${promptVersion}`,
    };
  }
  if (creativeDnaVersion !== CREATIVE_DNA_SPEC_VERSION) {
    return {
      ok: false,
      error: `Creative DNA validation failed — expected v${CREATIVE_DNA_SPEC_VERSION}, got v${creativeDnaVersion}`,
    };
  }
  if (!masterTemplate.trim()) {
    return { ok: false, error: 'Creative DNA validation failed — Photography Bible master template is empty' };
  }

  return validateTemplatePlaceholdersOnly(masterTemplate);
}

export function buildPhotographyBiblePromptValidation(
  compiledPrompt: string,
  variables: PhotographyBibleUnitVariables,
  masterTemplate: string = PHOTOGRAPHY_BIBLE_LOCKED_MASTER_TEMPLATE,
  opts?: { validatorStatus?: 'passed' | 'failed'; validatorMessage?: string; lockedSectionViolation?: string }
): PhotographyBiblePromptValidation {
  const record = unitVarsToRecord(variables);
  const injectionParts = PLACEHOLDER_ORDER.map(({ key, label }) => `${label}=${record[key]}`);

  return {
    promptLocked: true,
    lockedTemplateHash: hashLockedPhotographyBibleTemplate(masterTemplate),
    photographyBibleVersion: PHOTOGRAPHY_BIBLE_PROMPT_VERSION,
    creativeDnaVersion: CREATIVE_DNA_SPEC_VERSION,
    validatorStatus: opts?.validatorStatus ?? 'passed',
    validatorMessage: opts?.validatorMessage,
    approvedPlaceholders: [...APPROVED_PLACEHOLDER_TOKENS],
    variableInjectionSummary: `${PLACEHOLDER_ORDER.length} approved variables injected · ${injectionParts.join(' · ')}`,
    injectedVariables: { ...variables },
    lockedSectionsVerified: [...PHOTOGRAPHY_BIBLE_LOCKED_SECTIONS],
    finalPromptStatus:
      opts?.validatorStatus === 'failed'
        ? 'validation failed — do not send to FAL'
        : 'locked sections unchanged · ready to generate',
    compiledPromptLength: compiledPrompt.length,
    lockedSectionViolation: opts?.lockedSectionViolation,
  };
}

export function compileAndValidatePhotographyBiblePrompt(
  variables: PhotographyBibleUnitVariables,
  masterTemplate: string = PHOTOGRAPHY_BIBLE_LOCKED_MASTER_TEMPLATE
): { compiledPrompt: string; validation: PhotographyBiblePromptValidation } {
  const dnaCheck = validateCreativeDnaBeforeGeneration({ masterTemplate });
  if (!dnaCheck.ok) {
    throw new Error(dnaCheck.error);
  }

  const compiledPrompt = compilePhotographyBiblePrompt(variables, masterTemplate);
  const validation = buildPhotographyBiblePromptValidation(compiledPrompt, variables, masterTemplate);
  return { compiledPrompt, validation };
}
