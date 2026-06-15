/**
 * Fal GPT Image 2 population prompts for hairstyle analysis templates.
 * Overall score % and match-rating stars are Fal in-image at petite pixel sizes (prompted).
 * TOP MATCH specs, MATCH 02–04 row values, every-detail-matters lines, client preview photo are Fal in-image.
 */

import {
  bawColorApplicationRulesBlock,
  bawUnitCatalogBlock,
  lookHairAccuracyLines,
  needsUniformRootRepaint,
  unitTexturePromptLine,
  unitTextureAppearanceLock,
} from './hairstyleAnalysisUnitCatalog.js';
import {
  bawStylingRefListBlock,
  stylingRefForLook,
  type HairstyleAnalysisStylingRef,
} from './hairstyleAnalysisBawStylingRefs.js';
import {
  bawHairlineRefListBlock,
  hairlineBindingPromptLine,
  hairlineShapeKeyFromManifest,
  hairlineShapePromptLine,
  noInventedBabyHairsBlock,
  type HairstyleAnalysisHairlineRef,
} from './hairstyleAnalysisBawHairlineRefs.js';
import { RATING_SLOT, TOP_SCORE_SLOT, type PixelRect } from './hairstyleAnalysisLayoutSlots.js';
import { matchRatingDecimalFalFontSize, matchRatingFalStarSize, overallScoreFalFontSize } from './hairstyleAnalysisTextPaths.js';
import { clientFullName, type MannequinRefIndex } from './hairstyleAnalysisMannequinRefs.js';
import {
  displayDensity,
  displayHairline,
  displayLength,
  displayLace,
  displayPart,
  displayStyle,
  formatScorePercent,
  formatMatchRatingDecimal,
  FREE_TOP_MATCH_PANEL_FOOTER,
  formatEdmPanelBuildSummary,
  matchRatingFilledStarsFromScore,
  EVERY_DETAIL_MATTERS_MAX_CHARS,
  partPlacementCompact,
  partPlacementPromptLine,
  lengthBodyPlacementCompact,
  lengthBodyPlacementPromptLine,
} from './hairstyleAnalysisDisplay.js';

import {
  everyDetailMattersRowGuide,
  formatEveryDetailMattersForFal,
  type EveryDetailMattersFaceFeatures,
} from './hairstyleAnalysisEveryDetailMatters.js';
import { isFreeLayoutHairstyleAnalysisTier } from './hairstyleAnalysisTierLayout.js';
import { consultInspoTemplateLockBlock } from './consultStyleAnalysisFalPrompt.js';

export type FalAnalysisLook = {
  rank: number;
  unit: string;
  color: string;
  hex: string;
  length: string;
  lace: string;
  density: string;
  hairline: string;
  part: string;
  styling: string;
  score: number;
  rating: number;
};

export type FalHairstyleAnalysis = {
  clientName: string;
  tier: 'free' | 'three_month' | 'six_month' | 'twelve_month' | 'black';
  topMatch: FalAnalysisLook;
  additionalLooks: FalAnalysisLook[];
  whyItWorks: string[];
  everyDetailFaceFeatures?: EveryDetailMattersFaceFeatures;
};

export type FalPromptImageRefs = {
  mannequinRefs: MannequinRefIndex[];
  stylingRefs: HairstyleAnalysisStylingRef[];
  hairlineRefs: HairstyleAnalysisHairlineRef[];
};

export type FalPromptBuildOptions = {
  /** @deprecated Fal always uses Covered By Your Grace for OVERALL SCORE — ignored. */
  overallScoreFontLabel?: string;
  /** IMAGE 2 already has TOP MATCH hair from upstream hair-only Fal step — template pass places it only. */
  clientPreviewPreEdited?: boolean;
  /** Wig consult — MATCH 02–04 are color-only variants of the inspo hairstyle on TOP MATCH. */
  consultInspoMode?: boolean;
  /** Fal prints TOP MATCH specs + panel footers in-image — skip server Sharp text overlay. */
  falInImageTextOnly?: boolean;
};

const BRAND_RED = '#EB1C24';
const MATCH_SCORE_GRAY = '#808080';
/** Free-tier MATCH RATING decimal above stars — gray Futura PT Book (stars stay red). */
const MATCH_RATING_DECIMAL_FONT = 'Futura PT Book';
/** Permanent OVERALL SCORE typography — red handwritten script (site brand accent). */
const OVERALL_SCORE_CANONICAL_FONT = 'Covered By Your Grace';

/** Fal GPT Image 2 `prompt` field hard limit (422 if exceeded). */
export const HAIRSTYLE_ANALYSIS_FAL_PROMPT_MAX_CHARS = 32_000;

function normalizeTier(tier: FalHairstyleAnalysis['tier']): Exclude<FalHairstyleAnalysis['tier'], 'black'> {
  return tier === 'black' ? 'twelve_month' : tier;
}

function mannequinIndexForUnit(refs: { mannequinRefs: MannequinRefIndex[] }, unit: string): number | null {
  const u = unit.trim().toUpperCase();
  const hit = refs.mannequinRefs.find((r) => r.unit === u);
  return hit?.imageIndex ?? null;
}

function mannequinRefLine(
  look: Pick<FalAnalysisLook, 'unit' | 'styling' | 'color' | 'hex'>,
  refs: { mannequinRefs: MannequinRefIndex[] }
): string {
  const idx = mannequinIndexForUnit(refs, look.unit);
  if (!idx) return '';
  const style = displayStyle(look.styling, look.unit);
  const unitKey = look.unit.trim().toUpperCase();
  const color = look.color.trim().toUpperCase();
  const hex = (look.hex || '#000000').toUpperCase();
  const textureLock = unitTextureAppearanceLock(look.unit);
  const noneStyleNote =
    unitKey === 'SOFT CURL'
      ? 'Copy **tight wave** strand pattern from that mannequin — elongated S-waves only, volume, and asymmetric shoulder sweep — **NOT** spiral curls or OCEAN CURL ringlets.'
      : unitKey === 'OCEAN CURL'
        ? 'Copy **tight curl** spiral pattern from that mannequin — springy ringlets, volume, and asymmetric shoulder sweep.'
        : 'Copy **hair** strand pattern, definition, volume, and asymmetric shoulder sweep from that mannequin — hair region only.';
  const shapeNote =
    style !== 'NONE'
      ? 'Mannequin = **hair-strand texture + hair-end drape direction only** (above the collarbone). Salon finish comes from the BAW styling reference IMAGE — not the mannequin default shape.'
      : noneStyleNote;
  const pigmentLock = needsUniformRootRepaint(color, look.unit)
    ? `PIGMENT LOCK: mannequin stock hair is black — use texture/drape only; repaint **all existing** strands ${color} (${hex}) root to tip — no dark roots.`
    : 'HAIRLINE LOCK: do NOT copy mannequin wispy edges or black frizz onto the client — clean lace-front edge only.';
  return [
    `Optional hair guide — IMAGE ${idx} (${look.unit} mannequin):`,
    shapeNote,
    textureLock ?? '',
    'NECK/BODY LOCK: mannequin = hair strands + drape only — keep IMAGE 2 neck/shoulders.',
    pigmentLock,
  ]
    .filter(Boolean)
    .join(' ');
}

function neckAndBodyPreservationBlock(): string {
  return [
    '=== NECK + SHOULDERS — CLIENT ANATOMY LOCK (CRITICAL) ===',
    'IMAGE 2 (client selfie) is the **only** source for neck, throat, collarbones, shoulders, and visible skin below the hairline.',
    'Hair edits apply in the **hair region only** (strands from crown/hairline down to hair ends).',
    '**Hair drape is an exception:** follow **asymmetric shoulder sweep** below — override symmetric **forward** both-shoulder curtain from IMAGE 2 if present; natural **back spill** behind one shoulder is fine.',
    'FORBIDDEN: elongating, slimming, or repainting the neck; mannequin neck geometry; pasted mannequin throat; warped collarbone; plastic neck skin; hair covering the neck unnaturally to hide edits.',
    'If a mannequin reference IMAGE is attached: use it for **hair strand texture and hair-end drape direction only** — never replace the client neck or shoulders.',
  ].join('\n');
}

