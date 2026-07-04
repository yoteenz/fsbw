/**
 * Photography Bible Prompt Compiler — placeholder substitution ONLY.
 * Creative DNA is an immutable specification; this module never rewrites prompt language.
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
  UNIT_NAME: '{{UNIT_NAME}}',
  COLLECTION_NUMBER: '{{COLLECTION_NUMBER}}',
  TEXTURE: '{{TEXTURE}}',
  LENGTH: '{{LENGTH}}',
  DENSITY: '{{DENSITY}}',
  LACE: '{{LACE}}',
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
  promptHash: string;
  masterTemplateHash: string;
  photographyBibleVersion: string;
  creativeDnaVersion: string;
  variableInjectionSummary: string;
  variablesChanged: string[];
  variablesRemainingLocked: string[];
  compiledPromptLength: number;
};

const PLACEHOLDER_ORDER: Array<{ key: PhotographyBiblePlaceholderKey; label: string }> = [
  { key: 'UNIT_NAME', label: 'Unit Name' },
  { key: 'COLLECTION_NUMBER', label: 'Collection Number' },
  { key: 'TEXTURE', label: 'Texture' },
  { key: 'LENGTH', label: 'Length' },
  { key: 'DENSITY', label: 'Density' },
  { key: 'LACE', label: 'Lace' },
];

/** Immutable locked sections — never modified by the compiler. */
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

function unitVarsToRecord(vars: PhotographyBibleUnitVariables): Record<PhotographyBiblePlaceholderKey, string> {
  return {
    UNIT_NAME: vars.unitName.trim(),
    COLLECTION_NUMBER: vars.collectionNumber.trim(),
    TEXTURE: vars.texture.trim(),
    LENGTH: vars.length.trim(),
    DENSITY: vars.density.trim(),
    LACE: vars.lace.trim(),
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

/** Deterministic FNV-1a hex hash (sync, identical on client and server). */
export function hashPhotographyBiblePrompt(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * Compile locked Photography Bible prompt — replaces approved placeholders only.
 * Never constructs, shortens, or rewrites prompt language.
 */
export function compilePhotographyBiblePrompt(
  variables: PhotographyBibleUnitVariables,
  masterTemplate: string = PHOTOGRAPHY_BIBLE_LOCKED_MASTER_TEMPLATE
): string {
  assertNonEmptyVariables(variables);
  const record = unitVarsToRecord(variables);

  let compiled = masterTemplate;
  for (const { key } of PLACEHOLDER_ORDER) {
    const token = PHOTOGRAPHY_BIBLE_PLACEHOLDERS[key];
    const value = record[key];
    if (!compiled.includes(token)) {
      throw new Error(`Photography Bible master template missing placeholder ${token}`);
    }
    compiled = compiled.split(token).join(value);
  }

  if (/\{\{[A-Z0-9_]+\}\}/.test(compiled)) {
    throw new Error('Compiled prompt contains unsubstituted placeholders — aborting');
  }

  const integrity = validateCompiledPromptAgainstMasterTemplate(compiled, masterTemplate, variables);
  if (!integrity.ok) {
    throw new Error(integrity.error);
  }

  return compiled;
}

export function validateCompiledPromptAgainstMasterTemplate(
  compiled: string,
  masterTemplate: string,
  variables: PhotographyBibleUnitVariables
): { ok: true } | { ok: false; error: string } {
  const record = unitVarsToRecord(variables);
  let reconstructed = compiled;

  for (const { key } of PLACEHOLDER_ORDER) {
    const token = PHOTOGRAPHY_BIBLE_PLACEHOLDERS[key];
    const value = record[key];
    if (!reconstructed.includes(value)) {
      return {
        ok: false,
        error: `Compiled prompt missing injected value for ${token} — prompt differs from approved Photography Bible`,
      };
    }
    reconstructed = reconstructed.split(value).join(token);
  }

  if (reconstructed !== masterTemplate) {
    return {
      ok: false,
      error:
        'Prompt differs from approved Photography Bible outside approved placeholders — generation aborted',
    };
  }

  return { ok: true };
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

  for (const { key } of PLACEHOLDER_ORDER) {
    const token = PHOTOGRAPHY_BIBLE_PLACEHOLDERS[key];
    if (!masterTemplate.includes(token)) {
      return {
        ok: false,
        error: `Creative DNA validation failed — master template missing required placeholder ${token}`,
      };
    }
  }

  return { ok: true };
}

export function buildPhotographyBiblePromptValidation(
  compiledPrompt: string,
  variables: PhotographyBibleUnitVariables,
  masterTemplate: string = PHOTOGRAPHY_BIBLE_LOCKED_MASTER_TEMPLATE
): PhotographyBiblePromptValidation {
  const record = unitVarsToRecord(variables);
  const variablesChanged = PLACEHOLDER_ORDER.map(({ key, label }) => `${label}=${record[key]}`);

  return {
    promptLocked: true,
    promptHash: hashPhotographyBiblePrompt(compiledPrompt),
    masterTemplateHash: hashPhotographyBiblePrompt(masterTemplate),
    photographyBibleVersion: PHOTOGRAPHY_BIBLE_PROMPT_VERSION,
    creativeDnaVersion: CREATIVE_DNA_SPEC_VERSION,
    variableInjectionSummary: `Placeholder substitution only · ${variablesChanged.join(' · ')}`,
    variablesChanged: PLACEHOLDER_ORDER.map(({ label }) => label),
    variablesRemainingLocked: [...PHOTOGRAPHY_BIBLE_LOCKED_SECTIONS],
    compiledPromptLength: compiledPrompt.length,
  };
}

/** Full compile + Creative DNA validation — call before every FAL request. */
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
