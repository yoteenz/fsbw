import { bawFalEditPreserveReferenceBlock } from './bawFalEditFidelityPrompt.js';

export type NoirLayersPartSelection = 'MIDDLE' | 'LEFT' | 'RIGHT';

export type CatalogColorForLayersPrompt = { label: string; hex: string };

/**
 * **LAYERS** live styling: Fal `image_urls` = **color-tier WebP** from Storage (already tinted to the swatch).
 * Keeps **catalog hair color** while restyling to **voluminous layered S-waves** (blended barrel curls, not separated ringlets) + part — fixes black hair when input was HQ black refs.
 */
export function buildLayersStylePromptFromColorTierWebp(
  angle: 'front' | 'left' | 'right',
  partSelection: NoirLayersPartSelection,
  catalog: CatalogColorForLayersPrompt,
  options?: { includeBangs?: boolean }
): string {
  const hex = catalog.hex.replace(/^#/, '').toUpperCase();
  const colorLock =
    '**INPUT** is the live NOIR **color preview** image — hair is already tinted to **' +
    catalog.label +
    '** (target **#' +
    hex +
    '**). **Keep this exact hair color** in the output (same hue, depth, highlights) — do **not** revert to black, off-black, or a different shade. Only reshape/style the hair.';

  return buildLayersStylePromptShared(angle, partSelection, colorLock, 'layers', Boolean(options?.includeBangs));
}

/**
 * **CRIMPS** live styling: same inputs as LAYERS (color-tier WebP + part) but hairstyle = **salon crimp-iron** look — deep pressed zig-zag ridges, uniform spacing, glossy (not loose waves).
 */
export function buildCrimpsStylePromptFromColorTierWebp(
  angle: 'front' | 'left' | 'right',
  partSelection: NoirLayersPartSelection,
  catalog: CatalogColorForLayersPrompt,
  options?: { includeBangs?: boolean }
): string {
  const hex = catalog.hex.replace(/^#/, '').toUpperCase();
  const colorLock =
    '**INPUT** is the live NOIR **color preview** image — hair is already tinted to **' +
    catalog.label +
    '** (target **#' +
    hex +
    '**). **Keep this exact hair color** in the output (same hue, depth, highlights) — do **not** revert to black, off-black, or a different shade. Only reshape/style the hair.';

  return buildLayersStylePromptShared(angle, partSelection, colorLock, 'crimps', Boolean(options?.includeBangs));
}

/**
 * **FLAT IRON** live styling: same **color-tier WebP** as other salon modes — treat as the **base** color shot; **only** change **part line** + **sleek bone-straight** hair (no new texture pattern beyond straight).
 */
export function buildFlatIronStylePromptFromColorTierWebp(
  angle: 'front' | 'left' | 'right',
  partSelection: NoirLayersPartSelection,
  catalog: CatalogColorForLayersPrompt,
  options?: { includeBangs?: boolean }
): string {
  const hex = catalog.hex.replace(/^#/, '').toUpperCase();
  const colorLock =
    '**INPUT** is the live NOIR **color preview** image — hair is already tinted to **' +
    catalog.label +
    '** (target **#' +
    hex +
    '**). **Keep this exact hair color** in the output (same hue, depth, highlights) — do **not** revert to black, off-black, or a different shade.';

  const partBlock =
    partSelection === 'MIDDLE'
      ? 'Apply a **MIDDLE / center part** at the crown — part line visible from hairline through the top. Hair falls **evenly** from the center part (straight panels left and right in the **photograph**).'
      : partSelection === 'LEFT'
        ? '**LEFT part:** Part line on **frame LEFT** (left side of this **photograph**). **Sleek roots** at the part; **main straight length** drapes from **frame LEFT**. **Forbidden:** part line on **frame RIGHT** (that would be **RIGHT** part).'
        : '**RIGHT part:** Part line on **frame RIGHT** (right side of this **photograph**). **Sleek roots** at the part; **main straight length** drapes from **frame RIGHT**. **Forbidden:** part line on **frame LEFT** (that would be **LEFT** part).';

  const angleBlock =
    angle === 'left'
      ? 'This is the **LEFT 3/4 camera angle**: keep framing and head pose — **do not** rotate the head toward camera. Hair mass and part must read correctly for a **left** view.'
      : angle === 'right'
        ? 'This is the **RIGHT 3/4 camera angle**: keep framing and head pose — **do not** rotate the head toward camera. Hair mass and part must read correctly for a **right** view.'
        : 'This is the **FRONT** camera angle: show the **part** and straight fall clearly; **do not** invent a different camera angle.';

  const straightLook =
    '**FLAT IRON (salon bone-straight):** Restyle hair to **smooth, straight** — **flat-ironed** finish, **sleek**, **high-gloss**, **no** waves, **no** curls, **no** crimps, **no** beach texture. Length and density should match the **reference** as much as possible while changing **only** part + straightening — **do not** cut a new silhouette or add layers unless needed to show the part.';

  const bangsAddon = options?.includeBangs
    ? ' **Also add** lightly feathered **curtain bangs** that **match the part** (center-split for middle, asymmetric for side part) — blended into the straight lengths.'
    : '';

  return [
    colorLock,
    salonPartDirectionSemanticsBlock(),
    'Recreate this photograph. **Keep the same scene** — same **mannequin**, **brick background**, **lighting**, **framing**, and **FRONTAL SLAYER** chest logo. **Only** edit **hair**: apply **FLAT IRON** styling as below — this is the **same** base color image with **different part direction** and **straight** hair, **not** a new wig or new color.',
    straightLook,
    partBlock,
    angleBlock,
    bangsAddon.trim(),
    bawFalEditPreserveReferenceBlock(),
    'The **FRONTAL SLAYER** chest logo must stay fully legible — same position and sharpness as the reference.',
    'Output must be extremely high-quality, crisp, and pixel-perfect.',
  ]
    .filter((s) => s.length > 0)
    .join(' ');
}

/**
 * @deprecated Prefer `buildLayersStylePromptFromColorTierWebp` — HQ black refs kept hair black.
 * Kept for script parity / manual tests with gray-brick refs only.
 */
export function buildLayersStylePromptFromHqMannequinRef(
  angle: 'front' | 'left' | 'right',
  partSelection: NoirLayersPartSelection
): string {
  const colorLock =
    '**INPUT** is the gray-brick mannequin reference — preserve **catalog hair color** from build (do not output jet black unless the catalog color is black).';
  return buildLayersStylePromptShared(angle, partSelection, colorLock, 'layers', false);
}

/** One paragraph: **frame LEFT** = left edge of the **photograph** (not “stage left”). Prevents mirrored part output. */
function salonPartDirectionSemanticsBlock(): string {
  return (
    '**PART DIRECTION — IMAGE SPACE (critical):** Use **frame LEFT** = the **left edge of this photograph** and **frame RIGHT** = the **right edge**. **Do not** horizontally mirror the scene. **Do not** output the **opposite** part (if the request is **LEFT part**, the part line must **not** appear on **frame RIGHT**, and vice versa).'
  );
}

/** Curtain bangs + part alignment — append when **BANGS** is combined with LAYERS or CRIMPS. */
function curtainBangsAddonForSalonPart(partSelection: NoirLayersPartSelection): string {
  if (partSelection === 'MIDDLE') {
    return (
      '**BANGS (combine with the salon style above):** Add **lightly feathered curtain bangs** that **split from the center** to match the **middle part** — soft, face-framing, blended into the lengths. Bangs must **not** ignore the part: they open from the **same center part line** as the rest of the hair. **Lengths below the bangs** must still follow the **one-sided shoulder drape** rule above — **do not** add **symmetric** long volume on **both** shoulders just because bangs are center-split.'
    );
  }
  if (partSelection === 'LEFT') {
    return (
      '**BANGS (combine with the salon style above):** **LEFT part** → bangs open from a part line on **frame LEFT** (see semantics above); **longer** curtain sweep stays on the **frame LEFT** half of the forehead / face-framing — **do not** mirror to **frame RIGHT**. **Do not** use a center-split bang.'
    );
  }
  return (
    '**BANGS (combine with the salon style above):** **RIGHT part** → bangs open from a part line on **frame RIGHT**; **longer** curtain sweep on the **frame RIGHT** half — **do not** mirror to **frame LEFT**. **Do not** use a center-split bang.'
  );
}

function buildLayersStylePromptShared(
  angle: 'front' | 'left' | 'right',
  partSelection: NoirLayersPartSelection,
  colorLockBlock: string,
  salon: 'layers' | 'crimps',
  includeBangs: boolean
): string {
  const layersLook =
    'Target look: **long** layered hair — extend **past the shoulders** (chest-length or longer). Style = **voluminous layered waves** (full-bodied, glam): **large, soft S-shaped waves** and **brushed-out barrel curls** — **not** tight ringlets, **not** skinny spiral curls, **not** separated / clumpy / cord-like strands. Waves must **merge into one continuous, cohesive flow** — same wave scale and direction family across the head (**salon-set**, smooth, glossy). Shorter **face-framing layers** should **sweep away from the face** and blend smoothly into longer lengths. **No** piecey definition between strands; hair reads as **one blended shape**, not individual curls. **FRONT camera (hero) — hard rule:** **one-sided shoulder drape only**. **FORBIDDEN:** a **balanced “waterfall”** with heavy curl/wave mass **equally** on **both** shoulders, **mirror-image** left/right panels, or **two** thick cascades (one per shoulder). The **longest** wave mass must sit on **ONE** shoulder only; the **other** shoulder must read **clearly lighter** (narrower strip, tucked back, or minimal forward drape).';

  const crimpsLook =
    'Target look (match **crimps reference images**): **extra-long** hair (well past shoulders / bust-length or longer). Texture = **salon crimp-iron / deep wave**: **tight horizontal accordion ridges** — **repeating zig-zag** pattern along the shaft (**waffle / crimp-plate** look), **not** spiral curls, **not** loose beach waves, **not** barrel curls. Crimps must be **highly defined**, **uniform spacing**, and **consistent scale** from where the style begins (near roots / part) **through the ends**. Finish: **high-gloss**, **smooth**, **frizz-free**; ridges stay **sharp and structural**. **Hair color** must follow the color lock above — do **not** change to black or another shade unless the swatch says so. **FRONT camera (hero) — hard rule:** **one-sided shoulder drape only**. **FORBIDDEN:** **symmetric** crimped panels **draping forward on BOTH shoulders** with **similar** thickness, or **two** competing heavy masses. **One** shoulder carries almost all long crimp length; the **opposite** shoulder stays **visibly slimmer**.';

  const lookBlock = salon === 'crimps' ? crimpsLook : layersLook;

  const styleNoun = salon === 'crimps' ? 'salon deep-pressed crimps' : 'voluminous layered S-waves';
  const partWordLayers =
    partSelection === 'MIDDLE'
      ? '**MIDDLE part:** **Center part line** at the crown (visible from hairline). **FRONT view — asymmetric drape (fixed):** the **longest** layered waves fall toward **frame LEFT** and the **left shoulder** in the photo; **frame RIGHT** stays **lighter** (narrower / less forward drape). **Forbidden:** equal heavy curls on **both** sides.'
      : partSelection === 'LEFT'
        ? '**LEFT part (salon / UI selection):** Place the **part line** and **widest root lift** on **frame LEFT** (left side of the **photograph**). The **main** long wave mass and forward drape must sit on the **left shoulder** in the image (**frame LEFT**). **Frame RIGHT** = shallow / tucked — **no** second heavy cascade. **Forbidden:** mirroring so the part appears on **frame RIGHT** or swapping LEFT↔RIGHT.'
        : '**RIGHT part (salon / UI selection):** Place the **part line** and **widest root lift** on **frame RIGHT** (right side of the **photograph**). The **main** long wave mass and forward drape must sit on the **right shoulder** in the image (**frame RIGHT**). **Frame LEFT** = shallow / tucked. **Forbidden:** mirroring so the part appears on **frame LEFT** or swapping LEFT↔RIGHT.';

  const partWordCrimps =
    partSelection === 'MIDDLE'
      ? '**MIDDLE part:** **Center part** at crown; crimps start at the part. **FRONT view:** primary crimped mass toward **frame LEFT** / **left shoulder**; **frame RIGHT** slimmer. **Forbidden:** symmetric thick panels on both sides.'
      : partSelection === 'LEFT'
        ? '**LEFT part:** **Part line** and **sleek roots** on **frame LEFT**. **Long crimped mass** drapes from **frame LEFT** over the **left shoulder** in the photo. **Frame RIGHT** = minimal forward bulk. **Forbidden:** part or heavy mass on **frame RIGHT** (that would be a **RIGHT** part).'
        : '**RIGHT part:** **Part line** and **sleek roots** on **frame RIGHT**. **Long crimped mass** drapes from **frame RIGHT** over the **right shoulder** in the photo. **Frame LEFT** = minimal forward bulk. **Forbidden:** part or heavy mass on **frame LEFT** (that would be a **LEFT** part).';

  const partLine = salon === 'crimps' ? partWordCrimps : partWordLayers;

  const angleConstraint =
    angle === 'left'
      ? partSelection === 'MIDDLE'
        ? salon === 'crimps'
          ? '**LEFT 3/4 camera (this file):** **MIDDLE part** — keep center line; **crimp** bulk may read toward **frame LEFT**; **forbidden** horizontal flip of the whole hairstyle.'
          : '**LEFT 3/4 camera:** **MIDDLE part** — asymmetric waves favor **frame LEFT**; **forbidden** flip.'
        : partSelection === 'LEFT'
          ? salon === 'crimps'
            ? '**LEFT 3/4 camera:** **LEFT part** — part + **heavy crimps** must stay on **frame LEFT** (same side as FRONT). **Do not** move the part to **frame RIGHT**.'
            : '**LEFT 3/4 camera:** **LEFT part** — part + **main wave mass** on **frame LEFT**. **Do not** flip to **frame RIGHT**.'
          : salon === 'crimps'
            ? '**LEFT 3/4 camera:** **RIGHT part** — part + **heavy crimps** on **frame RIGHT**. **Do not** flip to **frame LEFT**.'
            : '**LEFT 3/4 camera:** **RIGHT part** — part + **main waves** on **frame RIGHT**. **Do not** flip to **frame LEFT**.'
      : angle === 'right'
        ? partSelection === 'MIDDLE'
          ? salon === 'crimps'
            ? '**RIGHT 3/4 camera:** **MIDDLE part** — keep center; **forbidden** hairstyle mirror-flip vs reference.'
            : '**RIGHT 3/4 camera:** **MIDDLE part** — **forbidden** flip.'
          : partSelection === 'LEFT'
            ? salon === 'crimps'
              ? '**RIGHT 3/4 camera:** **LEFT part** — part + bulk **frame LEFT** only.'
              : '**RIGHT 3/4 camera:** **LEFT part** — part + bulk **frame LEFT** only.'
            : salon === 'crimps'
              ? '**RIGHT 3/4 camera:** **RIGHT part** — part + bulk **frame RIGHT** only.'
              : '**RIGHT 3/4 camera:** **RIGHT part** — part + bulk **frame RIGHT** only.'
        : (() => {
            const oneShoulderFrontLayers =
              partSelection === 'MIDDLE'
                ? '**FRONT camera:** **MIDDLE part** — center line; long waves favor **frame LEFT**; **frame RIGHT** lighter.'
                : partSelection === 'LEFT'
                  ? '**FRONT camera:** **LEFT part** — part line **frame LEFT**; **longest waves** on **frame LEFT** shoulder. **FORBIDDEN:** part on **frame RIGHT**.'
                  : '**FRONT camera:** **RIGHT part** — part line **frame RIGHT**; **longest waves** on **frame RIGHT** shoulder. **FORBIDDEN:** part on **frame LEFT**.';
            const oneShoulderFrontCrimps =
              partSelection === 'MIDDLE'
                ? '**FRONT camera:** **MIDDLE part** — asymmetric crimps toward **frame LEFT**.'
                : partSelection === 'LEFT'
                  ? '**FRONT camera:** **LEFT part** — part + crimps **frame LEFT** only.'
                  : '**FRONT camera:** **RIGHT part** — part + crimps **frame RIGHT** only.';
            return salon === 'crimps' ? oneShoulderFrontCrimps : oneShoulderFrontLayers;
          })();

  const lengthNote =
    salon === 'crimps'
      ? 'Do **not** change skin, bust, neck seam, or background except as needed for hair silhouette. Length may increase for the long crimped look.'
      : 'Do **not** change skin, bust, neck seam, or background except as needed for hair silhouette. Length may increase for the long layered **wave** look (full-bodied, blended — not stringy).';

  const bangsLine = includeBangs
    ? curtainBangsAddonForSalonPart(partSelection) +
      ' Apply **both** the salon wave/crimp style **and** bangs in one coherent hairstyle — do **not** output bangs-only or style-only.'
    : null;

  return [
    colorLockBlock,
    salonPartDirectionSemanticsBlock(),
    'Recreate this photograph. **Only** change the **hairstyle** to **' +
      styleNoun +
      '** with the **part direction** specified below. Preserve **mannequin**, **brick background**, **lighting**, **framing**, and the **hair color** rules above.',
    lookBlock,
    partLine,
    angleConstraint,
    lengthNote,
    ...(bangsLine ? [bangsLine] : []),
    bawFalEditPreserveReferenceBlock(),
    'The **FRONTAL SLAYER** chest logo must stay fully legible — same position and sharpness as the reference.',
    'Output must be extremely high-quality, crisp, and pixel-perfect.',
    'Change **only** the **hair** shape/style to ' +
      styleNoun +
      (includeBangs ? ' **with curtain bangs** as specified' : '') +
      ' with the specified part; **everything** else must match the reference, including **hair color** per the lock above.',
  ].join(' ');
}

/**
 * **Two-image** middle + layers (live API):
 * - **First** `image_urls` entry = customer color preview (Storage WebP): full scene + **keep this hair color** in the output.
 * - **Second** entry = optional **geometry-only** reference (env URLs): same mannequin/brick type shot showing target **cut, part, layers, silhouette** — not a second “final” to paste; do **not** copy its hair color or replace the background from it.
 * Keep in sync with `scripts/wig-preview/promptTemplate.mjs` (`buildMiddlePartLayersStylePromptTwoImages`).
 */
export function buildMiddlePartLayersStylePromptTwoImages(angle: 'front' | 'left' | 'right'): string {
  const angleConstraint =
    angle === 'left'
      ? 'Camera is **LEFT 3/4**: when taking hair **shape** from the geometry reference, keep bulk on the **correct shoulder for a left view** — do **not** mirror into a symmetric “both shoulders” wig unless the reference clearly shows that.'
      : angle === 'right'
        ? 'Camera is **RIGHT 3/4**: when taking hair **shape** from the geometry reference, keep bulk on the **correct shoulder for a right view** — do **not** mirror into a symmetric “both shoulders” wig unless the reference clearly shows that.'
        : 'Camera is **FRONT**: match the geometry reference’s **part line and outer silhouette** for the hair; do not invent a different cut.';

  return [
    'You get **two images in order**. **IMAGE 1** is the only **output canvas**: same mannequin, brick background, framing, chest logo, and **keep the hair color exactly as in image 1** (catalog / customer color).',
    '**IMAGE 2** is a **hair geometry reference only** (middle part, layers, face-framing, volume, silhouette). Copy **only** the **cut, layering, and part** from image 2 onto the head in image 1. **Do not** use image 2’s hair color, **do not** swap in image 2’s background, and **do not** treat image 2 as a full composite to paste over image 1.',
    angleConstraint,
    bawFalEditPreserveReferenceBlock(),
    'The **FRONTAL SLAYER** chest logo must stay fully legible, same position as in image 1.',
    'Output must be extremely high-quality, crisp, and pixel-perfect.',
    'Change **only** the **hair mesh** in image 1 so its **shape** matches the geometry reference; everything else in image 1 stays the same, especially **hair color**.',
  ].join(' ');
}

/** @deprecated Use `buildMiddlePartLayersStylePromptTwoImages(angle)` for per-angle wording. */
export const BAW_MIDDLE_PART_LAYERS_STYLE_PROMPT_TWO_IMAGES = buildMiddlePartLayersStylePromptTwoImages('front');

/** Single-image manual fal (no color base attachment) — “this” = the only image. */
export const BAW_MIDDLE_PART_LAYERS_STYLE_PROMPT_SINGLE_IMAGE = [
  'Recreate this exact mannequin image, but change the hair to black #000000.',
  'The logo on the center of the mannequin’s chest with FRONTAL SLAYER should be fully legible for accuracy & consistency.',
  'The photo should be extremely high-quality, crisp & pixel perfect.',
  'Do not change anything else about the photo.',
].join(' ');

/** @deprecated Use `buildMiddlePartLayersStylePromptTwoImages(angle)`. */
export const BAW_MIDDLE_PART_LAYERS_STYLE_PROMPT_TEXT = BAW_MIDDLE_PART_LAYERS_STYLE_PROMPT_TWO_IMAGES;

/**
 * **Single-image** live API: edit the **color** WebP only — add curtain bangs; no style inspo URL.
 * Keep in sync with `scripts/wig-preview/promptTemplate.mjs` (`BAW_BANGS_ONLY_STYLE_PROMPT`).
 */
export function buildBangsOnlyStylePrompt(angle: 'front' | 'left' | 'right'): string {
  const angleConstraint =
    angle === 'left'
      ? 'This is the **LEFT 3/4 view**: keep hair mass and part direction consistent with the reference; only add bangs — do **not** mirror or restyle the length away from the left view.'
      : angle === 'right'
        ? 'This is the **RIGHT 3/4 view**: keep hair mass and part direction consistent with the reference; only add bangs — do **not** mirror or restyle the length away from the right view.'
        : 'This is the **FRONT view**: add bangs only; keep the rest of the hair layout and part as in the reference.';

  return [
    'Recreate this exact mannequin image, but add lightly feathered curtain bangs to the hairstyle only do NOT change the positioning of the rest of the hair.',
    angleConstraint,
    bawFalEditPreserveReferenceBlock(),
    'The logo on the center of the mannequin’s chest with FRONTAL SLAYER should be fully legible for accuracy & consistency.',
    'The photo should be extremely high-quality, crisp & pixel perfect.',
    'Do not change anything else about the photo except the bangs as specified.',
  ].join(' ');
}
