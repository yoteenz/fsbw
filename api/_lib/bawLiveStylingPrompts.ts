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
      ? 'Apply a **MIDDLE / center part** at the crown — part line visible from hairline through the top. Hair falls **evenly** from the center part (straight panels on **both** sides of the head as seen in the photo).'
      : partSelection === 'LEFT'
        ? '**UI L (LEFT part):** **Straight part line** on **image RIGHT** — on the **right half** of the scalp/forehead in the picture (**closer to the right edge**). **Sleek roots** there; main length from that side. **FORBIDDEN:** part on **image LEFT** scalp (that is UI **R**).'
        : '**UI R (RIGHT part):** Part line on **image LEFT** (**left half** of scalp in the picture). **FORBIDDEN:** part on **image RIGHT** scalp (that is UI **L**).';

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
    salonOneShoulderDrapeBlock(),
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

/**
 * Side parts: UI **L** = subject’s left = **right half of the image** (closer to the **right** edge); UI **R** = **left half** / closer to **left** edge.
 * Repeat in multiple phrasings — Fal often flips or mirrors if only one wording is used.
 */
function salonPartDirectionSemanticsBlock(): string {
  return (
    '**PART LINE — WHERE IT MUST APPEAR (triple-check):** **image LEFT** = toward the **left edge** of the picture; **image RIGHT** = toward the **right edge**. **UI “L” (salon LEFT part)** = subject’s **own left** side of the head — in the photo that is the **right half of the head** (**image RIGHT**, viewer’s right). **UI “R”** = subject’s **own right** side → **image LEFT** (viewer’s left). **WRONG:** UI **L** with the part groove on **image LEFT**; UI **R** with part on **image RIGHT**. **Do not** mirror-flip the hairstyle vs these rules.'
  );
}

