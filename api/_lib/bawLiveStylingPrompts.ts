import {
  bawFalEditPreserveReferenceBlock,
  BAW_GPT2_LOGO_AND_HAIR_ONLY_LOCK,
} from './bawFalEditFidelityPrompt.js';
import {
  bawSalonOneShoulderDrapeBlock,
  salonPartDirectionSemanticsBlock,
  salonPartMustOverrideInputReferenceBlock,
  type NoirLayersPartSelection,
} from './bawSalonHairGeometryPrompts.js';

export type { NoirLayersPartSelection };

export type CatalogColorForLayersPrompt = { label: string; hex: string };

/**
 * **LAYERS** live styling: Fal `image_urls` = **color-tier WebP** from Storage (already tinted to the swatch).
 * Keeps **catalog hair color** while restyling to **uniform voluminous layered S-waves** (not ringlets/curl clusters) + part — fixes black hair when input was HQ black refs.
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
    '**). **Keep this exact hair color** in the output (same hue, depth, highlights) — do **not** revert to black, off-black or a different shade. Only reshape/style the hair.';

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
    '**). **Keep this exact hair color** in the output (same hue, depth, highlights) — do **not** revert to black, off-black or a different shade. Only reshape/style the hair.';

  return buildLayersStylePromptShared(angle, partSelection, colorLock, 'crimps', Boolean(options?.includeBangs));
}

/**
 * Second image = **Supabase** NOIR base mannequin (`live-preview/Noir/image (26|27|28).png`) for **MIDDLE + FLAT IRON** only —
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
    '**). **Keep this exact hair color** in the output (same hue, depth, highlights) — do **not** revert to black, off-black or a different shade.';

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
    ? '**Edit Image 1** as the **output canvas** — same **mannequin**, **brick background**, **lighting**, **FRONTAL SLAYER** chest logo. **Match Image 2** for **camera angle, head pose and outer hair silhouette** in this **' +
      (angle === 'left' ? 'LEFT 3/4' : angle === 'right' ? 'RIGHT 3/4' : 'FRONT') +
      '** view (base NOIR naturals). **Only** edit **hair**: apply **FLAT IRON** styling as below — **bone-straight** + **middle part**; **not** a new wig.'
    : 'Recreate this photograph. **Keep the same scene** — same **mannequin**, **brick background**, **lighting**, **framing** and **FRONTAL SLAYER** chest logo. **Only** edit **hair**: apply **FLAT IRON** styling as below — this is the **same** base color image with **different part direction** and **straight** hair, **not** a new wig or new color.';

  return [
    colorLock,
    ...(partSelection !== 'MIDDLE' ? [salonPartMustOverrideInputReferenceBlock(partSelection)] : []),
    ...(useBaseNoirSecondRef ? [flatIronMiddlePartBaseNoirGeometryTwoImageBlock(angle, catalog)] : []),
    salonStyleInvarianceAcrossColorsBlock('FLAT IRON bone-straight + part'),
    salonPartDirectionSemanticsBlock(),
    bawSalonOneShoulderDrapeBlock(),
    recreateLead,
    straightLook,
    partBlock,
    angleBlock,
    bangsAddon.trim(),
    bawFalEditPreserveReferenceBlock(),
    BAW_GPT2_LOGO_AND_HAIR_ONLY_LOCK,
    'Output must be extremely high-quality, crisp and pixel-perfect.',
  ]
    .filter((s) => s.length > 0)
    .join(' ');
}

/**
 * @deprecated Prefer `buildLayersStylePromptFromColorTierWebp` — HQ black refs kept hair black.
 * Kept for script parity / manual fal playground tests with Supabase gray-brick mannequin refs only.
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
 * **UI L / UI R part:** Fal input = **MIDDLE-part FRONT** styled output (identity lock) — **only** re-part.
 * Mirrors angle front-anchor logic: same hairstyle as **MIDDLE**, part groove moved to UI L or UI R.
 */
export function buildBawSalonSidePartFromMiddleFrontPrompt(
  targetPart: 'LEFT' | 'RIGHT',
  salon: 'layers' | 'crimps' | 'flat_iron',
  options?: { includeBangs?: boolean }
): string {
  const salonLabel = bawSalonModePromptLabel(salon);
  const partTask =
    targetPart === 'LEFT'
      ? '**UI L / LEFT part**: visible part groove in the **right third** of the forehead/top (**closer to the image’s RIGHT edge**) — **not** center, **not** UI R.'
      : '**UI R / RIGHT part**: visible part groove in the **left third** of the forehead/top (**closer to the image’s LEFT edge**) — **not** center, **not** UI L.';
  const styleKeep =
    salon === 'layers'
      ? 'Keep the **same uniform voluminous layered S-waves** (not ringlets), volume, length, and color — **only** change where the **part** sits.'
      : salon === 'crimps'
        ? 'Keep the **same crimp texture, scale, length, and color** — **only** change where the **part** sits.'
        : 'Keep the **same bone-straight flat-ironed** finish, length, and color — **only** change where the **part** sits.';
  const bangsLine = options?.includeBangs ? curtainBangsAddonForSalonPart(targetPart) : null;

  return [
    '**INPUT:** **IMAGE 1** is the **MIDDLE part** (**center part**) **FRONT** styled output — **same** mannequin, scene, lighting, **hair color**, and **' +
      salonLabel +
      '** finish.',
    '**TASK:** **Recreate this FRONT photograph** with **only** the **part moved** to ' +
      partTask +
      ' **Do not** mirror the head; **do not** restyle texture; **do not** change volume, length, or drape except what the new part requires.',
    salonPartMustOverrideInputReferenceBlock(targetPart),
    bawSalonModeLockBlock(salon),
    styleKeep,
    bawSalonOneShoulderDrapeBlock(),
    ...(bangsLine ? [bangsLine] : []),
    bawFalEditPreserveReferenceBlock(),
    BAW_GPT2_LOGO_AND_HAIR_ONLY_LOCK,
    'Output must be extremely high-quality, crisp and pixel-perfect.',
  ].join(' ');
}

