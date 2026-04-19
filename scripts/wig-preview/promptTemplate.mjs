/**
 * Prompts for two different features — keep them separate:
 *
 * 1) **WIG CONSULT** — manual 3-step chain in fal (base → color → style). `WIG_CONSULT_STEP*` only.
 * 2) **BAW (Build-a-wig)** — (a) **manual fal** base hero: `BAW_BASE_MANNEQUIN_PROMPT_*` below; (b) **bulk script**: `buildWigPreviewPrompt` at the bottom.
 */

/** Keep in sync with `api/_lib/bawFalEditFidelityPrompt.ts` — reduces plastic/waxy drift on edit passes. */
export const BAW_FAL_EDIT_PRESERVE_REFERENCE_BLOCK = [
  'Treat the input as a **photograph to preserve**, not a scene to repaint: keep **the same effective resolution, sharpness, grain, and micro-detail** as the reference — do **not** downscale, blur, soften, over-smooth, or add a plastic / waxy / painterly CGI look.',
  'Lock **mannequin bust material**, **skin tone**, **facial features**, and **neck seam** to the reference — **no** melting, warping, retexturing, or “beauty filter” on the figure.',
  'Lock **background bricks**, **lighting**, **shadows**, and **camera perspective** to the reference unless the prompt explicitly asks to change them.',
  'Keep the **FRONTAL SLAYER** chest logo **sharp**, same **size** and **placement**, clean edges — **no** smeared, redrawn, or re-typed lettering.',
].join(' ');

// =============================================================================
// WIG CONSULT — Step 1 (1 ref only) + Steps 2–3. Not BAW.
// Step 1 attachment: **gray brick mannequin only** (no logo file, no separate backdrop file). fal **9:16** in playground unless you match Auto + 2K like Step 2.
// =============================================================================

/** Wig consult Step 1 — brick → white/rose backdrop + logo described in text (single base reference). */
export const WIG_CONSULT_STEP1_PROMPT = [
  'Recreate this exact mannequin image, but swap out the gray brick background with a white backdrop background with the same rose detailing on the edge of the background like your standard white/rose studio consult backdrop.',
  'On the center of the mannequin’s chest, the Frontal Slayer brand mark should be clear and fully legible — red F/S monogram with FRONTAL SLAYER in small red caps, proportional to the chest, stitched-on look, matching brand red.',
  'The photo should be extremely high-quality, crisp & pixel perfect.',
  'Do not change anything else about the photo.',
].join(' ');

/** Previous Step 1 (3 attachments: mannequin, backdrop, logo). Kept for copy-paste / older runs. */
export const WIG_CONSULT_STEP1_PROMPT_THREE_ATTACHMENTS = [
  'Recreate this exact mannequin image, but swap out the gray brick background with a white backdrop background with the same rose detailing on the edge of the background like the 2nd attachment image.',
  'Use my logo from the 3rd reference attachment on the center of the mannequin’s chest for accuracy & consistency.',
  'The photo should be extremely high-quality, crisp & pixel perfect.',
  'Do not change anything else about the photo.',
].join(' ');

/**
 * Generic Step 2 / Step 3 (and BAW chain edits): same wording for any “change A → B” on the mannequin.
 * fal: **aspect ratio Auto**, **resolution 2K**. Attach prior step image + **logo reference** so “reference image” = logo.
 * @param {string} fromDescription - what you are changing from (e.g. “black hair color”, “output from step 1”)
 * @param {string} toDescription - what you are changing to (e.g. “pink hair color (hex #DA3063)”, “PEAK hairline”)
 */
export function buildWigConsultChainEditPrompt(fromDescription, toDescription) {
  const fromD = String(fromDescription || '').trim() || 'previous state';
  const toD = String(toDescription || '').trim() || 'target state';
  return [
    'Recreate this exact mannequin image, but change the ' + fromD + ' to ' + toD + '.',
    BAW_FAL_EDIT_PRESERVE_REFERENCE_BLOCK,
    'The logo on the center of the mannequin’s chest should look exactly like reference image with FRONTAL SLAYER fully legible for accuracy & consistency.',
    'The photo should be extremely high-quality, crisp & pixel perfect.',
    'Do not change anything else about the photo beyond the stated edit.',
  ].join(' ');
}

/** BAW / consult chain: same as `buildWigConsultChainEditPrompt` (hairline, styling, etc.). */
export const BAW_SELECTION_CHAIN_EDIT_PROMPT = buildWigConsultChainEditPrompt;