/** Front portrait drape — asymmetric shoulder sweep (prompt-led; mannequin IMAGE optional). */
function asymmetricOneShoulderDrapeBlock(scope: 'all_photos' | 'thumbnails_only', hasMannequinRefs: boolean): string {
  const scopeLine =
    scope === 'all_photos'
      ? 'Applies to the **main client preview** AND **every MATCH 02–04 thumbnail** — same asymmetric drape geometry on all photos.'
      : '**MATCH 02–04 thumbnails only:** use the **same** asymmetric shoulder sweep as the main client preview — never revert to symmetric twin forward curtains.';

  const mannequinNote = hasMannequinRefs
    ? 'When a unit mannequin IMAGE is attached: borrow **hair-end drape direction** only — primary forward + back spill silhouette, not neck or shoulder anatomy.'
    : 'Follow these drape rules from the prompt — no mannequin IMAGE is attached for body geometry.';

  return [
    '=== HAIR DRAPE — ASYMMETRIC SHOULDER SWEEP (NOT SYMMETRIC TWIN CURTAIN) ===',
    scopeLine,
    'Long hair uses a **one-forward-shoulder drape** — only one side gets the forward chest cascade; the opposite side keeps visible hair **behind the shoulder / down the back**, not another forward curtain.',
    '**PRIMARY FRONT CASCADE:** visible length falls **forward over the model\'s LEFT shoulder** — **right side of the image** (viewer\'s right). This is the single chest cascade.',
    '**BACK + BEHIND PANEL (required):** keep a visible secondary mass sweeping **behind** the model\'s RIGHT shoulder and down the **upper back** — soft back panel / behind-shoulder fall. This prevents the hair from looking like 100% is piled on one shoulder.',
    '**CLEAR SHOULDER CAP:** on the model\'s **RIGHT shoulder** — **left side of the image** (viewer\'s left) — shoulder/collarbone skin stays mostly visible. Any hair on this side must read as behind-the-shoulder/back hair, with at most a few thin face-framing strands — **no thick forward chest curtain**.',
    '**FORBIDDEN:** symmetric **forward** twin waterfalls on **both** shoulders with equal heavy mass on both collarbones; mirror-image forward drapes; piling **all** hair forward on one shoulder with **zero** back/behind-shoulder hair.',
    '**Self-check failed if:** there is a forward hair curtain covering each collarbone, or if all hair is piled on the primary shoulder. **Correct if:** one forward chest cascade + one visible behind/back panel with the opposite shoulder mostly clear.',
    mannequinNote,
  ].join('\n');
}

function oneShoulderDrapeCompactLock(): string {
  return [
    'ONE-FORWARD-SHOULDER DRAPE: one forward chest cascade on viewer\'s RIGHT; viewer\'s LEFT shoulder stays mostly clear with visible hair routed behind shoulder/down the back — **FORBIDDEN** twin thick **forward** curtains and **FORBIDDEN** all hair forward with no back panel.',
  ].join(' ');
}

function clientPreviewTabLine(): string {
  return [
    'CLIENT PREVIEW TAB (white pill above main photo, rose icon on left):',
    'REPLACE the words "CLIENT PREVIEW" inside that pill with "TOP MATCH" — same pill shape, rose icon, border, and position.',
    'Paint over the old pill letters completely — **one crisp text layer only** (no offset duplicate, shadow echo, or red/black ghost copy).',
    'Do NOT add "TOP MATCH" as separate text below, above, beside, or floating over the portrait.',
    `Pill text: brand red ${BRAND_RED}, uppercase "TOP MATCH", bold sans-serif inside the pill only.`,
  ].join('\n');
}

function topMatchHeaderLine(fullName: string): string {
  return [
    '=== CLIENT NAME HEADER (ABOVE OVERALL SCORE PANEL) ===',
    'The template prints black uppercase "TOP MATCH" as a section header directly above the OVERALL SCORE / MATCH RATING panels on the right.',
    `REPLACE that black "TOP MATCH" header with "${fullName}" — the client's **full first and last name**, uppercase.`,
    `PRINT **EVERY WORD** of "${fullName}" — **never first name only**, never truncate after the first word.`,
    'Erase the old header letters first — **single clean text layer** (no double-print, ghost offset, or stacked duplicates).',
    `Use **medium gray ${MATCH_SCORE_GRAY}** Futura PT Medium — same size, weight, and letter-spacing as the original header; **only** the color is gray (not black or red).`,
    '**Center the client name horizontally within the frosted header panel** above OVERALL SCORE and MATCH RATING — equal padding left and right; do NOT left-align.',
    'Do NOT leave "TOP MATCH" visible in that header slot. Do NOT duplicate the client name in the red pill (pill stays "TOP MATCH" only).',
  ].join('\n');
}

function templateTextIntegrityBlock(): string {
  return [
    '=== TEMPLATE TEXT — NO GHOST / DUPLICATE LAYERS ===',
    'When replacing template words (pill, header, value slots): paint over old text fully, then print **one** crisp layer.',
    'FORBIDDEN: offset duplicate text (red/black echo), shadow stacks, semi-transparent ghost copies, or printing the same label twice.',
    'Keep "FRONTAL SLAYER" and "hairstyle analysis" header art from IMAGE 1 untouched — do not re-render, recolor, or duplicate them.',
  ].join('\n');
}

function colorValueLine(look: FalAnalysisLook): string {
  return `COLOR: ${look.color}`;
}

/** Hair-edit guidance only — hex guides retint; never print hex on template value fields. */
function colorHairGuidanceLine(look: FalAnalysisLook): string {
  return lookHairAccuracyLines(look).split('\n')[1] ?? '';
}

function styledHairLine(look: FalAnalysisLook, refs: FalPromptImageRefs): string {
  const style = displayStyle(look.styling, look.unit);
  const hex = (look.hex || '#000000').toUpperCase();
  const color = look.color.trim().toUpperCase();
  const uniformRetint = needsUniformRootRepaint(color, look.unit)
    ? `Repaint **all existing** hair ${color} (${hex}) root to tip — fully erase IMAGE 2 dark/black roots in the lace zone. `
    : '';
  if (style === 'NONE') {
    return refs.mannequinRefs.length > 0
      ? `${uniformRetint}Finish matching ${unitTexturePromptLine(look.unit)} Mannequin = strand direction/texture only — never copy black pigment or roots from mannequin.`
      : `${uniformRetint}${unitTexturePromptLine(look.unit)}`;
  }
  const stylingRef = stylingRefForLook(refs.stylingRefs, look.styling, look.part, look.unit);
  const textureLock = unitTextureAppearanceLock(look.unit);
  if (stylingRef) {
    return [
      `STYLE **${style}** — print exactly "${style}" in the STYLE value field (never substitute LAYERS unless STYLE is LAYERS or DEFINE).`,
      textureLock ?? unitTexturePromptLine(look.unit),
      `Hairstyle shape: copy **hair strands only** from IMAGE ${stylingRef.imageIndex} (BAW ${style} reference, ${stylingRef.part} part) — **never** copy head pose, profile angle, or neck rotation from that IMAGE.`,
      `Salon ref adjusts finish within the unit texture tier — never upgrade SOFT CURL to OCEAN CURL spirals or add waves to NOIR/BLANCO.`,
      `${uniformRetint || `Retint strands to uniform ${color} (${hex}) root to tip — no dark roots. `}Clean lace-front edge — no baby hairs on skin.`,
      'The styling reference IMAGE overrides the unit mannequin default finish — do NOT apply layered waves when STYLE is FLAT IRON or CRIMPS/WAND CURLS.',
      'Do not invent a different salon finish.',
    ].join(' ');
  }
  return `${uniformRetint}Apply BAW salon styling **${style}** only — print STYLE as "${style}"; do not default to LAYERS or invent a new curl/crimp/straight pattern.`;
}