function buildBawSalonMiddleFrontAnchorSideSupplement(
  angle: 'left' | 'right',
  targetPart: 'LEFT' | 'RIGHT',
  salon: 'layers' | 'crimps' | 'flat_iron',
  options?: { includeBangs?: boolean }
): string {
  const salonLabel = bawSalonModePromptLabel(salon);
  const bangsLine = options?.includeBangs ? curtainBangsAddonForSalonPart(targetPart) : null;
  const layersWave = salon === 'layers' ? bawLayersUniformWaveTextureBlock() : null;
  return [
    '**SIDE VIEW HAIR RULE (MIDDLE FRONT lock + ' +
      targetPart +
      ' part):** **IMAGE 1** is **MIDDLE part FRONT** styled output. **Copy this exact hairstyle identity** onto **IMAGE 2**\'s **' +
      (angle === 'left' ? 'LEFT 3/4' : 'RIGHT 3/4') +
      '** camera — **only** re-part to **' +
      (targetPart === 'LEFT' ? 'UI L' : 'UI R') +
      '**. **FORBIDDEN:** inventing a **new similar** hairstyle; **FORBIDDEN:** a different curl/wave family vs IMAGE 1.',
    bawSalonModeLockBlock(salon),
    bawSalonFinishLookBlock(salon),
    ...(layersWave ? [layersWave] : []),
    salonPartMustOverrideInputReferenceBlock(targetPart),
    salonPartDirectionSemanticsBlock(),
    bawSalonOneShoulderDrapeBlock(),
    bawSalonFrontAnchorSideSceneLockBlock(angle),
    ...(bangsLine ? [bangsLine] : []),
  ].join(' ');
}

/**
 * **UI L / UI R part, L/R camera angles:** **IMAGE 1** = **MIDDLE-part FRONT** identity; **IMAGE 2** = gray-brick side pose.
 * @deprecated Live API no longer uses this for side-part L/R cameras — use **`buildBawSalonStylingWithFrontAnchorPrompt`** with **this side part’s FRONT** (mirrors MIDDLE part). Kept for script/legacy callers.
 */