/**
 * Catalog hair colors for Step 2 (label + hex, no `#`).
 * Keys are UPPER_SNAKE; aliases: `PINK` → raspberry (legacy).
 */
export const BAW_CATALOG_HAIR_COLOR_HEX = {
  ESPRESSO: { label: 'espresso', hex: '361504' },
  CHESTNUT: { label: 'chestnut', hex: '643118' },
  HONEY: { label: 'honey', hex: 'BB883C' },
  AUBURN: { label: 'auburn', hex: '925927' },
  COPPER: { label: 'copper', hex: '763412' },
  GINGER: { label: 'ginger', hex: 'E35B2A' },
  SANGRIA: { label: 'sangria', hex: '731921' },
  CHERRY: { label: 'cherry', hex: 'FF1400' },
  RASPBERRY: { label: 'raspberry', hex: 'FF2855' },
  PLUM: { label: 'plum', hex: '5B177C' },
  COBALT: { label: 'cobalt', hex: '25067B' },
  TEAL: { label: 'teal', hex: '7BE7CA' },
  SLIME: { label: 'slime', hex: '63D54B' },
  CITRINE: { label: 'citrine', hex: 'E3E851' },
  JET_BLACK: { label: 'jet black', hex: '000000' },
  OFF_BLACK: { label: 'off black', hex: '160604' },
  JET_BLACK_OFF_BLACK: { label: 'jet black', hex: '000000' },
};

/** @deprecated Use `RASPBERRY` — same hex/label as raspberry */
BAW_CATALOG_HAIR_COLOR_HEX.PINK = BAW_CATALOG_HAIR_COLOR_HEX.RASPBERRY;

function normalizeCatalogColorKey(key) {
  return String(key || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9_]/g, '_')
    .replace(/_+/g, '_');
}

/**
 * @param {string} catalogKey - e.g. `'RASPBERRY'`, `'SLIME'`, `'JET_BLACK_OFF_BLACK'`
 * @returns {{ label: string, hex: string } | undefined}
 */
export function getBawCatalogHairColor(catalogKey) {
  const k = normalizeCatalogColorKey(catalogKey);
  if (k === 'JET_BLACK_OFF_BLACK') {
    return BAW_CATALOG_HAIR_COLOR_HEX.JET_BLACK_OFF_BLACK;
  }
  if (k === 'JET_BLACK') {
    return BAW_CATALOG_HAIR_COLOR_HEX.JET_BLACK;
  }
  if (k === 'OFF_BLACK') {
    return BAW_CATALOG_HAIR_COLOR_HEX.OFF_BLACK;
  }
  return BAW_CATALOG_HAIR_COLOR_HEX[k];
}

/**
 * Step 2 prompt for a catalog color key (e.g. `wigConsultStep2ForCatalogColor('HONEY')`).
 */
export function wigConsultStep2ForCatalogColor(catalogKey) {
  const row = getBawCatalogHairColor(catalogKey);
  if (!row) {
    throw new Error(
      `Unknown catalog color "${catalogKey}". Use one of: ${Object.keys(BAW_CATALOG_HAIR_COLOR_HEX).filter((x) => x !== 'PINK').join(', ')}`
    );
  }
  return WIG_CONSULT_STEP2_PROMPT(row.hex, row.label);
}

/**
 * Step 2 — hair color only (wig consult + BAW “base → color”). Attach Step 1 output + logo reference; fal **Auto** + **2K**.
 * @param {string} [hairHex='DA3063'] - e.g. `'DA3063'` or `'#DA3063'`
 * @param {string} [hairColorLabel='raspberry'] - catalog name shown in prompt (e.g. `'raspberry'`, `'slime'`)
 */