function matchStylingManifestBlock(analysis: FalHairstyleAnalysis, refs: FalPromptImageRefs): string {
  if (isFreeLayoutHairstyleAnalysisTier(analysis.tier)) return '';

  const lines: string[] = ['=== ALL LOOKS — STYLE + HAIRLINE BINDING ==='];
  const allLooks = [analysis.topMatch, ...analysis.additionalLooks.slice(0, 3)];
  allLooks.forEach((look, i) => {
    const label = i === 0 ? 'TOP MATCH' : `MATCH ${String(i + 1).padStart(2, '0')}`;
    const style = displayStyle(look.styling, look.unit);
    const part = displayPart(look.part);
    const ref = stylingRefForLook(refs.stylingRefs, look.styling, look.part, look.unit);
    const refNote = ref ? `IMAGE ${ref.imageIndex}` : 'natural';
    const hlNote = hairlineBindingPromptLine(look.hairline, look.color, refs.hairlineRefs);
    lines.push(
      `${label}: STYLE ${style} PART ${part} | ${hlNote} | ${lengthBodyPlacementCompact(look.length)} | ${refNote}`
    );
  });
  return lines.join('\n');
}

function hairPartLockBlock(): string {
  return [
    '=== HAIR PART — ONE PART ONLY (ALL PHOTOS) ===',
    '**PART vs image (front portrait):** **image LEFT** / **image RIGHT** = toward that edge of the photo.',
    '**UI LEFT** part → visible groove on **image RIGHT** scalp. **UI RIGHT** part → groove on **image LEFT** scalp (mirror-opposite of UI LEFT).',
    'Each look: **exactly one** PART (MIDDLE, LEFT, or RIGHT) — erase IMAGE 2 part if it differs.',
    'Styling IMAGE = salon shape only — parting must match assigned PART for that look (use mirror rule above for LEFT/RIGHT).',
    'FORBIDDEN: dual part, ghost part, placing LEFT part on image LEFT, placing RIGHT part on image RIGHT, or borrowing a part line from another styling IMAGE.',
  ].join('\n');
}

function hairLengthBodyPlacementLockBlock(): string {
  return [
    '=== HAIR LENGTH — BODY PLACEMENT (ALL PHOTOS) ===',
    'Manifest **LENGTH** (inches) controls where hair **ends** terminate on the **client\'s visible body** — not just volume or strand count.',
    'Scale hair downward from crown/hairline so the **lowest hair ends** land at the anatomical landmark for that inch count (collarbone → waist → hip → thigh → knee).',
    '16" and shorter → **collarbone**; 17" → above waist; 18"–24" → **waist**; 25" → below waist; 26"–28" → **hip**; 29"–31" → upper thigh; 32"–33" → mid-thigh; 34"+ → **knee or lower**.',
    'Asymmetric shoulder drape still applies — primary forward cascade + back spill — but **overall vertical reach** must match manifest LENGTH.',
    'FORBIDDEN: every look the same length regardless of manifest; 16" hair ending at hip; 34" hair stopping at waist or hip.',
  ].join('\n');
}

function hairlineNaturalLockBlock(): string {
  return [
    '=== HAIRLINE LOCK — NATURAL ONLY (ALL LOOKS, BOTH TEMPLATES) ===',
    'Every TOP MATCH + MATCH row: HAIRLINE value **NATURAL** — smooth wide convex lace-front arc.',
    'Soft rounded center at the part (no center V); gentle temple curves; clean lace edge — **no baby hairs on skin**.',
    'FORBIDDEN: PEAK, LAGOS, LAGOS + PEAK, widow\'s peak, scalloped/M-W edge, Lagos bump, sharp center V.',
    'Do not use BAW PEAK/LAGOS mannequin hairline reference shapes on the client.',
  ].join('\n');
}

function uniformRootColorBlock(look: FalAnalysisLook, scope: 'preview' | 'thumbnail'): string {
  const color = look.color.trim().toUpperCase();
  const hex = (look.hex || '#000000').toUpperCase();
  if (!needsUniformRootRepaint(color, look.unit)) {
    if (color === 'JET BLACK' || color === 'OFF BLACK' || color === 'ESPRESSO') {
      return `COLOR ${color}: natural brunette/black depth on ${scope} — no fashion-color root band under a different body tone.`;
    }
    return `COLOR ${color}: strand-level recolor on ${scope} — natural depth within ${color} only.`;
  }
  return [
    `ROOT-TO-TIP LOCK (${scope}): ${color} (${hex}) — **one uniform pigment** crown, part line, lace zone, lengths, ends.`,
    `Fully repaint IMAGE 2 dark/black natural roots — they must **not** show through under ${color}.`,
    `Clean lace-front edge — **no baby hairs** on forehead/temple skin.`,
    `FORBIDDEN: dark roots, black roots, shadow root, ombré, dip-dye, two-tone regrowth, wispy edge fuzz.`,
  ].join(' ');
}

function matchColorRootManifestBlock(analysis: FalHairstyleAnalysis): string {
  if (isFreeLayoutHairstyleAnalysisTier(analysis.tier)) return '';

  const lines = ['=== COLOR ROOT REPAINT — PER LOOK ==='];
  const allLooks = [analysis.topMatch, ...analysis.additionalLooks.slice(0, 3)];
  allLooks.forEach((look, i) => {
    const label = i === 0 ? 'TOP MATCH' : `MATCH ${String(i + 1).padStart(2, '0')}`;
    const color = look.color.trim().toUpperCase();
    if (!needsUniformRootRepaint(color, look.unit)) {
      lines.push(`${label}: ${color} — natural depth only.`);
      return;
    }
    lines.push(`${label}: ${color} uniform root-tip — erase IMAGE 2 dark roots; no baby hairs.`);
  });
  return lines.join('\n');
}

function clientPhotoPanelRulesBlock(): string {
  return [
    '=== TOP MATCH CLIENT PHOTO — LEFT PANEL ===',
    'Place IMAGE 2 in the left-panel photo window: bg removed; 9:16 portrait; anchor subject low; symmetrical bottom fade; subtle mirror reflection (~10%) in lower panel.',
    'Edit **hair strands only** for TOP MATCH — face, skin, neck, clothing stay identical to IMAGE 2.',
    oneShoulderDrapeCompactLock(),
    'MATCH thumbnails: same face/pose as IMAGE 2; tighter square crop; **same** asymmetric drape; bg removed.',
  ].join('\n');
}

function clientPreviewHairLine(look: FalAnalysisLook, refs: FalPromptImageRefs): string {
  const style = displayStyle(look.styling, look.unit);
  return [
    '=== TOP MATCH HAIR (IMAGE 2) ===',
    'FACE LOCK: exact IMAGE 2 face and skin — change hair strands only.',
    oneShoulderDrapeCompactLock(),
    uniformRootColorBlock(look, 'preview'),
    lookHairAccuracyLines(look),
    styledHairLine(look, refs),
    hairlineBindingPromptLine(look.hairline, look.color, refs.hairlineRefs),
    mannequinRefLine(look, refs),
    lengthBodyPlacementPromptLine(look.length),
    `LOCK: ${partPlacementPromptLine(look.part)} STYLE ${style} finish in portrait.`,
  ]
    .filter(Boolean)
    .join('\n');
}