export function buildBawSalonSidePartFromMiddleFrontAnchorPrompt(
  angle: 'left' | 'right',
  targetPart: 'LEFT' | 'RIGHT',
  salon: 'layers' | 'crimps' | 'flat_iron',
  catalog: CatalogColorForLayersPrompt,
  options?: { includeBangs?: boolean }
): string {
  const hex = catalog.hex.replace(/^#/, '').toUpperCase();
  const salonLabel = bawSalonModePromptLabel(salon);
  const angleLabel = angle === 'left' ? 'LEFT 3/4' : 'RIGHT 3/4';
  const partLabel = targetPart === 'LEFT' ? 'UI L / LEFT part' : 'UI R / RIGHT part';

  return [
    'You get **2 images in order**.',
    '**IMAGE 1 = CANONICAL MIDDLE PART FRONT (hairstyle + color identity lock):** **MIDDLE part** (**center part**) **FRONT** styled output for **' +
      salonLabel +
      '** at **' +
      catalog.label +
      '** (**#' +
      hex +
      '**). **Reproduce this exact hairstyle** on **' +
      angleLabel +
      '** from **IMAGE 2** — **only** move the **part** to **' +
      partLabel +
      '**. **FORBIDDEN:** inventing a **new similar** hairstyle; **FORBIDDEN:** changing curl/wave/crimp family or scale.',
    '**IMAGE 2** = **NOIR gray-brick mannequin** (**' +
      angleLabel +
      '** photograph). **Scene fidelity lock:** match **IMAGE 2** head pose, framing, brick, lighting, shadows, **FRONTAL SLAYER** logo — **ignore** IMAGE 2 hair.',
    bawSalonNaturalHairAntiHelmetBlock(),
    bawSalonFrontAnchorSideSceneLockBlock(angle),
    '=== ' +
      salonLabel +
      ' SIDE VIEW (MIDDLE FRONT lock + ' +
      targetPart +
      ' part — follow every line below) ===',
    buildBawSalonMiddleFrontAnchorSideSupplement(angle, targetPart, salon, options),
    bawFalEditPreserveReferenceBlock(),
    BAW_GPT2_LOGO_AND_HAIR_ONLY_LOCK,
    'Output must be extremely high-quality, crisp and pixel-perfect.',
    'Composite: **IMAGE 1** exact **MIDDLE FRONT** hairstyle identity + **' +
      partLabel +
      '** part + **IMAGE 2** exact **' +
      angleLabel +
      '** scene (**' +
      salonLabel +
      '**).',
  ].join(' ');
}

/**
 * @deprecated Prefer **`buildBawSalonSidePartFromMiddleFrontPrompt`** (FRONT). Side-part L/R cameras: **`buildBawSalonStylingWithFrontAnchorPrompt`**.
 */
export function buildUiRightSalonFromMiddlePartOutputPrompt(
  angle: 'front' | 'left' | 'right',
  salon: 'layers' | 'crimps',
  includeBangs: boolean,
  catalog?: CatalogColorForLayersPrompt
): string {
  const cat = catalog ?? { label: 'hair', hex: '000000' };
  if (angle === 'front') {
    return buildBawSalonSidePartFromMiddleFrontPrompt('RIGHT', salon, { includeBangs });
  }
  return buildBawSalonSidePartFromMiddleFrontAnchorPrompt(angle, 'RIGHT', salon, cat, { includeBangs });
}

/**
 * Color-tier WebPs can differ slightly in length/curl between swatches; Fal may otherwise “follow” the input shape.
 * Instructs: same canonical salon geometry for every catalog color — only pigment changes.
 */
function salonStyleInvarianceAcrossColorsBlock(canonicalStyleLabel: string): string {
  return (
    '**STYLE LOCK — SAME FOR EVERY SWATCH (critical):** The **color preview** image may show **different** current length, curl tightness, frizz or layering than another color — **ignore that**. Output **one** canonical **' +
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
    'Target look: **long** layered hair — extend **past the shoulders** (chest-length or longer). Style = **uniform voluminous layered S-waves** (full-bodied, glam): **large, soft, repeating S-shaped set waves** — **one wave scale** across the head (**salon-set**, smooth, glossy). **NOT** ringlets, **NOT** spiral curls, **NOT** corkscrews, **NOT** separated curl clumps, **NOT** mixed curl sizes. Waves **merge into one continuous flow** — shorter face-framing layers blend into longer lengths. **FORBIDDEN:** beach-curl perm look or “bunch of curls”. **FRONT:** main forward panel per **DRAPE SIDE**; back length **straight down the back** naturally.';

  const crimpsLook =
    'Target look (match **crimps reference images**): **extra-long** hair (well past shoulders / bust-length or longer). Texture = **salon crimp-iron / deep wave**: **tight horizontal accordion ridges** — **repeating zig-zag** pattern along the shaft (**waffle / crimp-plate** look), **not** spiral curls, **not** loose beach waves, **not** barrel curls. Crimps must be **highly defined**, **uniform spacing** and **consistent scale** from where the style begins (near roots / part) **through the ends**. Finish: **high-gloss**, **smooth**, **frizz-free**; ridges stay **sharp and structural** with visible **strand depth** — **FORBIDDEN:** flat **helmet** blob with no ridge detail. **Hair color** must follow the color lock above — do **not** change to black or another shade unless the swatch says so. **FRONT (hero):** **single-shoulder crimp drape** — see **DRAPE SIDE**; **never** thick matching crimp panels on **both** shoulders.';

  const lookBlock = salon === 'crimps' ? crimpsLook : layersLook;

  const styleNoun = salon === 'crimps' ? 'salon deep-pressed crimps' : 'voluminous layered S-waves';
  const partWordLayers =
    partSelection === 'MIDDLE'
      ? '**MIDDLE part:** **Center part** at crown. **FRONT:** main waves forward over **viewer’s LEFT** shoulder; length **behind** falls **straight down the back** naturally. **FORBIDDEN:** symmetric heavy waves on both shoulders; **FORBIDDEN:** all back hair swept to one side.'
      : partSelection === 'LEFT'
        ? '**LEFT part (UI “L”):** **Part + root lift on image RIGHT** scalp (**right third** of forehead). **Main forward waves** over **viewer’s LEFT** shoulder; **back length** **straight down the back** — **FORBIDDEN:** part on **image LEFT** scalp (UI **R**); **FORBIDDEN:** thick forward drape on **viewer’s RIGHT**; **FORBIDDEN:** routing all back hair sideways.'
        : '**RIGHT part (UI “R”):** **Not** UI L. **Part on image LEFT** scalp (**left third**). **Main forward waves** per **DRAPE SIDE**; **back length** **straight down the back**. **FORBIDDEN:** part on **image RIGHT** (UI **L**); **FORBIDDEN:** all hair piled to one side behind the back.';

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
                  ? '**FRONT:** **UI L** — part **image RIGHT**; crimps **viewer’s LEFT** shoulder only. **FORBIDDEN:** part **image LEFT**.'
                  : '**FRONT:** **UI R** — part **image LEFT**; heavy crimps **viewer’s LEFT** shoulder. **FORBIDDEN:** part **image RIGHT**.';
            return salon === 'crimps' ? oneShoulderFrontCrimps : oneShoulderFrontLayers;
          })();

  const lengthNote =
    salon === 'crimps'
      ? 'Do **not** change skin, bust, neck seam or background except as needed for hair silhouette. Length may increase for the long crimped look.'
      : 'Do **not** change skin, bust, neck seam or background except as needed for hair silhouette. Length may increase for the long layered **wave** look (full-bodied, blended — not stringy).';

  const bangsLine = includeBangs
    ? curtainBangsAddonForSalonPart(partSelection) +
      ' Apply **both** the salon wave/crimp style **and** bangs in one coherent hairstyle — do **not** output bangs-only or style-only.'
    : null;

  return [
    colorLockBlock,
    ...(partSelection !== 'MIDDLE' ? [salonPartMustOverrideInputReferenceBlock(partSelection)] : []),
    salonStyleInvarianceAcrossColorsBlock(styleNoun + (includeBangs ? ' + curtain bangs' : '')),
    salonPartDirectionSemanticsBlock(),
    bawSalonOneShoulderDrapeBlock(),
    ...(salon === 'layers' ? [bawLayersUniformWaveTextureBlock()] : []),
    'Recreate this photograph. **Only** change the **hairstyle** to **' +
      styleNoun +
      '** with the **part direction** specified below. Preserve **mannequin**, **brick background**, **lighting**, **framing** and the **hair color** rules above.',
    lookBlock,
    partLine,
    angleConstraint,
    lengthNote,
    ...(bangsLine ? [bangsLine] : []),
    bawFalEditPreserveReferenceBlock(),
    BAW_GPT2_LOGO_AND_HAIR_ONLY_LOCK,
    'Output must be extremely high-quality, crisp and pixel-perfect.',
    'Change **only** the **hair** shape/style to ' +
      styleNoun +
      (includeBangs ? ' **with curtain bangs** as specified' : '') +
      ' with the specified part; **everything** else must match the reference, including **hair color** per the lock above.',
  ].join(' ');
}