export function WIG_CONSULT_STEP2_PROMPT(hairHex = 'DA3063', hairColorLabel = 'raspberry') {
  const hex = String(hairHex || '').replace(/^#/, '');
  const label = String(hairColorLabel || 'raspberry').trim() || 'raspberry';
  return [
    'Recreate this exact mannequin image, but change the black hair color to ' +
      label +
      ' hex code #' +
      hex +
      ' & ensure this color looks as closely to authentically colored/dyed hair & not a weird unrealistic shade.',
    BAW_FAL_EDIT_PRESERVE_REFERENCE_BLOCK,
    'The logo on the center of the mannequin’s chest should look exactly like reference image with FRONTAL SLAYER fully legible for accuracy & consistency.',
    'The photo should be extremely high-quality, crisp & pixel perfect.',
    'Do not change anything else about the photo except **hair color** as specified.',
  ].join(' ');
}

/** Same as `WIG_CONSULT_STEP2_PROMPT` — BAW “base → color”; pass `hairHex` (+ optional label) or use `wigConsultStep2ForCatalogColor(key)`. */
export const BAW_SELECTION_COLOR_FROM_BASE_PROMPT = WIG_CONSULT_STEP2_PROMPT;

/**
 * Step 3 — same template as Step 2: change “input from step 2” → “input for step 3”.
 * Attach: Step 2 output + any extra refs (e.g. hair style reference as 2nd image); keep logo ref so “reference image” still resolves.
 * @param {string} fromDescription - e.g. `'hair as in the previous image'` or plain `'input from step 2'`
 * @param {string} toDescription - e.g. `'hair styled exactly like the second reference attachment'`
 */
export function WIG_CONSULT_STEP3_PROMPT(fromDescription, toDescription) {
  return buildWigConsultChainEditPrompt(fromDescription, toDescription);
}

/**
 * Wig consult Step 3 — common case: “input from step 2” → style from 2nd attachment (you still attach Step 2 + style ref + logo ref as needed).
 */
export function WIG_CONSULT_STEP3_PROMPT_STYLE_REFERENCE() {
  return WIG_CONSULT_STEP3_PROMPT(
    'input from step 2',
    'hair styled exactly like the second reference attachment, same hair color as in the image'
  );
}

/** Older Step 3 (style-only, second attachment wording). Kept for copy-paste / comparison. */
export const WIG_CONSULT_STEP3_PROMPT_LEGACY_STYLE_ATTACHMENT = [
  'Recreate this exact same photo just change the hair to be styled like the second reference attachment ONLY.',
  'Don’t change the color of her hair or anything else in the photo.',
].join(' ');

/** Same as legacy 3-ref Step 1 — kept for older docs and A/B testing. */
export const WIG_CONSULT_LEGACY_STEP1_PROMPT = WIG_CONSULT_STEP1_PROMPT_THREE_ATTACHMENTS;

// =============================================================================
// BAW — manual fal “base mannequin” hero (NOT wig consult; NOT the bulk script)
// **2 attachments** (no logo file): (1) **the mannequin shot to recreate** — for 3-angle batch work, use the **current angle’s** source (same as the hero/thumb for that view: front / left / right) per fal call; (2) white/rose backdrop.
// fal: **Aspect ratio Auto**, **Resolution 2K** (product owner–verified; keeps framing closer to source than forcing 9:16).
// =============================================================================

export const BAW_BASE_MANNEQUIN_PROMPT_TWO_ATTACHMENTS = [
  'Recreate this exact mannequin image.',
  'The logo on the center of the mannequin’s chest with FRONTAL SLAYER should be fully legible for accuracy & consistency.',
  'The photo should be extremely high-quality, crisp & pixel perfect.',
  'Do not change anything else about the photo.',
].join(' ');

/** @deprecated Wrong name — was under wig consult. Use `BAW_BASE_MANNEQUIN_PROMPT_TWO_ATTACHMENTS` for BAW base image. */
export const WIG_CONSULT_STEP1_PROMPT_TWO_ATTACHMENTS = BAW_BASE_MANNEQUIN_PROMPT_TWO_ATTACHMENTS;

// =============================================================================
// BAW — shared styling: **middle part / layers** (all 6 units; same look)
// Use after color (or on top of catalog color): one mannequin ref; fal Auto + 2K unless you tune.
// =============================================================================

/**
 * **Live LAYERS** (`POST /api/live-wig-after-color-styling`): `image_urls` = color-tier WebP from Storage. Keep in sync with `bawLiveStylingPrompts.ts`.
 * @param {{ label: string; hex: string }} catalog
 */
export function buildLayersStylePromptFromColorTierWebp(angle, partSelection, catalog, options) {
  const hex = String(catalog.hex || '')
    .replace(/^#/, '')
    .toUpperCase();
  const colorLock =
    '**INPUT** is the live NOIR **color preview** image — hair is already tinted to **' +
    catalog.label +
    '** (target **#' +
    hex +
    '**). **Keep this exact hair color** in the output — do **not** revert to black or a different shade. Only reshape/style the hair.';
  const includeBangs = Boolean(options && options.includeBangs);
  return buildLayersStylePromptShared(angle, partSelection, colorLock, 'layers', includeBangs);
}

/** **CRIMPS** — same inputs as LAYERS; crimp texture + part. Keep in sync with `bawLiveStylingPrompts.ts`. */
export function buildCrimpsStylePromptFromColorTierWebp(angle, partSelection, catalog, options) {
  const hex = String(catalog.hex || '')
    .replace(/^#/, '')
    .toUpperCase();
  const colorLock =
    '**INPUT** is the live NOIR **color preview** image — hair is already tinted to **' +
    catalog.label +
    '** (target **#' +
    hex +
    '**). **Keep this exact hair color** in the output — do **not** revert to black or a different shade. Only reshape/style the hair.';
  const includeBangs = Boolean(options && options.includeBangs);
  return buildLayersStylePromptShared(angle, partSelection, colorLock, 'crimps', includeBangs);
}

/** **FLAT IRON** — color WebP + part + straight; keep in sync with `bawLiveStylingPrompts.ts`. */
export function buildFlatIronStylePromptFromColorTierWebp(angle, partSelection, catalog, options) {
  const hex = String(catalog.hex || '')
    .replace(/^#/, '')
    .toUpperCase();
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
  const bangsAddon =
    options && options.includeBangs
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
    BAW_FAL_EDIT_PRESERVE_REFERENCE_BLOCK,
    'The **FRONTAL SLAYER** chest logo must stay fully legible — same position and sharpness as the reference.',
    'Output must be extremely high-quality, crisp, and pixel-perfect.',
  ]
    .filter((s) => s.length > 0)
    .join(' ');
}

function salonPartDirectionSemanticsBlock() {
  return (
    '**PART LINE — WHERE IT MUST APPEAR (triple-check):** **image LEFT** = toward the **left edge** of the picture; **image RIGHT** = toward the **right edge**. **UI “L” (salon LEFT part)** = subject’s **own left** side of the head — in the photo that is the **right half of the head** (**image RIGHT**, viewer’s right). **UI “R”** = subject’s **own right** side → **image LEFT** (viewer’s left). **WRONG:** UI **L** with the part groove on **image LEFT**; UI **R** with part on **image RIGHT**. **Do not** mirror-flip the hairstyle vs these rules.'
  );
}

function salonOneShoulderDrapeBlock() {
  return (
    '**ONE SHOULDER ONLY (all parts):** Long hair must **not** hang as **two** thick, even curtains over **both** shoulders. **FORBIDDEN:** similar heavy curl/wave/crimp mass **forward** on **both** sides of the chest; **two** wide panels framing the bust; “balanced” volume left and right. **REQUIRED:** **one** shoulder carries almost all length **forward**; the **other** shoulder is **narrow**, **tucked back**, or **minimal** — **visibly less** hair crossing in front. **Self-check:** if both collarbones have a **thick** matching drape → **failed**.'
  );
}

function curtainBangsAddonForSalonPart(partSelection) {
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

/** @deprecated Manual HQ black-brick tests only; live API uses color WebPs + `buildLayersStylePromptFromColorTierWebp`. */
export function buildLayersStylePromptFromHqMannequinRef(angle, partSelection) {
  return buildLayersStylePromptShared(
    angle,
    partSelection,
    '**INPUT** is the gray-brick mannequin reference — preserve catalog hair color (do not output jet black unless catalog is black).',
    'layers',
    false
  );
}

/** @param {'layers'|'crimps'} salon */
function buildLayersStylePromptShared(angle, partSelection, colorLockBlock, salon, includeBangs) {
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

  let angleConstraint;
  if (angle === 'left') {
    angleConstraint =
      partSelection === 'MIDDLE'
        ? salon === 'crimps'
          ? '**LEFT 3/4 (this file):** **MIDDLE part** — keep center; **heavier** crimps toward **image RIGHT** shoulder; **forbidden** flip the part or swap shoulders vs FRONT.'
          : '**LEFT 3/4:** **MIDDLE part** — same asymmetric drape as FRONT (**heavier image RIGHT**); **forbidden** flip.'
        : partSelection === 'LEFT'
          ? salon === 'crimps'
            ? '**LEFT 3/4:** **UI L** — scalp part stays **image RIGHT** (same scalp slot as FRONT); **heavy crimps** on **viewer’s right** shoulder; **forbidden** move part to **image LEFT**.'
            : '**LEFT 3/4:** **UI L** — part **image RIGHT**; **heavy waves** **viewer’s right** shoulder; **forbidden** part **image LEFT**.'
          : salon === 'crimps'
            ? '**LEFT 3/4:** **UI R** — part **image LEFT**; heavy crimps **viewer’s left** shoulder; **forbidden** part **image RIGHT**.'
            : '**LEFT 3/4:** **UI R** — part **image LEFT**; heavy waves **viewer’s left** shoulder; **forbidden** part **image RIGHT**.';
  } else if (angle === 'right') {
    angleConstraint =
      partSelection === 'MIDDLE'
        ? salon === 'crimps'
          ? '**RIGHT 3/4:** **MIDDLE part** — center; **heavier** toward **image RIGHT** shoulder; **forbidden** mirror-flip hairstyle vs reference.'
          : '**RIGHT 3/4:** **MIDDLE part** — match FRONT asymmetry; **forbidden** flip.'
        : partSelection === 'LEFT'
          ? salon === 'crimps'
            ? '**RIGHT 3/4:** **UI L** — part **image RIGHT** scalp; bulk **viewer’s right** shoulder; **forbidden** part on **image LEFT**.'
            : '**RIGHT 3/4:** **UI L** — part **image RIGHT**; bulk **viewer’s right** shoulder; **forbidden** part **image LEFT**.'
          : salon === 'crimps'
            ? '**RIGHT 3/4:** **UI R** — part **image LEFT**; bulk **viewer’s left** shoulder; **forbidden** part **image RIGHT**.'
            : '**RIGHT 3/4:** **UI R** — part **image LEFT**; bulk **viewer’s left** shoulder; **forbidden** part **image RIGHT**.';
  } else if (partSelection === 'MIDDLE') {
    angleConstraint =
      salon === 'crimps'
        ? '**FRONT:** **MIDDLE** — asymmetric crimps; **heaviest image RIGHT** shoulder.'
        : '**FRONT:** **MIDDLE** — center part; **heaviest** waves **image RIGHT** shoulder; **image LEFT** shoulder clearly lighter. **FORBIDDEN:** two heavy drapes.';
  } else if (partSelection === 'LEFT') {
    angleConstraint =
      salon === 'crimps'
        ? '**FRONT:** **UI L** — part **image RIGHT**; crimps/heavy mass **viewer’s RIGHT** shoulder only. **FORBIDDEN:** part **image LEFT**.'
        : '**FRONT:** **UI L** — part groove **image RIGHT** half of scalp; **longest waves** **viewer’s RIGHT** shoulder. **FORBIDDEN:** part **image LEFT**; **FORBIDDEN:** both shoulders heavy.';
  } else {
    angleConstraint =
      salon === 'crimps'
        ? '**FRONT:** **UI R** — part **image LEFT**; heavy crimps **viewer’s LEFT** shoulder. **FORBIDDEN:** part **image RIGHT**.'
        : '**FRONT:** **UI R** — part **image LEFT** scalp; **longest waves** **viewer’s LEFT** shoulder. **FORBIDDEN:** part **image RIGHT**; **FORBIDDEN:** both shoulders heavy.';
  }

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
    BAW_FAL_EDIT_PRESERVE_REFERENCE_BLOCK,
    'The **FRONTAL SLAYER** chest logo must stay fully legible — same position and sharpness as the reference.',
    'Output must be extremely high-quality, crisp, and pixel-perfect.',
    'Change **only** the **hair** shape/style to ' +
      styleNoun +
      (includeBangs ? ' **with curtain bangs** as specified' : '') +
      ' with the specified part; **everything** else must match the reference, including **hair color** per the lock above.',
  ].join(' ');
}

/**
 * @deprecated Live API uses color WebPs + `buildLayersStylePromptFromColorTierWebp`.
 * **Two attachments** (legacy): (1) colored mannequin from Storage, (2) geometry reference per angle.
 * @param {'front'|'left'|'right'} angle
 */
export function buildMiddlePartLayersStylePromptTwoImages(angle) {
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
    BAW_FAL_EDIT_PRESERVE_REFERENCE_BLOCK,
    'The **FRONTAL SLAYER** chest logo must stay fully legible, same position as in image 1.',
    'Output must be extremely high-quality, crisp, and pixel-perfect.',
    'Change **only** the **hair mesh** in image 1 so its **shape** matches the geometry reference; everything else in image 1 stays the same, especially **hair color**.',
  ].join(' ');
}

/**
 * **Single attachment** (live fal): color WebP only — add curtain bangs. Keep in sync with `api/_lib/bawLiveStylingPrompts.ts` `buildBangsOnlyStylePrompt`.
 * @param {'front'|'left'|'right'} angle
 */
export function buildBangsOnlyStylePrompt(angle) {
  const angleConstraint =
    angle === 'left'
      ? 'This is the **LEFT 3/4 view**: keep hair mass and part direction consistent with the reference; only add bangs — do **not** mirror or restyle the length away from the left view.'
      : angle === 'right'
        ? 'This is the **RIGHT 3/4 view**: keep hair mass and part direction consistent with the reference; only add bangs — do **not** mirror or restyle the length away from the right view.'
        : 'This is the **FRONT view**: add bangs only; keep the rest of the hair layout and part as in the reference.';

  return [
    'Recreate this exact mannequin image, but add lightly feathered curtain bangs to the hairstyle only do NOT change the positioning of the rest of the hair.',
    angleConstraint,
    BAW_FAL_EDIT_PRESERVE_REFERENCE_BLOCK,
    'The logo on the center of the mannequin’s chest with FRONTAL SLAYER should be fully legible for accuracy & consistency.',
    'The photo should be extremely high-quality, crisp & pixel perfect.',
    'Do not change anything else about the photo except the bangs as specified.',
  ].join(' ');
}

/** Default string for copy-paste (front angle constraint). */
export const BAW_MIDDLE_PART_LAYERS_STYLE_PROMPT_TWO_IMAGES = buildMiddlePartLayersStylePromptTwoImages('front');

/** One attachment only (manual fal on the inspo shot alone). */
export const BAW_MIDDLE_PART_LAYERS_STYLE_PROMPT_SINGLE_IMAGE = [
  'Recreate this exact mannequin image, but change the hair to black #000000.',
  'The logo on the center of the mannequin’s chest with FRONTAL SLAYER should be fully legible for accuracy & consistency.',
  'The photo should be extremely high-quality, crisp & pixel perfect.',
  'Do not change anything else about the photo.',
].join(' ');

/** Default export name: two-image flow for BAW live styling API. */
export const BAW_MIDDLE_PART_LAYERS_STYLE_PROMPT = BAW_MIDDLE_PART_LAYERS_STYLE_PROMPT_TWO_IMAGES;

/** Alias — same as `BAW_MIDDLE_PART_LAYERS_STYLE_PROMPT`. */
export const BAW_STYLING_MIDDLE_PART_LAYERS_PROMPT = BAW_MIDDLE_PART_LAYERS_STYLE_PROMPT;

// =============================================================================
// Backward-compatible names (wig consult)
// =============================================================================

export const NBP_STEP1_PROMPT = WIG_CONSULT_STEP1_PROMPT;

export function NBP_STEP2_PROMPT(hairHex, hairColorLabel) {
  return WIG_CONSULT_STEP2_PROMPT(hairHex, hairColorLabel);
}

export function NBP_STEP3_PROMPT(fromDescription, toDescription) {
  return WIG_CONSULT_STEP3_PROMPT(fromDescription, toDescription);
}

// =============================================================================
// BAW — automated batch (one fal call per manifest row)
// =============================================================================

/**
 * Build-a-wig catalog previews — `pregenerate-wig-previews.mjs` only.
 * @param {{ unitKey: string; length: string; density: string; texture: string; lace: string; hairline: string; color: string; styling: string; addOns: string[] }} s
 */
export function buildWigPreviewPrompt(s) {
  const addons =
    Array.isArray(s.addOns) && s.addOns.length
      ? s.addOns.map((a) => String(a).toUpperCase()).join(', ')
      : 'NONE';
  return [
    'Professional e-commerce product photograph, single forward-facing studio shot.',
    'Subject: high-end lace front wig on a neutral mannequin head (no real person, no identifiable face).',
    `Unit line: ${s.unitKey}.`,
    `Hair: ${s.texture} texture, color ${s.color}, length ${s.length}, density ${s.density}.`,
    `Lace: ${s.lace}. Hairline: ${s.hairline}. Styling: ${s.styling}. Add-ons: ${addons}.`,
    'Lighting: soft even studio light, subtle shadow, clean catalog look.',
    'Background: seamless light gray cyclorama, minimal props, sharp focus on hair.',
    'No text, no watermark, no logos.',
  ].join(' ');
}