/** Upstream step — hair-only edit on raw selfie (IMAGE 1 only; no template or mannequin refs). */
export function buildClientPreviewHairOnlyPrompt(look: FalAnalysisLook, clientName: string): string {
  const name = clientName.trim().toUpperCase() || 'CLIENT';
  const style = displayStyle(look.styling, look.unit);
  return [
    `Edit IMAGE 1 — client selfie for ${name}. Output ONE photo-realistic portrait.`,
    '',
    '=== FACE IDENTITY LOCK (HIGHEST PRIORITY) ===',
    'IMAGE 1 is the real client — copy face pixels exactly: same eyes, nose, lips, cheeks, brows, skin tone, bone structure, expression, and age.',
    'Hair edits apply ONLY in the hair region — never regenerate, repaint, beautify, or alter facial skin.',
    '',
    asymmetricOneShoulderDrapeBlock('all_photos', false),
    '',
    '=== HAIR-ONLY EDIT (IMAGE 1) ===',
    'CHANGE **ONLY** the hair strands. KEEP exact face, skin, eyes, nose, lips, brows, expression, age, neck, shoulders, clothing, and camera angle from IMAGE 1.',
    '**Re-shape hair ends for one-forward-shoulder sweep** per rules above — single forward chest cascade on one side plus required natural **back/behind-shoulder spill** on the other — **override** symmetric **forward** both-shoulder curtains in IMAGE 1.',
    'NO wig cap. NO visible lace. NO different person. NO beauty filter. NO face slimming.',
    noInventedBabyHairsBlock(),
    oneShoulderDrapeCompactLock(),
    uniformRootColorBlock(look, 'preview'),
    lookHairAccuracyLines(look),
    hairlineShapePromptLine(look.hairline),
    partPlacementPromptLine(look.part),
    lengthBodyPlacementPromptLine(look.length),
    `LOCK: STYLE ${style}.`,
    '',
    'OUTPUT: the **same person** with TOP MATCH hair + **one-forward-shoulder drape** (single front cascade + visible back/behind-shoulder spill) — portrait ready for template placement.',
  ].join('\n');
}

/** Template pass when IMAGE 2 is already hair-edited — place client; preserve one-shoulder drape. */
function preEditedClientPanelBlock(): string {
  return [
    '=== IMAGE 2 — PRE-EDITED CLIENT (TOP MATCH HAIR + ASYMMETRIC DRAPE APPLIED) ===',
    'IMAGE 2 is the real client with TOP MATCH hair and **asymmetric shoulder drape** already rendered upstream.',
    '**Do not change face, skin, expression, or neck** on the main left-panel preview.',
    '**Preserve/uphold the one-forward-shoulder drape** — single front cascade on one shoulder + visible back/behind-shoulder spill — do **NOT** revert to symmetric twin **forward** curtains or pile 100% of hair forward with no back panel.',
    'Only: remove background, fit 9:16 in the photo window, bottom anchor, symmetrical bottom fade, subtle mirror reflection.',
  ].join('\n');
}

function clientPreviewPanelLine(
  look: FalAnalysisLook,
  refs: FalPromptImageRefs,
  promptOptions?: FalPromptBuildOptions
): string {
  if (promptOptions?.clientPreviewPreEdited) return preEditedClientPanelBlock();
  return clientPreviewHairLine(look, refs);
}

function sharedClientPhotoRulesBlock(): string {
  return clientPhotoPanelRulesBlock();
}

/** Face, pose, baby-hair, and drape locks — placed early in template rules so Fal obeys them before catalog refs. */
function criticalClientPhotoLocksBlock(refs: FalPromptImageRefs): string {
  return [
    faceIdentityLockBlock(),
    clientPoseLockBlock(),
    noInventedBabyHairsBlock(),
    asymmetricOneShoulderDrapeBlock('all_photos', refs.mannequinRefs.length > 0),
  ].join('\n\n');
}

function roseIconAndEdmPreservationBlock(): string {
  return [
    '=== EVERY DETAIL MATTERS — ROSE ICONS (CRITICAL) ===',
    'The "every detail matters" panel has **pre-rendered red rose outline icons** to the left of each text row — baked into IMAGE 1.',
    'ONLY print black uppercase text in the empty slot **to the right** of each existing rose — **never** redraw, replace, move, or cover the roses.',
    'FORBIDDEN beside EDM rows: sparkle icons, star icons, checkmarks, brain/AI icons, generic bullets, or "AI powered analysis" style icons.',
    'FORBIDDEN: inventing new bullet icons or swapping roses for any other icon type.',
    'The script "every detail matters" header is pre-rendered art — leave it untouched.',
  ].join('\n');
}

function faceIdentityLockBlock(): string {
  return [
    '=== FACE IDENTITY LOCK (HIGHEST PRIORITY — ALL CLIENT PHOTOS) ===',
    'IMAGE 2 is the real client selfie — TOP MATCH portrait + every MATCH thumbnail must show **that exact same person**.',
    'COPY IMAGE 2 face pixels exactly — same eyes, nose, lips, cheeks, brows, skin tone, bone structure, expression, and age.',
    'Hair edits apply ONLY in the hair region — never regenerate, repaint, beautify, smooth, slim, or alter facial skin.',
    'Mannequin, styling, and hairline reference IMAGEs = **hair geometry only** — their faces/necks/skin must **never** appear on the client.',
    'FORBIDDEN: face swap, different person, AI beauty filter, plastic skin, new makeup, or shrinking the face for hair volume.',
  ].join('\n');
}

function clientPoseLockBlock(): string {
  return [
    '=== HEAD + BODY POSE LOCK — IMAGE 2 IS MASTER (ALL PHOTOS) ===',
    'IMAGE 2 (client selfie) is the **only** source for head angle, neck rotation, shoulder line, gaze direction, and facial orientation.',
    'Applies to **TOP MATCH client preview** AND **every MATCH 02–04 thumbnail** — all must show the **same pose** as IMAGE 2.',
    '**Hair strand drape is separate from pose:** asymmetric shoulder-sweep rules **override** symmetric **forward** hair layout from IMAGE 2 — reposition ends only; do not rotate head or shoulders.',
    'BAW styling reference IMAGEs and unit mannequin IMAGEs are **hair strand finish only** — never copy their head yaw, profile angle, 3/4 turn, or body rotation onto the client.',
    'FORBIDDEN: profile or side-view thumbnails when IMAGE 2 is frontal; turning the client to match a styling ref; different head angles across MATCH 02 vs MATCH 03 vs MATCH 04.',
    'Self-check: every MORE MATCHES square must look like the **same client in the same pose** as IMAGE 2 — only hair color, texture, style, and **asymmetric drape** change.',
  ].join('\n');
}

function matchThumbnailBlock(label: string, look: FalAnalysisLook, refs: FalPromptImageRefs): string {
  const style = displayStyle(look.styling, look.unit);
  const ref = stylingRefForLook(refs.stylingRefs, look.styling, look.part, look.unit);
  const refNote = ref ? `styling IMAGE ${ref.imageIndex}` : 'natural texture';
  const hl = hairlineBindingPromptLine(look.hairline, look.color, refs.hairlineRefs);
  const color = look.color.trim().toUpperCase();
  const root = needsUniformRootRepaint(color, look.unit)
    ? `${color} uniform root-tip; no baby hairs`
    : color;
  return `${label} THUMB: **same IMAGE 2 face** + pose; ${look.unit} ${root} ${displayLength(look.length)}; ${lengthBodyPlacementCompact(look.length)}; STYLE ${style}; ${partPlacementCompact(look.part)} (${refNote}); ${displayDensity(look.density)}; ${hl}; ${oneShoulderDrapeCompactLock()}; no baby hairs on skin.`;
}