function bawLayersUniformWaveTextureBlock(): string {
  return (
    '**LAYERS TEXTURE LOCK — UNIFORM S-WAVES (not curls):** One **uniform** family of **large soft S-shaped set waves** — **same wave size and rhythm** from roots through ends, blended and cohesive. **FORBIDDEN:** ringlet curls, spiral curls, corkscrews, beach ringlets, separated curl clusters, or **many mixed curl sizes**. **NOT** crimps. **NOT** a curl perm or barrel-curl ringlets. Reads as **salon brushed layered waves**, not individual curls.'
  );
}

function bawSalonNaturalHairAntiHelmetBlock(): string {
  return (
    '**NATURAL HAIR (not helmet):** Styled hair must read as **real long salon hair** — **root lift**, **strand separation**, **soft hairline transition**, and **organic movement** in waves/crimps/straight fall. **FORBIDDEN:** solid **helmet** / **molded cap** / **wig-hat** blob pasted on the head; **FORBIDDEN:** one flat paint layer with zero internal texture; **FORBIDDEN:** plastic shell hair.'
  );
}

/** Full color-tier text spec (layers/crimps/flat iron) — used with or without IMAGE 3 styling ref. */
function buildBawSalonColorTierTextSpec(
  angle: 'front' | 'left' | 'right',
  partSelection: NoirLayersPartSelection,
  salon: 'layers' | 'crimps' | 'flat_iron',
  catalog: CatalogColorForLayersPrompt,
  options?: { includeBangs?: boolean; baseNoirGeometrySecondRef?: boolean }
): string {
  if (salon === 'layers') {
    return buildLayersStylePromptFromColorTierWebp(angle, partSelection, catalog, options);
  }
  if (salon === 'crimps') {
    return buildCrimpsStylePromptFromColorTierWebp(angle, partSelection, catalog, options);
  }
  return buildFlatIronStylePromptFromColorTierWebp(angle, partSelection, catalog, options);
}

function bawSalonModeLockBlock(salon: 'layers' | 'crimps' | 'flat_iron'): string {
  if (salon === 'layers') {
    return (
      '**STYLING MODE LOCK — LAYERS (critical):** Output **uniform voluminous layered S-waves** — **NOT** ringlet/spiral curls, **NOT** crimps, **NOT** bone-straight. **FORBIDDEN:** curl perm, separated curl clusters, mixed curl sizes.'
    );
  }
  if (salon === 'crimps') {
    return (
      '**STYLING MODE LOCK — CRIMPS (critical):** Output **salon crimp-iron** accordion ridges — **NOT** bone-straight, **NOT** loose waves, **NOT** barrel curls only. **FORBIDDEN:** flat-ironed or naturally straight hair.'
    );
  }
  return (
    '**STYLING MODE LOCK — FLAT IRON (critical):** Output **bone-straight** flat-ironed hair — **NOT** S-waves, **NOT** crimps, **NOT** curls. **FORBIDDEN:** wavy or crimped texture.'
  );
}

function bawSalonFinishLookBlock(salon: 'layers' | 'crimps' | 'flat_iron'): string {
  if (salon === 'layers') {
    return (
      '**LAYERS finish spec:** **Long** layered hair past shoulders. **Uniform large S-shaped set waves** — one wave scale, blended cohesive flow — **not** ringlets, **not** curls, **not** straight.'
    );
  }
  if (salon === 'crimps') {
    return (
      '**CRIMPS finish spec:** **Extra-long** hair with **tight horizontal accordion crimp ridges** — uniform zig-zag/waffle pattern root-to-tip, high-gloss — **not** straight, **not** loose waves.'
    );
  }
  return (
    '**FLAT IRON finish spec:** **Smooth bone-straight** flat-ironed hair — sleek, high-gloss, **no** waves, **no** crimps, **no** curls.'
  );
}

function bawSalonShapeRefAuthorityBlock(
  salon: 'layers' | 'crimps' | 'flat_iron',
  imageLabel: 'IMAGE 2' | 'IMAGE 3'
): string {
  const salonLabel = bawSalonModePromptLabel(salon);
  return (
    '**' +
    imageLabel +
    ' AUTHORITY (critical):** **' +
    imageLabel +
    '** guides **' +
    salonLabel +
    ' silhouette, curl/crimp scale, part, and layering** — **combine with the full TEXT SPEC below** (both are required). Text spec adds natural **strand detail and volume** the ref alone may not convey. **Drape** follows **DRAPE SIDE** below (override ref drape if conflict). **Do not** default to straight/helmet hair from the canvas. Retint **only** to the catalog swatch color.'
  );
}