/** One-sided drape — repeated because models still output symmetric “curtain” hair. */
function salonOneShoulderDrapeBlock(): string {
  return (
    '**ONE SHOULDER ONLY (all parts):** Long hair must **not** hang as **two** thick, even curtains over **both** shoulders. **FORBIDDEN:** similar heavy curl/wave/crimp mass **forward** on **both** sides of the chest; **two** wide panels framing the bust; “balanced” volume left and right. **REQUIRED:** **one** shoulder carries almost all length **forward**; the **other** shoulder is **narrow**, **tucked back**, or **minimal** — **visibly less** hair crossing in front. **Self-check:** if both collarbones have a **thick** matching drape → **failed**.'
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
      '**BANGS + salon:** **UI L** — bangs split from a part on **image RIGHT** (right side of forehead in the picture); **longer** sweep on **image RIGHT**. **FORBIDDEN:** center part; **FORBIDDEN:** part on **image LEFT** forehead.'
    );
  }
  return (
    '**BANGS + salon:** **UI R** — part on **image LEFT** forehead; **longer** sweep **image LEFT**. **FORBIDDEN:** center part; **FORBIDDEN:** part **image RIGHT** forehead.'
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
    'Target look: **long** layered hair — extend **past the shoulders** (chest-length or longer). Style = **voluminous layered waves** (full-bodied, glam): **large, soft S-shaped waves** and **brushed-out barrel curls** — **not** tight ringlets, **not** skinny spiral curls, **not** separated / clumpy / cord-like strands. Waves must **merge into one continuous, cohesive flow** — same wave scale and direction family across the head (**salon-set**, smooth, glossy). Shorter **face-framing layers** should **sweep away from the face** and blend smoothly into longer lengths. **No** piecey definition between strands; hair reads as **one blended shape**, not individual curls. **FRONT (hero):** **single-shoulder drape** — see **ONE SHOULDER ONLY** block above; **never** equal “waterfall” curls on **both** shoulders.';

  const crimpsLook =
    'Target look (match **crimps reference images**): **extra-long** hair (well past shoulders / bust-length or longer). Texture = **salon crimp-iron / deep wave**: **tight horizontal accordion ridges** — **repeating zig-zag** pattern along the shaft (**waffle / crimp-plate** look), **not** spiral curls, **not** loose beach waves, **not** barrel curls. Crimps must be **highly defined**, **uniform spacing**, and **consistent scale** from where the style begins (near roots / part) **through the ends**. Finish: **high-gloss**, **smooth**, **frizz-free**; ridges stay **sharp and structural**. **Hair color** must follow the color lock above — do **not** change to black or another shade unless the swatch says so. **FRONT (hero):** **single-shoulder crimp drape** — see **ONE SHOULDER ONLY**; **never** thick matching crimp panels on **both** shoulders.';

  const lookBlock = salon === 'crimps' ? crimpsLook : layersLook;

  const styleNoun = salon === 'crimps' ? 'salon deep-pressed crimps' : 'voluminous layered S-waves';
  const partWordLayers =
    partSelection === 'MIDDLE'
      ? '**MIDDLE part:** **Center part** at crown (visible from hairline). **FRONT:** long waves **asymmetric** — **heaviest** drape on **image RIGHT** / **viewer’s right** shoulder; **image LEFT** shoulder **much lighter** (no matching heavy cascade). **FORBIDDEN:** symmetric volume on both shoulders.'
      : partSelection === 'LEFT'
        ? '**LEFT part (UI “L”):** **Scalp part + root lift on image RIGHT** (right side of the head in the picture). **Heavy long waves** must fall **forward over the viewer’s RIGHT shoulder** (same side as the part). **Image LEFT** side of head: **less** hair; **opposite** shoulder: **no** thick forward drape — tuck or slim. **FORBIDDEN:** part on **image LEFT** scalp (that is UI **R**). **FORBIDDEN:** heavy wave sheet on **both** shoulders.'
        : '**RIGHT part (UI “R”):** **Scalp part + root lift on image LEFT**. **Heavy long waves** **forward over the viewer’s LEFT shoulder**. **Image RIGHT** side of head slimmer; **opposite** shoulder **no** thick drape. **FORBIDDEN:** part on **image RIGHT** scalp (that is UI **L**). **FORBIDDEN:** heavy waves on **both** shoulders.';

  const partWordCrimps =
    partSelection === 'MIDDLE'
      ? '**MIDDLE part:** Center at crown. **FRONT:** **heaviest** crimp mass toward **image RIGHT** shoulder; **image LEFT** shoulder **slimmer**. **FORBIDDEN:** two thick crimp “curtains” on both shoulders.'
      : partSelection === 'LEFT'
        ? '**LEFT part (UI “L”):** **Part on image RIGHT** scalp. **Heaviest crimps** drape **viewer’s RIGHT shoulder** (same side as part). **Image LEFT** shoulder: **minimal** forward crimps. **FORBIDDEN:** part on **image LEFT** scalp. **FORBIDDEN:** symmetric crimps on both shoulders.'
        : '**RIGHT part (UI “R”):** **Part on image LEFT** scalp. **Heaviest crimps** **viewer’s LEFT shoulder**. **Image RIGHT** shoulder minimal. **FORBIDDEN:** part on **image RIGHT** scalp. **FORBIDDEN:** symmetric shoulder drapes.';

  const partLine = salon === 'crimps' ? partWordCrimps : partWordLayers;

  const angleConstraint =
    angle === 'left'
      ? partSelection === 'MIDDLE'
        ? salon === 'crimps'
          ? '**LEFT 3/4 (this file):** **MIDDLE part** — keep center; **heavier** crimps toward **image RIGHT** shoulder; **forbidden** flip the part or swap shoulders vs FRONT.'
          : '**LEFT 3/4:** **MIDDLE part** — same asymmetric drape as FRONT (**heavier image RIGHT**); **forbidden** flip.'
        : partSelection === 'LEFT'
          ? salon === 'crimps'
            ? '**LEFT 3/4:** **UI L** — scalp part stays **image RIGHT** (same scalp slot as FRONT); **heavy crimps** on **viewer’s right** shoulder; **forbidden** move part to **image LEFT**.'
            : '**LEFT 3/4:** **UI L** — part **image RIGHT**; **heavy waves** **viewer’s right** shoulder; **forbidden** part **image LEFT**.'
          : salon === 'crimps'
            ? '**LEFT 3/4:** **UI R** — part **image LEFT**; heavy crimps **viewer’s left** shoulder; **forbidden** part **image RIGHT**.'
            : '**LEFT 3/4:** **UI R** — part **image LEFT**; heavy waves **viewer’s left** shoulder; **forbidden** part **image RIGHT**.'
      : angle === 'right'
        ? partSelection === 'MIDDLE'
          ? salon === 'crimps'
            ? '**RIGHT 3/4:** **MIDDLE part** — center; **heavier** toward **image RIGHT** shoulder; **forbidden** mirror-flip hairstyle vs reference.'
            : '**RIGHT 3/4:** **MIDDLE part** — match FRONT asymmetry; **forbidden** flip.'
          : partSelection === 'LEFT'
            ? salon === 'crimps'
              ? '**RIGHT 3/4:** **UI L** — part **image RIGHT** scalp; bulk **viewer’s right** shoulder; **forbidden** part on **image LEFT**.'
              : '**RIGHT 3/4:** **UI L** — part **image RIGHT**; bulk **viewer’s right** shoulder; **forbidden** part **image LEFT**.'
            : salon === 'crimps'
              ? '**RIGHT 3/4:** **UI R** — part **image LEFT**; bulk **viewer’s left** shoulder; **forbidden** part **image RIGHT**.'
              : '**RIGHT 3/4:** **UI R** — part **image LEFT**; bulk **viewer’s left** shoulder; **forbidden** part **image RIGHT**.'
        : (() => {
            const oneShoulderFrontLayers =
              partSelection === 'MIDDLE'
                ? '**FRONT:** **MIDDLE** — center part; **heaviest** waves **image RIGHT** shoulder; **image LEFT** shoulder clearly lighter. **FORBIDDEN:** two heavy drapes.'
                : partSelection === 'LEFT'
                  ? '**FRONT:** **UI L** — part groove **image RIGHT** half of scalp; **longest waves** **viewer’s RIGHT** shoulder. **FORBIDDEN:** part **image LEFT**; **FORBIDDEN:** both shoulders heavy.'
                  : '**FRONT:** **UI R** — part **image LEFT** scalp; **longest waves** **viewer’s LEFT** shoulder. **FORBIDDEN:** part **image RIGHT**; **FORBIDDEN:** both shoulders heavy.';
            const oneShoulderFrontCrimps =
              partSelection === 'MIDDLE'
                ? '**FRONT:** **MIDDLE** — asymmetric crimps; **heaviest image RIGHT** shoulder.'
                : partSelection === 'LEFT'
                  ? '**FRONT:** **UI L** — part **image RIGHT**; crimps/heavy mass **viewer’s RIGHT** shoulder only. **FORBIDDEN:** part **image LEFT**.'
                  : '**FRONT:** **UI R** — part **image LEFT**; heavy crimps **viewer’s LEFT** shoulder. **FORBIDDEN:** part **image RIGHT**.';
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
    salonOneShoulderDrapeBlock(),
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
