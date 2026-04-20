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
 * Second image = **static** NOIR base mannequin (`/assets/natural *.png`) for **MIDDLE + FLAT IRON** only —
 * locks **geometry / framing** to the same **base** angles as the BAW hub; **Image 1** still supplies **swatch color**.
 */
function flatIronMiddlePartBaseNoirGeometryTwoImageBlock(
  angle: 'front' | 'left' | 'right',
  catalog: CatalogColorForLayersPrompt
): string {
  const viewLabel = angle === 'left' ? 'LEFT 3/4' : angle === 'right' ? 'RIGHT 3/4' : 'FRONT';
  const hex = catalog.hex.replace(/^#/, '').toUpperCase();
  const angleWord = angle === 'left' ? 'left' : angle === 'right' ? 'right' : 'front';
  return (
    '**TWO REFERENCES (MIDDLE + FLAT IRON):** **Image 1** = live **color-tier** preview — hair already **' +
    catalog.label +
    '** at **#' +
    hex +
    '** (**keep this exact hair color**). **Image 2** = **NOIR base mannequin** for this **same** camera (**static natural ' +
    angleWord +
    '** — same **base** angles as the Build-a-Wig hub static previews). Use **Image 2** only for **geometry**: **head pose, framing, silhouette outline, shoulder line** must match **Image 2**; **ignore** hair color on **Image 2** (black reference). Output = **Image 2** layout + **Image 1** swatch + **flat-ironed straight** + **middle part** — **' +
    viewLabel +
    '** view must match the base reference, not a reinvented angle.'
  );
}

/**
 * **FLAT IRON** live styling: same **color-tier WebP** as other salon modes — treat as the **base** color shot; **only** change **part line** + **sleek bone-straight** hair (no new texture pattern beyond straight).
 * **MIDDLE** (no bangs): optional **second** `image_urls` entry = static NOIR naturals — see `flatIronMiddlePartBaseNoirGeometryTwoImageBlock`.
 */
export function buildFlatIronStylePromptFromColorTierWebp(
  angle: 'front' | 'left' | 'right',
  partSelection: NoirLayersPartSelection,
  catalog: CatalogColorForLayersPrompt,
  options?: { includeBangs?: boolean; baseNoirGeometrySecondRef?: boolean }
): string {
  const hex = catalog.hex.replace(/^#/, '').toUpperCase();
  const colorLock =
    '**INPUT** is the live NOIR **color preview** image — hair is already tinted to **' +
    catalog.label +
    '** (target **#' +
    hex +
    '**). **Keep this exact hair color** in the output (same hue, depth, highlights) — do **not** revert to black, off-black, or a different shade.';

  const useBaseNoirSecondRef =
    Boolean(options?.baseNoirGeometrySecondRef) &&
    partSelection === 'MIDDLE' &&
    !options?.includeBangs;

  const partBlock =
    partSelection === 'MIDDLE'
      ? 'Apply a **MIDDLE / center part** at the crown — part line visible from hairline through the top. **Long straight lengths:** follow **DRAPE SIDE** — almost all length forward over **viewer’s LEFT** shoulder only (not symmetric over both).'
      : partSelection === 'LEFT'
        ? '**UI L (LEFT part):** **Straight part line** on **image RIGHT** (right third of forehead / right half of scalp). **Sleek roots** there; lengths sweep so the **main forward drape** sits on **viewer’s LEFT** shoulder per **DRAPE SIDE**. **FORBIDDEN:** part on **image LEFT** scalp (UI **R**). **FORBIDDEN:** heavy drape on **viewer’s RIGHT** shoulder.'
        : '**UI R (RIGHT part):** **Not** UI L. Part groove must sit on **image LEFT** (**left third** of forehead / left scalp — **mirror-opposite** of UI L). **Do not** output UI L (part on **image RIGHT**). **Main straight length** follows **DRAPE SIDE** (heavy forward drape **viewer’s LEFT** shoulder). **FORBIDDEN:** part groove on **image RIGHT** half (that is **UI L**).';

  const angleBlock =
    angle === 'left'
      ? 'This is the **LEFT 3/4 camera angle**: keep framing and head pose — **do not** rotate the head toward camera. Hair mass and part must read correctly for a **left** view.'
      : angle === 'right'
        ? 'This is the **RIGHT 3/4 camera angle**: keep framing and head pose — **do not** rotate the head toward camera. Hair mass and part must read correctly for a **right** view.'
        : 'This is the **FRONT** camera angle: show the **part** and straight fall clearly; **do not** invent a different camera angle.';

  const straightLook =
    '**FLAT IRON (salon bone-straight):** Restyle hair to **smooth, straight** — **flat-ironed** finish, **sleek**, **high-gloss**, **no** waves, **no** curls, **no** crimps, **no** beach texture. **Same** long straight silhouette for **every** swatch (see **STYLE LOCK**) — change **only** part + straightening vs the color preview; **do not** preserve a shorter or puffier shape from the input if it differs from this spec.';

  const bangsAddon = options?.includeBangs
    ? ' **Also add** lightly feathered **curtain bangs** that **match the part** (center-split for middle, asymmetric for side part) — blended into the straight lengths.'
    : '';

  const recreateLead = useBaseNoirSecondRef
    ? '**Edit Image 1** as the **output canvas** — same **mannequin**, **brick background**, **lighting**, **FRONTAL SLAYER** chest logo. **Match Image 2** for **camera angle, head pose, and outer hair silhouette** in this **' +
      (angle === 'left' ? 'LEFT 3/4' : angle === 'right' ? 'RIGHT 3/4' : 'FRONT') +
      '** view (base NOIR naturals). **Only** edit **hair**: apply **FLAT IRON** styling as below — **bone-straight** + **middle part**; **not** a new wig.'
    : 'Recreate this photograph. **Keep the same scene** — same **mannequin**, **brick background**, **lighting**, **framing**, and **FRONTAL SLAYER** chest logo. **Only** edit **hair**: apply **FLAT IRON** styling as below — this is the **same** base color image with **different part direction** and **straight** hair, **not** a new wig or new color.';

  return [
    colorLock,
    ...(partSelection !== 'MIDDLE' ? [salonPartMustOverrideInputReferenceBlock(partSelection)] : []),
    ...(useBaseNoirSecondRef ? [flatIronMiddlePartBaseNoirGeometryTwoImageBlock(angle, catalog)] : []),
    salonStyleInvarianceAcrossColorsBlock('FLAT IRON bone-straight + part'),
    salonPartDirectionSemanticsBlock(),
    salonOneShoulderDrapeBlock(),
    recreateLead,
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
    '**PART vs image (simple):** **image LEFT** / **image RIGHT** = toward that edge of the photo. **UI L** = part on **image RIGHT**. **UI R** = part on **image LEFT** (opposite of **UI L**). Match the customer’s **UI L** or **UI R** — do not swap them.'
  );
}

/**
 * Color-tier WebPs are often generated with a **default** part in the ref (commonly **image RIGHT** / UI L).
 * `STYLE LOCK` + “preserve reference” otherwise makes Fal **keep** that part. Side-part requests must **re-part** anyway.
 */
function salonPartMustOverrideInputReferenceBlock(partSelection: NoirLayersPartSelection): string {
  if (partSelection === 'MIDDLE') return '';
  if (partSelection === 'LEFT') {
    return (
      '**PART OVERRIDE (critical — ignore the color preview’s part line):** The input may show a **different** part (center, **image LEFT**, or weak/off-center). **Discard** it. **UI L** needs the **visible part groove** in the **right third** of the forehead/top (**closer to the image’s RIGHT edge**). **Re-part** the roots to match — **do not** preserve the reference photo’s part placement. **Success check:** if the groove reads on the **image LEFT** half → wrong (that is **UI R**, not **UI L**).'
    );
  }
  return (
    '**PART OVERRIDE (critical — ignore the color preview’s part line):** **UI R** needs the **visible part groove** in the **left third** of the forehead/top (**closer to the image’s LEFT edge**). **Re-part** the roots to match.'
  );
}

/** Product rule: long hair drapes **only** over the **viewer’s left** shoulder (left side of the image — “facing me”). */
function salonOneShoulderDrapeBlock(): string {
  return (
    '**DRAPE SIDE (fixed — all parts):** As you **face** the mannequin in the photo, almost **all** long hair must fall **forward over the viewer’s LEFT shoulder only** — the shoulder on the **left side of the image** (closer to the **left edge**). **FORBIDDEN:** a **thick** forward drape on the **viewer’s RIGHT shoulder** (right side of image). The **right** shoulder may show only a **thin** tuck, **nothing** crossing the collarbone, or hair **behind** the shoulder — **never** a second heavy cascade. **Shoulder still visible:** the drape must **not** be an **opaque blanket** — keep **gaps**, **separation between strands**, or **semi-sheer** fall so the **shoulder cap / curve** (and skin at the neck–shoulder) **still reads through** the hair; **FORBIDDEN:** a solid wall of hair that **fully hides** that shoulder. **Self-check:** if both shoulders have **matching** thick hair in front → **failed**.'
  );
}

/**
 * Color-tier WebPs can differ slightly in length/curl between swatches; Fal may otherwise “follow” the input shape.
 * Instructs: same canonical salon geometry for every catalog color — only pigment changes.
 */
function salonStyleInvarianceAcrossColorsBlock(canonicalStyleLabel: string): string {
  return (
    '**STYLE LOCK — SAME FOR EVERY SWATCH (critical):** The **color preview** image may show **different** current length, curl tightness, frizz, or layering than another color — **ignore that**. Output **one** canonical **' +
      canonicalStyleLabel +
      '** for **this** salon mode + part + angle: **same** silhouette, **same** texture/wave/crimp **scale**, **same** part and **DRAPE SIDE** — **only** hair **pigment/tint** follows the color lock above. **FORBIDDEN:** copying the input’s **existing** style (e.g. looser curls, shorter length, different layering) instead of this spec. **Side parts:** **do not** copy **part-line position** from the color preview when **PART OVERRIDE** applies — follow **UI L** / **UI R** above. **Length / bulk:** follow **this prompt’s** target (long layered / extra-long crimps / sleek straight), **not** whatever length the input WebP happens to show. **Treat input as scene + base color**; **this prompt defines hair shape.**'
  );
}

/** Curtain bangs + part alignment — append when **BANGS** is combined with LAYERS or CRIMPS. */
function curtainBangsAddonForSalonPart(partSelection: NoirLayersPartSelection): string {
  if (partSelection === 'MIDDLE') {
    return (
      '**BANGS (combine with the salon style above):** Add **lightly feathered curtain bangs** that **split from the center** to match the **middle part** — soft, face-framing, blended into the lengths. Bangs must **not** ignore the part: they open from the **same center part line** as the rest of the hair. **Lengths below the bangs** must drape per **DRAPE SIDE** above — **only** the **viewer’s LEFT shoulder** gets the heavy forward length.'
    );
  }
  if (partSelection === 'LEFT') {
    return (
      '**BANGS + salon:** **UI L** — bangs open from a part on **image RIGHT** forehead (**longer** sweep there). **Lengths** still follow **DRAPE SIDE**: heavy length **only** over **viewer’s LEFT** shoulder. **FORBIDDEN:** center part; part on **image LEFT** forehead.'
    );
  }
  return (
    '**BANGS + salon:** **UI R** — **not** LEFT-part placement: part on **image LEFT** forehead (opposite of **UI L**). **Lengths** — heavy drape **only** over **viewer’s LEFT** shoulder per **DRAPE SIDE**. **FORBIDDEN:** center part; part **image RIGHT** forehead (that is **LEFT part**).'
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
    'Target look: **long** layered hair — extend **past the shoulders** (chest-length or longer). Style = **voluminous layered S-waves** (full-bodied, glam): **large, soft S-shaped waves** and **brushed-out barrel curls** — **not** tight ringlets, **not** skinny spiral curls, **not** separated / clumpy / cord-like strands. Waves must **merge into one continuous, cohesive flow** — same wave scale and direction family across the head (**salon-set**, smooth, glossy). Shorter **face-framing layers** should **sweep away from the face** and blend smoothly into longer lengths. **No** piecey definition between strands; hair reads as **one blended shape**, not individual curls. **FRONT (hero):** **single-shoulder drape** — see **DRAPE SIDE** block above; **never** equal “waterfall” curls on **both** shoulders.';

  const crimpsLook =
    'Target look (match **crimps reference images**): **extra-long** hair (well past shoulders / bust-length or longer). Texture = **salon crimp-iron / deep wave**: **tight horizontal accordion ridges** — **repeating zig-zag** pattern along the shaft (**waffle / crimp-plate** look), **not** spiral curls, **not** loose beach waves, **not** barrel curls. Crimps must be **highly defined**, **uniform spacing**, and **consistent scale** from where the style begins (near roots / part) **through the ends**. Finish: **high-gloss**, **smooth**, **frizz-free**; ridges stay **sharp and structural**. **Hair color** must follow the color lock above — do **not** change to black or another shade unless the swatch says so. **FRONT (hero):** **single-shoulder crimp drape** — see **DRAPE SIDE**; **never** thick matching crimp panels on **both** shoulders.';

  const lookBlock = salon === 'crimps' ? crimpsLook : layersLook;

  const styleNoun = salon === 'crimps' ? 'salon deep-pressed crimps' : 'voluminous layered S-waves';
  const partWordLayers =
    partSelection === 'MIDDLE'
      ? '**MIDDLE part:** **Center part** at crown. **FRONT:** long waves — **all heavy length** forward over **viewer’s LEFT shoulder only** (**DRAPE SIDE**). **Viewer’s RIGHT** shoulder: minimal / tucked. **FORBIDDEN:** symmetric heavy waves on both shoulders.'
      : partSelection === 'LEFT'
        ? '**LEFT part (UI “L”):** **Part + root lift on image RIGHT** scalp (**right third** of forehead). Hair must **sweep** so **all heavy long waves** drape **forward over viewer’s LEFT shoulder only** (cross-body from the part if needed). **FORBIDDEN:** part on **image LEFT** scalp (UI **R**). **FORBIDDEN:** thick forward drape on **viewer’s RIGHT** shoulder.'
        : '**RIGHT part (UI “R”):** **Not** UI L. **Part + root lift on image LEFT** scalp (**left third** of forehead) — **mirror-opposite** of UI L. **Heavy long waves** per **DRAPE SIDE**. **FORBIDDEN:** part on **image RIGHT** half (that is **UI L**). **FORBIDDEN:** thick drape on **viewer’s RIGHT** shoulder.';

  const partWordCrimps =
    partSelection === 'MIDDLE'
      ? '**MIDDLE part:** Center at crown. **FRONT:** **heaviest crimps** forward over **viewer’s LEFT shoulder only**; **RIGHT** shoulder minimal. **FORBIDDEN:** two thick crimp curtains.'
      : partSelection === 'LEFT'
        ? '**LEFT part (UI “L”):** **Part on image RIGHT** scalp (**right third** of forehead). **Heaviest crimps** must drape **viewer’s LEFT shoulder only** (sweep from part across if needed). **FORBIDDEN:** part **image LEFT** scalp. **FORBIDDEN:** heavy crimps on **viewer’s RIGHT** shoulder.'
        : '**RIGHT part (UI “R”):** **Not** UI L — part on **image LEFT** (**left third**). **Heaviest crimps** **viewer’s LEFT shoulder**. **FORBIDDEN:** part **image RIGHT** scalp (UI L). **FORBIDDEN:** heavy forward mass on **viewer’s RIGHT** shoulder.';

  const partLine = salon === 'crimps' ? partWordCrimps : partWordLayers;

  const angleConstraint =
    angle === 'left'
      ? partSelection === 'MIDDLE'
        ? salon === 'crimps'
          ? '**LEFT 3/4 (this file):** **MIDDLE part** — keep center; **heavy crimps** forward on **viewer’s LEFT** shoulder only (**DRAPE SIDE**); **forbidden** flip vs FRONT.'
          : '**LEFT 3/4:** **MIDDLE part** — same **DRAPE SIDE** as FRONT; **forbidden** flip.'
        : partSelection === 'LEFT'
          ? salon === 'crimps'
            ? '**LEFT 3/4:** **UI L** — part stays **image RIGHT**; **heavy crimps** **viewer’s LEFT** shoulder only; **forbidden** part **image LEFT** scalp.'
            : '**LEFT 3/4:** **UI L** — part **image RIGHT**; **heavy waves** **viewer’s LEFT** shoulder only; **forbidden** part **image LEFT**.'
          : salon === 'crimps'
            ? '**LEFT 3/4:** **UI R** — part **image LEFT**; heavy crimps **viewer’s LEFT** shoulder; **forbidden** part **image RIGHT**.'
            : '**LEFT 3/4:** **UI R** — part **image LEFT**; heavy waves **viewer’s LEFT** shoulder; **forbidden** part **image RIGHT**.'
      : angle === 'right'
        ? partSelection === 'MIDDLE'
          ? salon === 'crimps'
            ? '**RIGHT 3/4:** **MIDDLE part** — **DRAPE SIDE** (**viewer’s LEFT** shoulder); **forbidden** mirror-flip vs reference.'
            : '**RIGHT 3/4:** **MIDDLE part** — **DRAPE SIDE**; **forbidden** flip.'
          : partSelection === 'LEFT'
            ? salon === 'crimps'
              ? '**RIGHT 3/4:** **UI L** — part **image RIGHT**; bulk **viewer’s LEFT** shoulder only; **forbidden** part **image LEFT**.'
              : '**RIGHT 3/4:** **UI L** — part **image RIGHT**; bulk **viewer’s LEFT** shoulder only; **forbidden** part **image LEFT**.'
            : salon === 'crimps'
              ? '**RIGHT 3/4:** **UI R** — part **image LEFT**; bulk **viewer’s LEFT** shoulder; **forbidden** part **image RIGHT**.'
              : '**RIGHT 3/4:** **UI R** — part **image LEFT**; bulk **viewer’s LEFT** shoulder; **forbidden** part **image RIGHT**.'
        : (() => {
            const oneShoulderFrontLayers =
              partSelection === 'MIDDLE'
                ? '**FRONT:** **MIDDLE** — center part; **heaviest** waves **viewer’s LEFT** shoulder only (**DRAPE SIDE**). **FORBIDDEN:** heavy drape **viewer’s RIGHT** shoulder.'
                : partSelection === 'LEFT'
                  ? '**FRONT:** **UI L** — part **image RIGHT** scalp; **longest waves** drape **viewer’s LEFT** shoulder only. **FORBIDDEN:** part **image LEFT**; **FORBIDDEN:** heavy **RIGHT** shoulder.'
                  : '**FRONT:** **UI R** — part **image LEFT**; **longest waves** **viewer’s LEFT** shoulder. **FORBIDDEN:** part **image RIGHT**; **FORBIDDEN:** heavy **RIGHT** shoulder.';
            const oneShoulderFrontCrimps =
              partSelection === 'MIDDLE'
                ? '**FRONT:** **MIDDLE** — crimps; **heaviest viewer’s LEFT** shoulder only.'
                : partSelection === 'LEFT'
                  ? '**FRONT:** **UI L** — part **image RIGHT**; crimps/heavy mass **viewer’s LEFT** shoulder only. **FORBIDDEN:** part **image LEFT**.'
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
    ...(partSelection !== 'MIDDLE' ? [salonPartMustOverrideInputReferenceBlock(partSelection)] : []),
    salonStyleInvarianceAcrossColorsBlock(styleNoun + (includeBangs ? ' + curtain bangs' : '')),
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
