/**
 * BAW live NOIR salon — part **placement** reference photos (not JET BLACK styling shape refs).
 * **UI R / RIGHT part:** groove on **image LEFT** scalp — mirror opposite of **UI L** (**image RIGHT**).
 */

const SUPABASE_LIVE_PREVIEW_PUBLIC_BASE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview';

/** UI R / RIGHT part — front placement guide (part groove on image LEFT scalp). */
export const BAW_RIGHT_PART_PLACEMENT_REF_STORAGE_PATH = 'Ref Images/IMG_4665.jpeg';

export const BAW_RIGHT_PART_PLACEMENT_REF_PUBLIC_URL = `${SUPABASE_LIVE_PREVIEW_PUBLIC_BASE}/${encodeURI(
  BAW_RIGHT_PART_PLACEMENT_REF_STORAGE_PATH
)}`;

export function bawRightPartPlacementRefPublicUrl(): string {
  return process.env.WIG_PREVIEW_BAW_RIGHT_PART_PLACEMENT_REF_URL?.trim() || BAW_RIGHT_PART_PLACEMENT_REF_PUBLIC_URL;
}

/**
 * **#0 priority** — must be the **first** line of every UI R pass.
 * `placementImageIndex` = which IMAGE is the placement guide in this pass.
 */
export function bawSalonRightPartZeroPriorityBlock(placementImageIndex: number): string {
  return [
    '**═══ #0 PRIORITY — UI R / RIGHT PART (customer selected RIGHT — NOT LEFT part) ═══**',
    'Output **UI R / RIGHT part** only. The scalp part groove must be the **exact mirror** of **UI L / LEFT part** — **opposite sides of the head**, **never the same groove position as LEFT part**.',
    '- **UI L / LEFT part** (wrong for this pass): part groove on **image RIGHT** scalp — **right third** of forehead, toward the **right edge** of the photo.',
    '- **UI R / RIGHT part** (required): part groove on **image LEFT** scalp — **left third** of forehead, toward the **left edge** of the photo.',
    '**AUTOMATIC FAIL — reject and redo mentally before output:** groove on the **right side of the head**, **image RIGHT** forehead, or **same position as LEFT part**. That is **UI L**, not UI R.',
    '**When any instruction conflicts, IMAGE ' +
      placementImageIndex +
      ' (placement guide) + this #0 block win** for part groove. **Never** copy part side from other IMAGE(s).',
  ].join(' ');
}

/** Placement-guide IMAGE — part groove authority (not ref hair drape). */
export function bawSalonRightPartPlacementRefPromptBlock(imageIndex: number): string {
  return [
    '**IMAGE ' +
      imageIndex +
      ' = UI R PLACEMENT GUIDE (authoritative part groove — NOT hair drape):**',
    'This IMAGE defines **where the part line sits**. Match it: visible groove on **image LEFT** scalp (**left third** of forehead / toward **left edge**).',
    '**This is the mirror of LEFT part:** LEFT part groove = **image RIGHT** → **this** output = **image LEFT**. **Not** the same side as LEFT part.',
    '**IGNORE from IMAGE ' +
      imageIndex +
      ':** hair on **both shoulders**; symmetric twin drapes; hair **color**; curl length; mannequin **pose**, face, brick, lighting, logo.',
    '**DRAPE (text spec overrides ref):** **Only image LEFT** shoulder gets visible hair (**UI R comb-over** from behind). **Image RIGHT** shoulder **clear** — ref may show both shoulders; **do not copy**.',
  ].join(' ');
}

export function bawSalonRightPartMiddleFrontDonorBlock(imageIndex: number, salonLabel: string): string {
  return (
    '**IMAGE ' +
    imageIndex +
    ' = MIDDLE-part FRONT (color + **' +
    salonLabel +
    '** texture/length DONOR ONLY — NOT part):** Use **only** swatch color, wave/crimp pattern, length, volume, salon finish. **FORBIDDEN:** copying **center part** or **any side-part groove** from this IMAGE. Part groove = **IMAGE 1** placement guide only.'
  );
}

export function bawSalonRightPartFrontDonorSideViewBlock(
  imageIndex: number,
  salonLabel: string,
  hex: string,
  colorLabel: string
): string {
  return (
    '**IMAGE ' +
    imageIndex +
    ' = FRONT styled output (**' +
    salonLabel +
    '**, **' +
    colorLabel +
    '** #' +
    hex +
    ' — texture/color DONOR ONLY):** Borrow curl/wave/crimp **pattern**, **color**, length, volume. **FORBIDDEN:** copying **part groove** from IMAGE ' +
    imageIndex +
    ' — especially if groove reads **image RIGHT** (**UI L / LEFT part**). Part = **IMAGE 2** placement guide only.'
  );
}

/** Replaces generic preserve-reference block on UI R passes — allows hair edit, forbids wrong-side part lock-in. */
export function bawSalonRightPartHairEditLockBlock(): string {
  return [
    'Edit **hair only** on the mannequin scene. Keep bust, face, brick, lighting, logo sharp.',
    '**Do NOT preserve** a **wrong-side part** from any input IMAGE. **UI R** groove on **image LEFT** is mandatory even if another IMAGE shows **image RIGHT** groove.',
    'The **FRONTAL SLAYER** chest logo must stay fully legible.',
  ].join(' ');
}

/** Side-view body lock when gray-brick is IMAGE 1. */
export function bawSalonRightPartSideViewBodyLockBlock(angle: 'left' | 'right'): string {
  const angleLabel = angle === 'left' ? 'LEFT 3/4' : 'RIGHT 3/4';
  const handedness =
    angle === 'left'
      ? 'Nose/temple aims **toward image LEFT edge** — true **LEFT 3/4**.'
      : 'Nose/temple aims **toward image RIGHT edge** — true **RIGHT 3/4**, not front.';
  return (
    '**IMAGE 1 = MANNEQUIN BODY LOCK (' +
    angleLabel +
    ' gray-brick):** Match **IMAGE 1** head turn, neck, shoulders, bust, brick, lighting, shadows, **FRONTAL SLAYER** logo, framing **pixel-for-pixel**. **Ignore IMAGE 1 hair.** **Only** edit hair (part + drape). **FORBIDDEN:** front-facing head; wrong 3/4 handedness. ' +
    handedness
  );
}