function everyDetailMattersRulesBlock(lineCount: number): string {
  const rowGuide = everyDetailMattersRowGuide(lineCount).join('; ');
  return [
    roseIconAndEdmPreservationBlock(),
    '',
    '=== EVERY DETAIL MATTERS — PRINT VERBATIM ===',
    `Fill ${lineCount} rose rows — one short black text line each to the **right** of the existing rose icon (max ${EVERY_DETAIL_MATTERS_MAX_CHARS} chars, no period/dash).`,
    `Row map: ${rowGuide}.`,
    'Print each EDM line below verbatim in rose-row order (top → bottom) — **text only** beside each rose; **no row numbers** (no 1. 2. 3. or EDM 1: prefixes).',
    'FORBIDDEN: empowerment fluff, lace melted, hairline natural, you deserve, queen, confidence, new bullet icons, numbered list prefixes.',
  ].join('\n');
}

function panelChromePreservationBlock(): string {
  return [
    '=== PANEL CHROME — PIXEL-PERFECT PRESERVATION (HIGHEST PRIORITY) ===',
    `IMAGE 1 includes frosted acrylic / glass panels with brand-red outer glow (${BRAND_RED}) on panel edges, inner glass highlights, borders, drop shadows, and marble backdrop.`,
    'PRESERVE the red glow halo around every panel — same intensity, softness, spread, and position as IMAGE 1. Never remove, dim, or repaint the glow.',
    'PRESERVE acrylic detailing: frosted translucency, glass edge highlight, inner frost blur, and panel depth — never flatten to matte white or gray boxes.',
    'PRESERVE marble texture behind and between panels — sharp, visible stone veining; do not blur, smear, or replace with flat color.',
    'DO NOT replace glossy translucent panels with flat white boxes, plain gray rectangles, or simplified UI.',
    'PRESERVE the red **BUILD THIS LOOK** CTA button at the bottom of IMAGE 1 — same size, position, white label, and marble backdrop. Never cover, erase, replace, or print footer summary text on that button.',
    'Photo window: cutout subject on marble — **background removed**, **9:16**, **bottom-anchored**, **symmetrical bottom fade**, **subtle mirror reflection** in the empty lower panel — not a full studio backdrop photo.',
    'ONLY edit inside: (a) client hair in the photo window, (b) empty value text slots next to labels, (c) erasing the tier subtitle per rules below.',
    'If panel chrome or red glow degrades, the output is wrong — prioritize preserving IMAGE 1 panel art over aggressive photo edits.',
  ].join('\n');
}


function filledStarCountFromOverallScore(score: number): number {
  return matchRatingFilledStarsFromScore(score);
}

/** Compact score + star rules — keep under Fal 32k prompt limit. */
function overallScoreAndRatingRules(
  look: FalAnalysisLook,
  tier: FalHairstyleAnalysis['tier']
): string {
  const scorePx = overallScoreFalFontSize(TOP_SCORE_SLOT);
  const ratingPx = matchRatingDecimalFalFontSize(RATING_SLOT);
  const starPx = matchRatingFalStarSize(RATING_SLOT);
  const filled = filledStarCountFromOverallScore(look.score);
  const scorePct = formatScorePercent(look.score);
  const tierKey = normalizeTier(tier);
  const fillRule =
    filled === 5 ? 'Fill all 5 stars left → right.' : 'Fill left 4 only; star 5 empty outline.';

  const overallScoreLine = `OVERALL SCORE: erase placeholder %; print ${scorePct} in ${OVERALL_SCORE_CANONICAL_FONT} red ${BRAND_RED} script (~${scorePx}px max height, centered, wide padding). Digits + % same script.`;

  if (isFreeLayoutHairstyleAnalysisTier(tierKey)) {
    const ratingLabel = formatMatchRatingDecimal(look.rating);
    return [
      '=== OVERALL SCORE + MATCH RATING (FREE TIER — VERTICALLY CENTERED) ===',
      `OVERALL SCORE (FREE): erase placeholder %; print ${scorePct} in ${OVERALL_SCORE_CANONICAL_FONT} red ${BRAND_RED} script (~${scorePx}px max height). **Vertically and horizontally centered** in the OVERALL SCORE value box — equal frosted padding above and below; do NOT sit high in the upper half.`,
      `MATCH RATING (FREE ONLY): erase placeholder; print **${ratingLabel}** above 5 stars as **one vertically centered stack** in the MATCH RATING value box — **${MATCH_RATING_DECIMAL_FONT}** gray ${MATCH_SCORE_GRAY} (~${ratingPx}px max height) for the decimal, centered horizontally; petite red embossed stars (~${starPx}px each) directly below with a small gap. **Equal space above the decimal and below the stars** — not upper-third / lower-half layout.`,
      `MATCH RATING STARS: ${fillRule} Embossed radial pink-coral → ${BRAND_RED} fill; dark-red stroke; empty = outline only. **Stars stay red.**`,
      `FORBIDDEN: billboard score/rating numbers, chunky/emoji stars, gray or sans-serif OVERALL SCORE %, red or script styling on MATCH RATING decimal (${ratingLabel} = gray ${MATCH_RATING_DECIMAL_FONT} only), top-aligned score or rating clusters.`,
    ].join('\n');
  }

  const starErase = `Erase large template star glyphs; draw 5 new petite stars (~${starPx}px max each) **centered** in the MATCH RATING value box.`;
  return [
    '=== OVERALL SCORE + MATCH RATING (PETITE IN-IMAGE — PREMIUM) ===',
    overallScoreLine,
    'MATCH RATING (PREMIUM): **stars only** — do **NOT** print a decimal score (no 5.0, 4.7, etc.) above or beside the stars.',
    `MATCH RATING STARS: ${fillRule} ${starErase} Embossed radial pink-coral → ${BRAND_RED} fill; dark-red stroke; empty = outline only.`,
    'FORBIDDEN on premium MATCH RATING: decimal rating text, billboard stars, chunky/emoji stars.',
    'FORBIDDEN on OVERALL SCORE: gray or sans-serif styling.',
  ].join('\n');
}

function matchRowScoreIsolationBlock(): string {
  return [
    '=== MATCH 02–04 GRAY SCORE % — SEPARATE FROM OVERALL SCORE ===',
    `MATCH SCORE % only: gray ${MATCH_SCORE_GRAY}, small Futura PT Medium — never black or red overall-score styling.`,
    'Print TEXTURE, COLOR, LENGTH black + gray MATCH SCORE % in each row value slot.',
  ].join('\n');
}

function matchRowValuesFalRules(): string {
  return [
    matchRowScoreIsolationBlock(),
    '',
    '=== MATCH 02–04 VALUE SLOTS — PRINT IN TEMPLATE (FAL IN-IMAGE) ===',
    'For MATCH 02, MATCH 03, and MATCH 04: print TEXTURE, COLOR, and LENGTH in black uppercase Futura PT Medium in each value area beside the pre-printed labels.',
    `MATCH SCORE value slot: gray percentage only (${MATCH_SCORE_GRAY}) — digits + % suffix, small Futura PT Medium on the MATCH SCORE labeled line for that row.`,
    'Labels (TEXTURE:, COLOR:, LENGTH:, MATCH SCORE:) are pre-printed on the template — do not duplicate labels; fill only the empty value slots.',
    'Keep each value aligned with its own label on the same horizontal line — do not stack all four values on one line or move scores to another panel.',
  ].join('\n');
}

function matchScoreManifestBlock(analysis: FalHairstyleAnalysis): string {
  if (isFreeLayoutHairstyleAnalysisTier(analysis.tier)) return '';

  const lines: string[] = [
    '=== MATCH 02–04 ROW VALUES — PRINT EXACTLY IN VALUE SLOTS ===',
    `TEXTURE, COLOR, LENGTH = black Futura PT Medium. MATCH SCORE % = gray ${MATCH_SCORE_GRAY} only — never black.`,
  ];

  analysis.additionalLooks.slice(0, 3).forEach((look, i) => {
    const label = `MATCH ${String(i + 2).padStart(2, '0')}`;
    lines.push(
      `${label}: TEXTURE ${look.unit.trim().toUpperCase()}, COLOR ${look.color.trim().toUpperCase()}, LENGTH ${displayLength(look.length)} (all black).`,
      `${label} MATCH SCORE: ${formatScorePercent(look.score)} — paint gray ${MATCH_SCORE_GRAY} (NOT black).`
    );
  });

  return lines.join('\n');
}