function bawSalonModePromptLabel(salon: 'layers' | 'crimps' | 'flat_iron'): string {
  if (salon === 'flat_iron') return 'FLAT IRON';
  if (salon === 'crimps') return 'CRIMPS';
  return 'LAYERS';
}

function bawSalonStylingCameraLine(angle: 'front' | 'left' | 'right'): string {
  const angleLabel = angle === 'left' ? 'LEFT 3/4' : angle === 'right' ? 'RIGHT 3/4' : 'FRONT';
  return `**Camera:** **${angleLabel}** — match **IMAGE 2** head pose, framing, brick background and **FRONTAL SLAYER** logo; edit **hair only** on **IMAGE 1** canvas.`;
}

/**
 * **Two-image** live salon styling: **IMAGE 1** = color-tier preview (swatch), **IMAGE 2** = sharp gray-brick mannequin (scene fidelity).
 */
export function buildBawSalonStylingWithSceneRefPrompt(
  angle: 'front' | 'left' | 'right',
  partSelection: NoirLayersPartSelection,
  salon: 'layers' | 'crimps' | 'flat_iron',
  catalog: CatalogColorForLayersPrompt,
  options?: { includeBangs?: boolean }
): string {
  const hex = catalog.hex.replace(/^#/, '').toUpperCase();
  const salonLabel = bawSalonModePromptLabel(salon);
  const bangsLine = options?.includeBangs ? curtainBangsAddonForSalonPart(partSelection) : null;

  return [
    'You get **two images in order**.',
    '**IMAGE 1** = **output canvas** + **hair color only**: keep **exact** swatch **' +
      catalog.label +
      '** at **#' +
      hex +
      '** from IMAGE 1 — **do not** copy black/jet from IMAGE 2.',
    '**IMAGE 2** = **NOIR gray-brick mannequin** (sharp photograph). Lock **scene fidelity** from IMAGE 2: **mannequin bust material**, **skin tone**, **facial features**, **neck seam**, **brick background**, **lighting**, **shadows**, **camera perspective**, and **FRONTAL SLAYER** chest logo sharpness — **ignore** hair color on IMAGE 2.',
    '**TASK:** On **IMAGE 1** as canvas, apply **' +
      salonLabel +
      '** salon finish with **' +
      partSelection +
      ' part** — reshape **hair only**; rebuild scene pixels to match IMAGE 2 fidelity.',
    bawSalonModeLockBlock(salon),
    bawSalonFinishLookBlock(salon),
    ...(partSelection !== 'MIDDLE' ? [salonPartMustOverrideInputReferenceBlock(partSelection)] : []),
    salonPartDirectionSemanticsBlock(),
    bawSalonOneShoulderDrapeBlock(),
    bawSalonStylingCameraLine(angle),
    ...(bangsLine ? [bangsLine] : []),
    bawFalEditPreserveReferenceBlock(),
    BAW_GPT2_LOGO_AND_HAIR_ONLY_LOCK,
    'Output must be extremely high-quality, crisp and pixel-perfect — **no** downscale, blur, plastic or waxy retexture.',
    'Change **only** **hair** on IMAGE 1 (color from IMAGE 1, scene sharpness from IMAGE 2).',
  ].join(' ');
}

/**
 * **Three-image** live salon styling (preferred when JET BLACK styling ref exists):
 * **IMAGE 1** = color (swatch), **IMAGE 2** = gray-brick (scene), **IMAGE 3** = BAW styling ref (hair shape).
 */
export function buildBawSalonStylingWithSceneAndShapeRefsPrompt(
  angle: 'front' | 'left' | 'right',
  partSelection: NoirLayersPartSelection,
  salon: 'layers' | 'crimps' | 'flat_iron',
  catalog: CatalogColorForLayersPrompt,
  options?: { includeBangs?: boolean }
): string {
  const hex = catalog.hex.replace(/^#/, '').toUpperCase();
  const salonLabel = bawSalonModePromptLabel(salon);
  const bangsLine = options?.includeBangs ? curtainBangsAddonForSalonPart(partSelection) : null;

  return [
    'You get **three images in order**.',
    '**IMAGE 1** = **output canvas** + **hair color only**: keep **exact** swatch **' +
      catalog.label +
      '** at **#' +
      hex +
      '** — **never** copy pigment from IMAGE 2 or IMAGE 3.',
    '**IMAGE 2** = **NOIR gray-brick mannequin** (sharp photograph). **Scene fidelity lock:** mannequin bust, skin, face, neck seam, brick background, lighting, shadows, camera, **FRONTAL SLAYER** logo — match IMAGE 2 sharpness; **ignore** IMAGE 2 hair color.',
    '**IMAGE 3** = **BAW salon styling reference** (**' +
      salonLabel +
      '**, **' +
      partSelection +
      ' part**, JET BLACK). Use IMAGE 3 for **overall shape + finish pattern**; **also** follow the **full TEXT SPEC** below so hair is not flat **helmet** hair. **Never** copy IMAGE 3 color, face, neck, or background. **Drape** must follow **DRAPE SIDE** below (override ref drape if it conflicts).',
    bawSalonNaturalHairAntiHelmetBlock(),
    bawSalonModeLockBlock(salon),
    bawSalonShapeRefAuthorityBlock(salon, 'IMAGE 3'),
    bawSalonFinishLookBlock(salon),
    ...(partSelection !== 'MIDDLE' ? [salonPartMustOverrideInputReferenceBlock(partSelection)] : []),
    salonPartDirectionSemanticsBlock(),
    bawSalonOneShoulderDrapeBlock(),
    bawSalonStylingCameraLine(angle),
    ...(bangsLine ? [bangsLine] : []),
    '=== ' + salonLabel + ' FULL TEXT SPEC (required WITH IMAGE 3 — follow every line below) ===',
    'Apply **both** IMAGE 3 shape reference **and** this text spec. Text spec prevents **helmet hair** / flat molded wigs.',
    buildBawSalonColorTierTextSpec(angle, partSelection, salon, catalog, options),
    bawFalEditPreserveReferenceBlock(),
    BAW_GPT2_LOGO_AND_HAIR_ONLY_LOCK,
    'Output must be extremely high-quality, crisp and pixel-perfect — **no** downscale, blur, plastic or waxy retexture.',
    'Composite: **IMAGE 1** canvas + **IMAGE 1** hair color + **IMAGE 2** scene fidelity + **IMAGE 3** shape guide + **TEXT SPEC** natural finish (**' +
      salonLabel +
      '**).',
  ].join(' ');
}

function bawSalonFrontAnchorSideSceneLockBlock(angle: 'left' | 'right'): string {
  const angleLabel = angle === 'left' ? 'LEFT 3/4' : 'RIGHT 3/4';
  const handedness =
    angle === 'left'
      ? '**LEFT 3/4 check:** mannequin nose/temple aims **toward the image LEFT edge** — **NOT** a front view; **NOT** right 3/4; **NOT** a mirrored/wrong-handed 3/4.'
      : '**RIGHT 3/4 check:** mannequin nose/temple aims **toward the image RIGHT edge** — **NOT** a front view; **NOT** left 3/4; **NOT** a mirrored/wrong-handed 3/4.';
  return (
    '**SCENE LOCK (' +
    angleLabel +
    ' — critical):** **IMAGE 2** defines the **only** allowed **camera angle**, **head pose**, **framing**, **brick background**, **lighting**, **shadows**, and **FRONTAL SLAYER** logo placement. Rebuild the output photograph to **match IMAGE 2** pixel-for-pixel on scene/bust — **edit hair only**. **FORBIDDEN:** front-facing composition; **FORBIDDEN:** wrong 3/4 handedness; **FORBIDDEN:** relighting or reframing. ' +
    handedness
  );
}

/** Minimal side-view supplement when **IMAGE 1** is the canonical FRONT (M) styled output — avoids re-rolling an independent L/R style from the full color-tier text spec. */
function buildBawSalonFrontAnchorSideSupplement(
  angle: 'left' | 'right',
  partSelection: NoirLayersPartSelection,
  salon: 'layers' | 'crimps' | 'flat_iron',
  options?: { includeBangs?: boolean }
): string {
  const salonLabel = bawSalonModePromptLabel(salon);
  const bangsLine = options?.includeBangs ? curtainBangsAddonForSalonPart(partSelection) : null;
  const layersWave =
    salon === 'layers' ? bawLayersUniformWaveTextureBlock() : null;
  return [
    '**SIDE VIEW HAIR RULE (IMAGE 1 front lock):** **IMAGE 1** is the **already-styled FRONT (M)** for this **' +
      salonLabel +
      '** + **' +
      partSelection +
      ' part**. **Copy this exact hairstyle identity** onto **IMAGE 2**\'s **' +
      (angle === 'left' ? 'LEFT 3/4' : 'RIGHT 3/4') +
      '** camera — **same** wave/crimp **pattern and scale**, **same** part line, **same** layering, **same** drape. **FORBIDDEN:** inventing a **new similar** hairstyle; **FORBIDDEN:** a different curl/wave family vs IMAGE 1.',
    bawSalonModeLockBlock(salon),
    bawSalonFinishLookBlock(salon),
    ...(layersWave ? [layersWave] : []),
    ...(partSelection !== 'MIDDLE' ? [salonPartMustOverrideInputReferenceBlock(partSelection)] : []),
    salonPartDirectionSemanticsBlock(),
    bawSalonOneShoulderDrapeBlock(),
    bawSalonFrontAnchorSideSceneLockBlock(angle),
    ...(bangsLine ? [bangsLine] : []),
  ].join(' ');
}

/**
 * **Side angles (L/R)** when **FRONT (M)** styled output already exists in Storage (or was just generated):
 * **IMAGE 1** = **canonical FRONT (M)** styled output (hairstyle + color identity),
 * **IMAGE 2** = gray-brick **side** pose (scene/lighting/camera lock),
 * optional **IMAGE 3** = JET BLACK styling ref (supplementary texture only — subordinate to IMAGE 1).
 */
export function buildBawSalonStylingWithFrontAnchorPrompt(
  angle: 'left' | 'right',
  partSelection: NoirLayersPartSelection,
  salon: 'layers' | 'crimps' | 'flat_iron',
  catalog: CatalogColorForLayersPrompt,
  options?: { includeBangs?: boolean; hasStylingShapeRef?: boolean }
): string {
  const hex = catalog.hex.replace(/^#/, '').toUpperCase();
  const salonLabel = bawSalonModePromptLabel(salon);
  const angleLabel = angle === 'left' ? 'LEFT 3/4' : 'RIGHT 3/4';
  const imageCount = options?.hasStylingShapeRef ? 3 : 2;
  const stylingRefLine = options?.hasStylingShapeRef
    ? '**IMAGE 3** = **BAW salon styling reference** (**' +
      salonLabel +
      '**, **' +
      partSelection +
      ' part**, JET BLACK) — **supplementary texture hint only**; **IMAGE 1** (front output) is the **hairstyle identity lock**. Never copy IMAGE 3 color or scene.'
    : null;

  return [
    'You get **' + imageCount + ' images in order**.',
    '**IMAGE 1 = CANONICAL FRONT (M) STYLED OUTPUT (hairstyle + color identity lock):** This is the **already-styled FRONT** for this **exact** **' +
      salonLabel +
      '** + **' +
      partSelection +
      ' part** + swatch **' +
      catalog.label +
      '** (**#' +
      hex +
      '**). **Reproduce this exact hairstyle** on the **' +
      angleLabel +
      '** camera from **IMAGE 2** — **same** curl/wave/crimp **pattern and scale**, **same** part line, **same** layering, **same** drape. **FORBIDDEN:** inventing a **new similar** hairstyle.',
    '**IMAGE 2** = **NOIR gray-brick mannequin** (**' +
      angleLabel +
      '** photograph). **Scene fidelity lock:** match **IMAGE 2** head pose, framing, brick, lighting, shadows, **FRONTAL SLAYER** logo — **ignore** IMAGE 2 hair; **do not** copy its hair color.',
    ...(stylingRefLine ? [stylingRefLine] : []),
    bawSalonNaturalHairAntiHelmetBlock(),
    bawSalonFrontAnchorSideSceneLockBlock(angle),
    '=== ' + salonLabel + ' SIDE VIEW (IMAGE 1 front lock — follow every line below) ===',
    buildBawSalonFrontAnchorSideSupplement(angle, partSelection, salon, options),
    bawFalEditPreserveReferenceBlock(),
    BAW_GPT2_LOGO_AND_HAIR_ONLY_LOCK,
    'Output must be extremely high-quality, crisp and pixel-perfect.',
    'Composite: **IMAGE 1** exact FRONT hairstyle identity + **IMAGE 2** exact **' +
      angleLabel +
      '** scene (**' +
      salonLabel +
      '**).',
  ].join(' ');
}

/**
 * **Two-image** fallback when no JET BLACK styling ref in Storage — full text spec + gray-brick scene fidelity.
 */
export function buildBawSalonStylingWithSceneRefAndTextSpecPrompt(
  angle: 'front' | 'left' | 'right',
  partSelection: NoirLayersPartSelection,
  salon: 'layers' | 'crimps' | 'flat_iron',
  catalog: CatalogColorForLayersPrompt,
  options?: { includeBangs?: boolean }
): string {
  const hex = catalog.hex.replace(/^#/, '').toUpperCase();
  const salonLabel = bawSalonModePromptLabel(salon);
  const textSpec = buildBawSalonColorTierTextSpec(angle, partSelection, salon, catalog, options);

  return [
    'You get **two images in order**.',
    '**IMAGE 1** = **output canvas** + **hair color only**: keep **exact** swatch **' +
      catalog.label +
      '** at **#' +
      hex +
      '** from IMAGE 1.',
    '**IMAGE 2** = **NOIR gray-brick mannequin** (sharp photograph). Lock **scene fidelity** from IMAGE 2 — **ignore** IMAGE 2 hair color/texture.',
    '**No styling reference image (IMAGE 3) is attached** — follow the **' +
      salonLabel +
      '** text spec below exactly. **Do not** output straight hair unless **FLAT IRON**.',
    bawSalonNaturalHairAntiHelmetBlock(),
    bawSalonModeLockBlock(salon),
    bawSalonFinishLookBlock(salon),
    '=== ' + salonLabel + ' TEXT SPEC (apply on IMAGE 1 canvas) ===',
    textSpec,
  ].join(' ');
}

/**
 * **Single-pass** salon styling from sharp gray-brick (optional **IMAGE 2** styling ref) — one Fal edit, no color-tier canvas.
 * Enable via **`WIG_PREVIEW_LIVE_SINGLE_PASS_SALON=1`** on the styling API.
 */
export function buildBawSalonSinglePassFromGrayBrickPrompt(
  angle: 'front' | 'left' | 'right',
  partSelection: NoirLayersPartSelection,
  salon: 'layers' | 'crimps' | 'flat_iron',
  catalog: CatalogColorForLayersPrompt,
  options?: { includeBangs?: boolean; hasStylingShapeRef?: boolean }
): string {
  const hex = catalog.hex.replace(/^#/, '').toUpperCase();
  const salonLabel = bawSalonModePromptLabel(salon);
  const bangsLine = options?.includeBangs ? curtainBangsAddonForSalonPart(partSelection) : null;
  const shapeRefLine = options?.hasStylingShapeRef
    ? '**IMAGE 2** = **BAW ' +
      salonLabel +
      ' styling reference** — use for **hair shape + finish pattern**; **also** follow **FULL TEXT SPEC** below (both required). Retint to **#' +
      hex +
      '**; **never** copy IMAGE 2 color or scene. ' +
      bawSalonShapeRefAuthorityBlock(salon, 'IMAGE 2')
    : null;
  const textSpecBlock =
    options?.hasStylingShapeRef
      ? [
          '=== ' + salonLabel + ' FULL TEXT SPEC (required WITH styling ref — follow every line) ===',
          buildBawSalonColorTierTextSpec(angle, partSelection, salon, catalog, options),
        ]
      : [];

  return [
    options?.hasStylingShapeRef
      ? 'You get **two images in order**. **IMAGE 1** = **NOIR gray-brick mannequin** — **output canvas** (lock entire scene from IMAGE 1).'
      : 'You get **one image**. **IMAGE 1** = **NOIR gray-brick mannequin** — **output canvas** (preserve photograph sharpness).',
    '**Hair task (one pass):** Tint all hair **' +
      catalog.label +
      '** at **#' +
      hex +
      '** root-to-tip and apply **' +
      salonLabel +
      '** with **' +
      partSelection +
      ' part** — **only** edit **hair**; **do not** repaint bust, brick, or logo.',
    bawSalonNaturalHairAntiHelmetBlock(),
    bawSalonModeLockBlock(salon),
    bawSalonFinishLookBlock(salon),
    ...(shapeRefLine ? [shapeRefLine] : []),
    ...(partSelection !== 'MIDDLE' ? [salonPartMustOverrideInputReferenceBlock(partSelection)] : []),
    salonPartDirectionSemanticsBlock(),
    bawSalonOneShoulderDrapeBlock(),
    bawSalonStylingCameraLine(angle),
    ...(bangsLine ? [bangsLine] : []),
    ...textSpecBlock,
    bawFalEditPreserveReferenceBlock(),
    BAW_GPT2_LOGO_AND_HAIR_ONLY_LOCK,
    'Output must be extremely high-quality, crisp and pixel-perfect.',
  ].join(' ');
}

/** @deprecated Prefer `buildBawSalonStylingWithSceneAndShapeRefsPrompt` (three-image). */
export function buildBawSalonStylingWithReferencePrompt(
  angle: 'front' | 'left' | 'right',
  partSelection: NoirLayersPartSelection,
  salon: 'layers' | 'crimps' | 'flat_iron',
  catalog: CatalogColorForLayersPrompt,
  options?: { includeBangs?: boolean }
): string {
  return buildBawSalonStylingWithSceneAndShapeRefsPrompt(angle, partSelection, salon, catalog, options);
}

/** **Two-image** bangs-only: color canvas + gray-brick scene fidelity. */
export function buildBangsOnlyWithSceneRefPrompt(
  angle: 'front' | 'left' | 'right',
  catalog: CatalogColorForLayersPrompt
): string {
  const hex = catalog.hex.replace(/^#/, '').toUpperCase();
  const angleConstraint =
    angle === 'left'
      ? '**LEFT 3/4:** add bangs only; keep hair mass and part from IMAGE 1; scene sharpness from IMAGE 2.'
      : angle === 'right'
        ? '**RIGHT 3/4:** add bangs only; keep hair mass and part from IMAGE 1; scene sharpness from IMAGE 2.'
        : '**FRONT:** add curtain bangs only; keep rest of hair layout from IMAGE 1.';

  return [
    'You get **two images in order**.',
    '**IMAGE 1** = **output canvas** — keep **hair color** **' +
      catalog.label +
      '** **#' +
      hex +
      '** and existing length/part layout; **only** add lightly feathered **curtain bangs**.',
    '**IMAGE 2** = **NOIR gray-brick mannequin** — lock **scene fidelity** (bust, brick, logo, lighting) to IMAGE 2 sharpness.',
    angleConstraint,
    bawFalEditPreserveReferenceBlock(),
    BAW_GPT2_LOGO_AND_HAIR_ONLY_LOCK,
    'Output must be extremely high-quality, crisp and pixel-perfect.',
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
    'You get **two images in order**. **IMAGE 1** is the only **output canvas**: same mannequin, brick background, framing, chest logo and **keep the hair color exactly as in image 1** (catalog / customer color).',
    '**IMAGE 2** is a **hair geometry reference only** (middle part, layers, face-framing, volume, silhouette). Copy **only** the **cut, layering and part** from image 2 onto the head in image 1. **Do not** use image 2’s hair color, **do not** swap in image 2’s background and **do not** treat image 2 as a full composite to paste over image 1.',
    angleConstraint,
    bawFalEditPreserveReferenceBlock(),
    'The **FRONTAL SLAYER** chest logo must stay fully legible, same position as in image 1.',
    'Output must be extremely high-quality, crisp and pixel-perfect.',
    'Change **only** the **hair mesh** in image 1 so its **shape** matches the geometry reference; everything else in image 1 stays the same, especially **hair color**.',
  ].join(' ');
}

/** @deprecated Use `buildMiddlePartLayersStylePromptTwoImages(angle)` for per-angle wording. */
export const BAW_MIDDLE_PART_LAYERS_STYLE_PROMPT_TWO_IMAGES = buildMiddlePartLayersStylePromptTwoImages('front');

/** Single-image manual fal (no color base attachment) — “this” = the only image. */
export const BAW_MIDDLE_PART_LAYERS_STYLE_PROMPT_SINGLE_IMAGE = [
  'Recreate this exact mannequin image but change the hair to black #000000.',
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
    'Recreate this exact mannequin image but add lightly feathered curtain bangs to the hairstyle only do NOT change the positioning of the rest of the hair.',
    angleConstraint,
    bawFalEditPreserveReferenceBlock(),
    BAW_GPT2_LOGO_AND_HAIR_ONLY_LOCK,
    'The photo should be extremely high-quality, crisp and pixel-perfect.',
  ].join(' ');
}