function panelFooterPlainTextRules(): string {
  return [
    '=== PANEL FOOTER TEXT — PLAIN ONLY (NO BORDERS) ===',
    'TOP MATCH specs-locked line and every-detail-matters build summary are **plain centered text** on the existing frosted panel — **not** buttons, badges, pills, ribbons, or outlined boxes.',
    '**FORBIDDEN:** red border, black border, white fill box, rectangle outline, stroke frame, or button chrome around either footer line.',
    'Do **NOT** mimic the BUILD THIS LOOK CTA style for footer text — no border, no pill, no label background.',
    'If the template shows an empty bordered placeholder in a footer slot: **erase the border/rectangle completely** and print text directly on the frosted panel.',
  ].join('\n');
}

function freeTierPanelFooterBlock(top: FalAnalysisLook, falInImageTextOnly = false): string {
  const edmSummary = formatEdmPanelBuildSummary(top.unit, top.color, top.length);
  return [
    panelFooterPlainTextRules(),
    '',
    '=== FREE TIER — PANEL FOOTERS (CENTERED PLAIN TEXT) ===',
    `TOP MATCH panel bottom (centered below spec column): print **${FREE_TOP_MATCH_PANEL_FOOTER}** — Futura PT Medium **black** (#1a1a1a), uppercase, centered, **no border or box**.`,
    falInImageTextOnly
      ? `EVERY DETAIL MATTERS build summary: print **${edmSummary}** — centered **gray #808080** Futura PT Medium below the last rose row, above BUILD THIS LOOK. One line, full string including middle dot separators.`
      : 'EVERY DETAIL MATTERS build summary (gray UNIT · XX" · COLOR ribbon): **LEAVE COMPLETELY BLANK** — server composites it below the last rose row, above BUILD THIS LOOK. Do **NOT** paint gray build summary text anywhere on the card.',
    '**FORBIDDEN:** gray UNIT · LENGTH · COLOR ribbon between the TOP MATCH spec panel and the "every detail matters" header; split fragments under the client photo or spec column; truncated length (e.g. "3" instead of "34\\"").',
    'The BUILD THIS LOOK button at the card bottom is template chrome — leave it untouched; never print footer summary text on that button.',
    'Panel footers are separate from rose rows and spec values — do not merge into EDM bullets.',
  ].join('\n');
}

function freeTierOnlyBlock(): string {
  return [
    '=== FREE TIER — TOP MATCH ONLY (CRITICAL) ===',
    'This card is the FREE hairstyle analysis template — exactly ONE look (TOP MATCH).',
    'DO NOT create MATCH 02, MATCH 03, MATCH 04, or any additional-match rows.',
    'DO NOT add portfolio thumbnails, horizontal thumbnail strips, alternative grids, or extra gray match-score percentages.',
    'DO NOT populate "MORE MATCHES" or any comparison section — the free card has no additional matches.',
    'ONLY fill: client preview photo, TOP MATCH panel footer (black specs-locked line only), EVERY DETAIL MATTERS text rows, OVERALL SCORE %, MATCH RATING decimal + stars.',
    'Leave all other template areas unchanged — marble/panel chrome only; never invent extra hairstyle comparisons.',
  ].join('\n');
}

function additionalMatchTemplateRules(hasMannequinRefs: boolean): string[] {
  const mannequinLine = hasMannequinRefs
    ? 'Mannequin IMAGEs = hair texture + drape only — salon finish from styling IMAGE when STYLE is not NONE.'
    : 'One-shoulder drape from prompt — preserve IMAGE 2 neck/shoulders.';

  return [
    '=== MATCH 02–04 THUMBNAILS ===',
    'Same client face + pose as IMAGE 2; different unit/color/length/styling per manifest; one PART + manifest HAIRLINE + **LENGTH body placement** per thumb.',
    oneShoulderDrapeCompactLock(),
    mannequinLine,
    'NEVER: back-of-head stock, different people, symmetric both-shoulder hair.',
    'Row values: black Futura PT Medium; MATCH SCORE % gray #808080 only.',
  ];
}

function consultInspoRulesForPrompt(promptOptions?: FalPromptBuildOptions): string[] {
  if (!promptOptions?.consultInspoMode) return [];
  return ['', consultInspoTemplateLockBlock(), ''];
}

function buildTemplateRules(
  refs: FalPromptImageRefs,
  analysis: FalHairstyleAnalysis,
  promptOptions?: FalPromptBuildOptions
): string {
  const tierKey = normalizeTier(analysis.tier);
  const hasMannequinRefs = refs.mannequinRefs.length > 0;
  const mannequinList = hasMannequinRefs
    ? refs.mannequinRefs
        .map(
          (r) =>
            `IMAGE ${r.imageIndex} = ${r.unit} mannequin front (**hair strands + hair-end drape only** — never copy neck/shoulders)`
        )
        .join('\n')
    : '';

  const photoRules = [sharedClientPhotoRulesBlock()];

  return [
    '=== TEMPLATE (IMAGE 1) — DO NOT ALTER LAYOUT ===',
    'USE THE FIRST UPLOADED IMAGE AS THE EXACT STATIC TEMPLATE BACKGROUND.',
    'DO NOT REDESIGN THE CARD, MOVE PANELS, CROP, OR ALTER THE MARBLE BACKGROUND.',
    'ALL SECTION TITLES, BORDERS, FOOTER ICONS, AND LABELS (TEXTURE:, COLOR:, etc.) ARE ALREADY ON THE TEMPLATE — LEAVE THEM UNTOUCHED.',
    'ONLY FILL EMPTY VALUE AREAS NEXT TO EXISTING LABELS. DO NOT DUPLICATE LABELS OR ICONS.',
    'COLOR value fields: color name only (e.g. JET BLACK) — never print hex codes, # symbols, or parenthetical color notes.',
    '',
    panelChromePreservationBlock(),
    '',
    templateTextIntegrityBlock(),
    '',
    criticalClientPhotoLocksBlock(refs),
    '',
    '=== REMOVE TIER / SUBSCRIPTION LABEL (CRITICAL) ===',
    'The template may include a subtitle such as "FREE HAIRSTYLE ANALYSIS", "3 MONTH HAIRSTYLE ANALYSIS",',
    '"6 MONTH HAIRSTYLE ANALYSIS", or "12 MONTH HAIRSTYLE ANALYSIS" below the main header.',
    'ERASE that tier/subscription subtitle completely — paint over with clean marble background matching the template.',
    'The client must NOT see any tier name, month count, or analysis type. Keep "FRONTAL SLAYER" and "hairstyle analysis" header art only.',
    '',
    bawHairlineRefListBlock(refs.hairlineRefs),
    hairlineNaturalLockBlock(),
    '',
    ...(isFreeLayoutHairstyleAnalysisTier(tierKey) ? [neckAndBodyPreservationBlock(), ''] : []),
    bawUnitCatalogBlock(),
    '',
    bawColorApplicationRulesBlock(),
    '',
    hairPartLockBlock(),
    '',
    hairLengthBodyPlacementLockBlock(),
    '',
    '=== ROSE ICONS — PIXEL-PERFECT PRESERVATION (CRITICAL) ===',
    'EVERY RED ROSE ICON ON THE TEMPLATE IS PRE-RENDERED ART — DO NOT REDRAW, REGENERATE, STRETCH, BLUR, OR REPLACE ANY ROSE.',
    'DO NOT ADD NEW ROSE ICONS OR SWAP ROSES FOR SPARKLE / AI / CHECKMARK BULLETS.',
    '',
    overallScoreAndRatingRules(analysis.topMatch, analysis.tier),
    '',
    mannequinList,
    '',
    bawStylingRefListBlock(refs.stylingRefs),
    '',
    '=== SALON STYLING — BAW REFERENCES ONLY (NO INVENTED STYLES) ===',
    'When STYLE is LAYERS, CRIMPS, FLAT IRON, DEFINE, or WAND CURLS: copy hairstyle shape from the matching BAW styling reference IMAGE.',
    'Retint hair to the look catalog color (hex in hair-edit instructions) — do not create new curl, crimp, or straight patterns.',
    '',
    ...(isFreeLayoutHairstyleAnalysisTier(tierKey) ? [freeTierOnlyBlock(), '', freeTierPanelFooterBlock(analysis.topMatch, promptOptions?.falInImageTextOnly === true), ''] : [matchRowValuesFalRules(), '', ...additionalMatchTemplateRules(hasMannequinRefs)]),
    topMatchSpecManifestBlock(analysis.topMatch, refs, promptOptions),
    '',
    ...photoRules,
    '',
    ...(isFreeLayoutHairstyleAnalysisTier(tierKey)
      ? [
          promptOptions?.falInImageTextOnly
            ? 'TOP MATCH spec values + panel footers: **Fal in-image** (black specs, gray EDM build summary) — no server overlay.'
            : 'TOP MATCH spec values: server overlay (petite black Futura) — Fal leaves value slots blank.',
          promptOptions?.falInImageTextOnly
            ? 'TOP MATCH panel footer + gray every-detail-matters build summary: **print in-image** (Fal).'
            : 'TOP MATCH panel footer: centered black Futura PT Medium, plain text only (no border); every-detail-matters build summary: **leave blank** (server-composited gray ribbon above BUILD THIS LOOK — Fal must not print it).',
          'FREE TIER: no match-row scores, no additional-match thumbnails, no portfolio strip.',
        ]
      : []),
    '',
    isFreeLayoutHairstyleAnalysisTier(tierKey)
      ? promptOptions?.falInImageTextOnly
        ? 'OUTPUT ONE COMPLETE FREE-TIER CARD AT 4:5 PORTRAIT — TOP MATCH photo + **Fal-printed** spec values + panel footers + every detail matters; overall score % + MATCH RATING decimal + stars printed in-image at petite sizes.'
        : 'OUTPUT ONE COMPLETE FREE-TIER CARD AT 4:5 PORTRAIT — TOP MATCH photo + panel footers + every detail matters; overall score % + MATCH RATING decimal + stars printed in-image at petite sizes. TOP MATCH spec values = server overlay.'
      : promptOptions?.falInImageTextOnly
        ? 'OUTPUT ONE COMPLETE FINISHED CARD AT 4:5 PORTRAIT — **all** TOP MATCH spec values + MATCH 02–04 row values + every detail matters **Fal in-image**; thumbnails in-image; overall score % + MATCH RATING **stars only** (no decimal above stars) printed in-image at petite sizes.'
        : 'OUTPUT ONE COMPLETE FINISHED CARD AT 4:5 PORTRAIT — MATCH 02–04 row values (gray score %) + every detail matters in-image; TOP MATCH spec values = server overlay; thumbnails in-image; overall score % + MATCH RATING **stars only** (no decimal above stars) printed in-image at petite sizes.',
  ]
    .filter(Boolean)
    .join('\n');
}

function topMatchSpecFalInImageBlock(look: FalAnalysisLook, refs: FalPromptImageRefs): string {
  const style = displayStyle(look.styling, look.unit);
  const part = displayPart(look.part);
  const hairline = displayHairline(look.hairline);
  const hlBinding = hairlineBindingPromptLine(look.hairline, look.color, refs.hairlineRefs);
  const color = look.color.trim().toUpperCase();
  const hex = (look.hex || '#000000').toUpperCase();
  const colorLock = needsUniformRootRepaint(color, look.unit)
    ? `COLOR ${color} (${hex}) uniform root-to-tip — erase IMAGE 2 dark roots; clean edge, no baby hairs;`
    : '';
  return [
    '=== TOP MATCH SPEC COLUMN — PRINT VALUES IN TEMPLATE (FAL IN-IMAGE) ===',
    'Print all eight TOP MATCH spec **values** in **black uppercase Futura PT Medium** in each value slot beside the pre-printed labels.',
    'Erase template placeholder catalog text (NOIR, JET BLACK, LAYERS, 13X6 HD, etc.) before printing manifest values.',
    'Labels (TEXTURE:, COLOR:, LENGTH:, LACE:, DENSITY:, PART:, HAIRLINE:, STYLE:) are pre-printed — do not duplicate labels.',
    'Keep each value aligned with its own label on the same horizontal line.',
    `TEXTURE: ${look.unit.trim().toUpperCase()}`,
    `COLOR: ${color} (name only — no hex)`,
    `LENGTH: ${displayLength(look.length)}`,
    `LACE: ${displayLace(look.lace)}`,
    `DENSITY: ${displayDensity(look.density)}`,
    `PART: ${part}`,
    `HAIRLINE: ${hairline}`,
    `STYLE: ${style}`,
  ].join('\n');
}

function topMatchSpecManifestBlock(
  look: FalAnalysisLook,
  refs: FalPromptImageRefs,
  promptOptions?: FalPromptBuildOptions
): string {
  const style = displayStyle(look.styling, look.unit);
  const part = displayPart(look.part);
  const hairline = displayHairline(look.hairline);
  const hlBinding = hairlineBindingPromptLine(look.hairline, look.color, refs.hairlineRefs);
  const color = look.color.trim().toUpperCase();
  const hex = (look.hex || '#000000').toUpperCase();
  const colorLock = needsUniformRootRepaint(color, look.unit)
    ? `COLOR ${color} (${hex}) uniform root-to-tip — erase IMAGE 2 dark roots; clean edge, no baby hairs;`
    : '';

  const specValuesBlock = promptOptions?.falInImageTextOnly
    ? topMatchSpecFalInImageBlock(look, refs)
    : [
        '=== TOP MATCH SPEC COLUMN — VALUE SLOTS BLANK (SERVER OVERLAY) ===',
        'Leave all eight TOP MATCH spec **value slots** empty — server composites **extra petite** black Futura PT Medium text aligned with each label (~26% of slot height, max ~14px).',
        'Erase template placeholder catalog text (NOIR, JET BLACK, LAYERS, 13X6 HD, etc.) — paint clean frosted panel only in each value slot.',
        'Pre-printed labels (TEXTURE:, COLOR:, LENGTH:, etc.) stay untouched — do not duplicate labels or print values in-image.',
        '**FORBIDDEN:** printing unit/color/length ribbon text between OVERALL SCORE / MATCH RATING and the spec column; any build-summary fragments in the right panel mid-zone.',
      ].join('\n');

  const valueSlotRule = promptOptions?.falInImageTextOnly
    ? 'value slots must show manifest text in-image (black Futura) — do not leave blank'
    : 'value slot text is server-added';

  return [
    specValuesBlock,
    '',
    '=== TOP MATCH MANIFEST (PHOTO + EDM SYNC) ===',
    `MANIFEST — TEXTURE: ${look.unit.trim().toUpperCase()}`,
    `MANIFEST — COLOR: ${look.color.trim().toUpperCase()}`,
    `MANIFEST — LENGTH: ${displayLength(look.length)}`,
    `MANIFEST — LACE: ${displayLace(look.lace)}`,
    `MANIFEST — DENSITY: ${displayDensity(look.density)}`,
    `MANIFEST — PART: ${part}`,
    `MANIFEST — HAIRLINE: ${hairline}`,
    `MANIFEST — STYLE: ${style}`,
    `PHOTO↔SPEC LOCK: TOP MATCH portrait must match manifest — ${colorLock} ${lengthBodyPlacementPromptLine(look.length)}; ${partPlacementPromptLine(look.part)}; ${hlBinding}; STYLE ${style} (${style === 'NONE' ? 'natural texture only' : `BAW ${style} ref shape`}); ${oneShoulderDrapeCompactLock()}.`,
    `FORBIDDEN: template placeholder defaults; wrong part side (LEFT on image LEFT or RIGHT on image RIGHT); wrong length body placement (e.g. 16" at hip, 34" at waist); PEAK/LAGOS/Lagos+Peak hairline shapes (NATURAL only); baby hairs on skin; symmetric both-shoulder drape; STYLE LAYERS when manifest is NONE.`,
    `STYLE manifest is "${style}" — hair photo must match; ${valueSlotRule}.`,
  ].join('\n');
}

function appendEveryDetailMattersLines(
  lines: string[],
  analysis: FalHairstyleAnalysis
): void {
  if (analysis.whyItWorks.length === 0) return;
  lines.push('');
  lines.push(everyDetailMattersRulesBlock(analysis.whyItWorks.length));
  lines.push(
    'TOP MATCH spec column and every-detail-matters bullets must stay **in sync** — if manifest says SOFT WAVE + CHERRY, bullets must say SOFT WAVE + CHERRY, not NOIR + JET BLACK.'
  );
  formatEveryDetailMattersForFal(analysis.whyItWorks).forEach((line) => {
    lines.push(line);
  });
}

function freePromptFooter(analysis: FalHairstyleAnalysis, falInImageTextOnly = false): string {
  const top = analysis.topMatch;
  const color = top.color.trim().toUpperCase();
  const hex = (top.hex || '#000000').toUpperCase();
  const edmSummary = formatEdmPanelBuildSummary(top.unit, top.color, top.length);
  const rootCheck = needsUniformRootRepaint(color, top.unit)
    ? `${color} (${hex}) uniform root-to-tip — fully erase IMAGE 2 dark/black roots. Clean lace-front edge — no baby hairs on skin.`
    : '';
  return [
    '',
    '=== FINAL CHECK ===',
    'PILL: red uppercase "TOP MATCH" replaces "CLIENT PREVIEW" inside the tab only.',
    'HEADER: client first + last name replaces "TOP MATCH" above overall score panel — **centered**, **gray #808080** Futura PT Medium (not red).',
    'CARD TOP: keep "FRONTAL SLAYER" + script "hairstyle analysis" from IMAGE 1 untouched (gray subtitle — do not recolor red).',
    falInImageTextOnly
      ? `TOP MATCH spec column: print all eight manifest values in-image (black Futura). Centered **black** specs-locked footer **${FREE_TOP_MATCH_PANEL_FOOTER}**. Gray EDM build summary **${edmSummary}** below last rose row. BUILD THIS LOOK CTA preserved from IMAGE 1; OVERALL SCORE % (red script) + MATCH RATING decimal in **gray Futura PT Medium** above **red** stars.`
      : 'TOP MATCH spec column values are server-added — Fal leaves value slots blank; centered **black** specs-locked footer only (gray UNIT · LENGTH · COLOR build summary is server-added — **leave blank**); BUILD THIS LOOK CTA preserved from IMAGE 1; OVERALL SCORE % (red script) + MATCH RATING decimal in **gray Futura PT Medium** above **red** stars — **free tier only**.',
    falInImageTextOnly
      ? 'TOP MATCH spec column + gray build summary must match MANIFEST exactly — all Fal-printed in-image.'
      : 'TOP MATCH spec column must match the MANIFEST exactly — value slot text is server-added, not Fal-printed.',
    'Every-detail-matters bullets must match the same manifest values as the spec column — print each line verbatim (text only, no 1. 2. 3. prefixes), not empowerment fluff.',
    oneShoulderDrapeCompactLock(),
    rootCheck,
    'FACE: same person as IMAGE 2 on main photo + every MATCH thumb — never mannequin/styling/hairline ref faces.',
    'EDM: original red rose icons from IMAGE 1 — text only beside each rose; no row numbers; no AI/sparkle/checkmark bullets.',
  ]
    .filter(Boolean)
    .join('\n');
}

function freePrompt(
  analysis: FalHairstyleAnalysis,
  refs: FalPromptImageRefs,
  promptOptions?: FalPromptBuildOptions
): string {
  const top = analysis.topMatch;
  const fullName = clientFullName(analysis.clientName);
  const lines = [
    buildTemplateRules(refs, analysis, promptOptions),
    '',
    clientPreviewTabLine(),
    topMatchHeaderLine(fullName),
    clientPreviewPanelLine(top, refs, promptOptions),
    ...consultInspoRulesForPrompt(promptOptions),
  ];
  appendEveryDetailMattersLines(lines, analysis);
  lines.push(freePromptFooter(analysis, promptOptions?.falInImageTextOnly === true));
  return lines.join('\n');
}

function threeMonthPrompt(
  analysis: FalHairstyleAnalysis,
  refs: FalPromptImageRefs,
  promptOptions?: FalPromptBuildOptions
): string {
  const top = analysis.topMatch;
  const fullName = clientFullName(analysis.clientName);
  const lines = [
    buildTemplateRules(refs, analysis, promptOptions),
    '',
    clientPreviewTabLine(),
    topMatchHeaderLine(fullName),
    clientPreviewPanelLine(top, refs, promptOptions),
    ...consultInspoRulesForPrompt(promptOptions),
  ];
  analysis.additionalLooks.slice(0, 3).forEach((look, i) => {
    const label = `MATCH ${String(i + 2).padStart(2, '0')}`;
    lines.push('');
    lines.push(matchThumbnailBlock(label, look, refs));
  });
  appendEveryDetailMattersLines(lines, analysis);
  lines.push('');
  lines.push(matchStylingManifestBlock(analysis, refs));
  lines.push('');
  lines.push(matchColorRootManifestBlock(analysis));
  lines.push('');
  lines.push(matchScoreManifestBlock(analysis));
  lines.push('');
  lines.push(
    promptOptions?.falInImageTextOnly
      ? `FINAL CHECK: **same client face as IMAGE 2** on main photo + all MATCH thumbs; gray centered client name; **Fal-printed** TOP MATCH spec values + MATCH 02–04 rows + EDM verbatim; EDM rows keep **original red rose icons** (text only — no AI/sparkle/checkmark bullets); ${oneShoulderDrapeCompactLock()}; manifest HAIRLINE on every photo; **erase baby hairs on skin**; clean lace-front edge; MATCH RATING stars only; MATCH SCORE % gray ${MATCH_SCORE_GRAY} only.`
      : `FINAL CHECK: **same client face as IMAGE 2** on main photo + all MATCH thumbs; gray centered client name; specs + EDM verbatim; EDM rows keep **original red rose icons** (text only — no AI/sparkle/checkmark bullets); ${oneShoulderDrapeCompactLock()}; manifest HAIRLINE on every photo; **erase baby hairs on skin**; clean lace-front edge; MATCH RATING stars only; MATCH SCORE % gray ${MATCH_SCORE_GRAY} only.`
  );
  return lines.join('\n');
}

export function buildHairstyleAnalysisFalPrompt(
  analysis: FalHairstyleAnalysis,
  refs: FalPromptImageRefs,
  promptOptions?: FalPromptBuildOptions
): string {
  const tier = normalizeTier(analysis.tier);
  const prompt = isFreeLayoutHairstyleAnalysisTier(tier)
    ? freePrompt(analysis, refs, promptOptions)
    : threeMonthPrompt(analysis, refs, promptOptions);
  if (prompt.length > HAIRSTYLE_ANALYSIS_FAL_PROMPT_MAX_CHARS) {
    throw new Error(
      `Hairstyle analysis prompt too long (${prompt.length} characters; Fal limit is ${HAIRSTYLE_ANALYSIS_FAL_PROMPT_MAX_CHARS}).`
    );
  }
  return prompt;
}

